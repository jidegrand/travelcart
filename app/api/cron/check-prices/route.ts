/**
 * Price Check Cron Job
 * 
 * This endpoint is called every 6 hours by Vercel Cron to:
 * 1. Fetch current prices for all active cart items
 * 2. Update price history
 * 3. Recalculate buy/wait signals
 * 4. Create notifications when triggers fire
 * 
 * Set up in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-prices",
 *     "schedule": "0 4,10,16,22 * * *"
 *   }]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { searchFlights, analyzePriceMetrics, calculateBuyWaitSignal } from '@/lib/amadeus';

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = {
    checked: 0,
    updated: 0,
    notifications: 0,
    errors: [] as string[],
  };

  try {
    // Get all active cart items with departure date in the future
    const { data: items, error } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .gte('departure_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items to check', results });
    }

    // Process each item
    for (const item of items) {
      results.checked++;

      try {
        // Fetch current price
        const flights = await searchFlights({
          origin: item.origin,
          destination: item.destination,
          departureDate: item.departure_date,
          returnDate: item.return_date || undefined,
          adults: item.travelers,
          max: 1,
        });

        if (flights.length === 0) {
          results.errors.push(`No flights found for ${item.id}`);
          continue;
        }

        const newPrice = parseFloat(flights[0].price.grandTotal);
        const oldPrice = item.current_price;

        // Get price history for trend analysis
        const { data: history } = await supabaseAdmin
          .from('price_history')
          .select('price')
          .eq('cart_item_id', item.id)
          .order('recorded_at', { ascending: false })
          .limit(5);

        const priceHistory = history?.map((h) => h.price) || [];
        priceHistory.unshift(newPrice); // Add new price at the start

        // Get price metrics
        const priceMetrics = await analyzePriceMetrics(
          item.origin,
          item.destination,
          item.departure_date
        );

        // Calculate days until departure
        const departureDate = new Date(item.departure_date);
        const today = new Date();
        const daysUntilDeparture = Math.ceil(
          (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Calculate new signal
        const signal = calculateBuyWaitSignal(
          newPrice,
          item.target_price,
          daysUntilDeparture,
          priceMetrics,
          priceHistory.slice().reverse()
        );

        // Record price in history
        await supabaseAdmin.from('price_history').insert({
          cart_item_id: item.id,
          price: newPrice,
          seats_available: (flights[0] as any).numberOfBookableSeats,
        });

        // Update cart item
        await supabaseAdmin
          .from('cart_items')
          .update({
            current_price: newPrice,
            signal: signal.signal,
            signal_reason: signal.reason,
            confidence: signal.confidence,
            expected_price: signal.expectedPrice || null,
            optimal_book_window: signal.optimalBookWindow || null,
            fallback_date: signal.fallbackDate || null,
            last_checked: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        results.updated++;

        // Check notification triggers
        const notifications = [];

        // Trigger 1: Target price hit
        if (newPrice <= item.target_price && oldPrice > item.target_price) {
          notifications.push({
            user_id: item.user_id,
            cart_item_id: item.id,
            type: 'target_hit' as const,
            title: `🎯 ${item.origin}→${item.destination} hit your target!`,
            body: `$${newPrice} — Book now before it rises`,
            urgency: 'high' as const,
          });
        }

        // Trigger 2: Significant price drop (>5%)
        const dropPercent = ((oldPrice - newPrice) / oldPrice) * 100;
        if (dropPercent >= 5 && newPrice > item.target_price) {
          notifications.push({
            user_id: item.user_id,
            cart_item_id: item.id,
            type: 'price_drop' as const,
            title: `📉 ${item.origin}→${item.destination} dropped ${Math.round(dropPercent)}%`,
            body: `Now $${newPrice} (was $${oldPrice}). Getting closer to target.`,
            urgency: 'medium' as const,
          });
        }

        // Trigger 3: Price spike warning (>8% increase)
        const spikePercent = ((newPrice - oldPrice) / oldPrice) * 100;
        if (spikePercent >= 8) {
          notifications.push({
            user_id: item.user_id,
            cart_item_id: item.id,
            type: 'spike_warning' as const,
            title: `⚠️ ${item.origin}→${item.destination} price spiking`,
            body: `Up ${Math.round(spikePercent)}% to $${newPrice}. Book now or hold price.`,
            urgency: 'high' as const,
          });
        }

        // Trigger 4: Low seats warning
        const seatsLeft = (flights[0] as any).numberOfBookableSeats;
        if (seatsLeft && seatsLeft < 5) {
          notifications.push({
            user_id: item.user_id,
            cart_item_id: item.id,
            type: 'low_seats' as const,
            title: `🔥 Only ${seatsLeft} seats left at $${newPrice}`,
            body: `${item.origin}→${item.destination} selling fast at this price.`,
            urgency: 'high' as const,
          });
        }

        // Trigger 5: Fallback date reached
        if (item.fallback_date) {
          const fallbackDate = new Date(item.fallback_date);
          const todayStr = new Date().toISOString().split('T')[0];
          const fallbackStr = fallbackDate.toISOString().split('T')[0];
          
          if (todayStr === fallbackStr) {
            notifications.push({
              user_id: item.user_id,
              cart_item_id: item.id,
              type: 'fallback' as const,
              title: `⏰ Last chance: ${item.origin}→${item.destination}`,
              body: `Book today at $${newPrice}. Prices typically spike from here.`,
              urgency: 'high' as const,
            });
          }
        }

        // Insert notifications (with throttling - check last notification time)
        for (const notif of notifications) {
          // Check if we already sent this type of notification today
          const { data: recentNotif } = await supabaseAdmin
            .from('notifications')
            .select('id')
            .eq('cart_item_id', item.id)
            .eq('type', notif.type)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .limit(1);

          // Only send if no recent notification of same type (unless urgent)
          if (!recentNotif?.length || notif.urgency === 'high') {
            await supabaseAdmin.from('notifications').insert(notif);
            results.notifications++;
          }
        }
      } catch (itemError: any) {
        results.errors.push(`Error processing ${item.id}: ${itemError.message}`);
      }

      // Add a small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return NextResponse.json({
      message: 'Price check complete',
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error.message || 'Cron job failed', results },
      { status: 500 }
    );
  }
}
