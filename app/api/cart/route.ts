import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { searchFlights, analyzePriceMetrics, calculateBuyWaitSignal } from '@/lib/amadeus';
import { CartItemInsert } from '@/types/database';

// Demo user UUID (matches the one in schema.sql)
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/cart - Get all cart items for user
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || DEMO_USER_ID;

  try {
    const { data: items, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get price history for each item
    const itemsWithHistory = await Promise.all(
      (items || []).map(async (item) => {
        const { data: history } = await supabase
          .from('price_history')
          .select('price, recorded_at')
          .eq('cart_item_id', item.id)
          .order('recorded_at', { ascending: true })
          .limit(10);

        return {
          ...item,
          priceHistory: history?.map((h) => h.price) || [],
        };
      })
    );

    return NextResponse.json({ items: itemsWithHistory });
  } catch (error: any) {
    console.error('Cart fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || DEMO_USER_ID;

  try {
    const body = await request.json();
    const {
      type,
      origin,
      destination,
      departureDate,
      returnDate,
      travelers,
      flexibleDates,
      targetPrice,
    } = body;

    // Validate required fields
    if (!origin || !destination || !departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Search for current price
    const flights = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate,
      adults: travelers || 1,
      max: 1,
    });

    if (flights.length === 0) {
      return NextResponse.json(
        { error: 'No flights found for this route' },
        { status: 404 }
      );
    }

    const currentPrice = parseFloat(flights[0].price.grandTotal);
    const baselinePrice = currentPrice; // First price seen becomes baseline

    // Calculate suggested target if not provided
    const suggestedTarget = targetPrice || Math.round(currentPrice * 0.88);

    // Get price analysis
    const priceMetrics = await analyzePriceMetrics(origin, destination, departureDate);

    // Calculate days until departure
    const departureDateTime = new Date(departureDate);
    const today = new Date();
    const daysUntilDeparture = Math.ceil(
      (departureDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate signal
    const signalResult = calculateBuyWaitSignal(
      currentPrice,
      suggestedTarget,
      daysUntilDeparture,
      priceMetrics
    );

    // Create cart item
    const newItem: CartItemInsert = {
      user_id: userId,
      type: type || 'flight',
      origin,
      destination,
      departure_date: departureDate,
      return_date: returnDate || null,
      travelers: travelers || 1,
      flexible_dates: flexibleDates || false,
      target_price: suggestedTarget,
      baseline_price: baselinePrice,
      current_price: currentPrice,
      signal: signalResult.signal,
      signal_reason: signalResult.reason,
      confidence: signalResult.confidence,
      expected_price: signalResult.expectedPrice || null,
      optimal_book_window: signalResult.optimalBookWindow || null,
      fallback_date: signalResult.fallbackDate || null,
      flight_data: flights[0] as any,
    };

    const { data: item, error } = await supabase
      .from('cart_items')
      .insert(newItem)
      .select()
      .single();

    if (error) throw error;

    // Record initial price in history
    await supabase.from('price_history').insert({
      cart_item_id: item.id,
      price: currentPrice,
    });

    return NextResponse.json({
      item: {
        ...item,
        priceHistory: [currentPrice],
      },
      suggestedTarget,
    });
  } catch (error: any) {
    console.error('Cart add error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

// PATCH /api/cart - Update cart item (e.g., target price, hold status)
export async function PATCH(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || DEMO_USER_ID;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('cart_items')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== userId) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Map camelCase to snake_case
    const dbUpdates: Record<string, any> = {};
    if (updates.targetPrice !== undefined) dbUpdates.target_price = updates.targetPrice;
    if (updates.holdActive !== undefined) dbUpdates.hold_active = updates.holdActive;
    if (updates.holdPrice !== undefined) dbUpdates.hold_price = updates.holdPrice;
    if (updates.holdFee !== undefined) dbUpdates.hold_fee = updates.holdFee;
    if (updates.holdExpires !== undefined) dbUpdates.hold_expires = updates.holdExpires;
    if (updates.calendarAdded !== undefined) dbUpdates.calendar_added = updates.calendarAdded;

    dbUpdates.updated_at = new Date().toISOString();

    const { data: item, error } = await supabase
      .from('cart_items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error('Cart update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update cart' },
      { status: 500 }
    );
  }
}

// DELETE /api/cart - Remove item from cart
export async function DELETE(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || DEMO_USER_ID;
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });
  }

  try {
    // Verify ownership and delete
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cart delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete from cart' },
      { status: 500 }
    );
  }
}