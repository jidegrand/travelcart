import { NextRequest, NextResponse } from 'next/server';
import { searchFlights, analyzePriceMetrics, calculateBuyWaitSignal, getAirlineName } from '@/lib/amadeus';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const adults = parseInt(searchParams.get('adults') || '1');
  const targetPrice = parseFloat(searchParams.get('targetPrice') || '0');

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'Missing required parameters: origin, destination, departureDate' },
      { status: 400 }
    );
  }

  try {
    // Search for flights
    const flights = await searchFlights({
      origin,
      destination,
      departureDate,
      returnDate: returnDate || undefined,
      adults,
      max: 10,
    });

    if (flights.length === 0) {
      return NextResponse.json({ flights: [], priceAnalysis: null, signal: null });
    }

    // Get price analysis for this route
    const priceMetrics = await analyzePriceMetrics(origin, destination, departureDate);

    // Get the cheapest flight
    const cheapestFlight = flights[0];
    const currentPrice = parseFloat(cheapestFlight.price.grandTotal);

    // Calculate days until departure
    const departureDateTime = new Date(departureDate);
    const today = new Date();
    const daysUntilDeparture = Math.ceil(
      (departureDateTime.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate buy/wait signal
    const signal = targetPrice > 0
      ? calculateBuyWaitSignal(currentPrice, targetPrice, daysUntilDeparture, priceMetrics)
      : null;

    // Format flights for response
    const formattedFlights = flights.map((flight) => {
      const outbound = flight.itineraries[0];
      const returnItinerary = flight.itineraries[1];
      const segments = outbound.segments;
      const firstSegment = segments[0];
      const lastSegment = segments[segments.length - 1];

      // Get baggage info
      const baggageInfo = flight.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags;

      return {
        id: flight.id,
        price: {
          total: flight.price.grandTotal,
          currency: flight.price.currency,
          base: flight.price.base,
        },
        outbound: {
          departure: firstSegment.departure,
          arrival: lastSegment.arrival,
          duration: outbound.duration,
          stops: segments.length - 1,
          segments: segments.map((seg) => ({
            carrier: getAirlineName(seg.carrierCode),
            carrierCode: seg.carrierCode,
            flightNumber: `${seg.carrierCode}${seg.number}`,
            departure: seg.departure,
            arrival: seg.arrival,
            duration: seg.duration,
          })),
        },
        return: returnItinerary
          ? {
              departure: returnItinerary.segments[0].departure,
              arrival: returnItinerary.segments[returnItinerary.segments.length - 1].arrival,
              duration: returnItinerary.duration,
              stops: returnItinerary.segments.length - 1,
            }
          : null,
        airline: getAirlineName(flight.validatingAirlineCodes[0]),
        airlineCode: flight.validatingAirlineCodes[0],
        cabin: flight.travelerPricings[0]?.fareDetailsBySegment[0]?.cabin || 'ECONOMY',
        baggage: baggageInfo
          ? baggageInfo.quantity
            ? `${baggageInfo.quantity} bag(s)`
            : `${baggageInfo.weight}${baggageInfo.weightUnit}`
          : 'Check airline policy',
        bookableSeats: (flight as any).numberOfBookableSeats,
      };
    });

    return NextResponse.json({
      flights: formattedFlights,
      priceAnalysis: priceMetrics
        ? {
            isGoodDeal: priceMetrics.quartileRanking === 'FIRST',
            quartile: priceMetrics.quartileRanking,
            priceRange: {
              min: priceMetrics.priceAnalysis.min,
              median: priceMetrics.priceAnalysis.median,
              max: priceMetrics.priceAnalysis.max,
            },
          }
        : null,
      signal,
      meta: {
        origin,
        destination,
        departureDate,
        returnDate,
        daysUntilDeparture,
        searchedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Flight search error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search flights' },
      { status: 500 }
    );
  }
}
