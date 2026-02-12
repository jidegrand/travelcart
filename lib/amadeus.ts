/**
 * Amadeus API Client
 * Based on amadeus-flight-booking-node and amadeus-flight-price-analysis-django
 */

import Amadeus from 'amadeus';

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_HOSTNAME === 'production' ? 'production' : 'test',
});

// ============================================
// AIRPORT & CITY SEARCH
// ============================================

export interface AirportResult {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
}

export async function searchAirports(keyword: string): Promise<AirportResult[]> {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword,
      subType: 'AIRPORT,CITY',
      'page[limit]': 10,
    });

    return response.data.map((location: any) => ({
      iataCode: location.iataCode,
      name: location.name,
      cityName: location.address?.cityName || location.name,
      countryCode: location.address?.countryCode,
    }));
  } catch (error) {
    console.error('Airport search error:', error);
    throw error;
  }
}

// ============================================
// FLIGHT OFFERS SEARCH
// ============================================

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  children?: number;
  infants?: number;
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  nonStop?: boolean;
  maxPrice?: number;
  max?: number;
}

export interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
    base: string;
    fees: { amount: string; type: string }[];
    grandTotal: string;
  };
  itineraries: {
    duration: string;
    segments: {
      departure: { iataCode: string; terminal?: string; at: string };
      arrival: { iataCode: string; terminal?: string; at: string };
      carrierCode: string;
      number: string;
      aircraft: { code: string };
      duration: string;
      numberOfStops: number;
    }[];
  }[];
  travelerPricings: {
    travelerId: string;
    fareOption: string;
    travelerType: string;
    price: { currency: string; total: string; base: string };
    fareDetailsBySegment: {
      segmentId: string;
      cabin: string;
      fareBasis: string;
      brandedFare?: string;
      class: string;
      includedCheckedBags?: { weight?: number; weightUnit?: string; quantity?: number };
    }[];
  }[];
  validatingAirlineCodes: string[];
  source: string;
}

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  try {
    const searchParams: any = {
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults || 1,
      max: params.max || 10,
    };

    if (params.returnDate) {
      searchParams.returnDate = params.returnDate;
    }
    if (params.children) {
      searchParams.children = params.children;
    }
    if (params.infants) {
      searchParams.infants = params.infants;
    }
    if (params.travelClass) {
      searchParams.travelClass = params.travelClass;
    }
    if (params.nonStop !== undefined) {
      searchParams.nonStop = params.nonStop;
    }
    if (params.maxPrice) {
      searchParams.maxPrice = params.maxPrice;
    }

    const response = await amadeus.shopping.flightOffersSearch.get(searchParams);
    return response.data;
  } catch (error) {
    console.error('Flight search error:', error);
    throw error;
  }
}

// ============================================
// FLIGHT OFFERS PRICE (Confirm availability & price)
// ============================================

export interface PricedFlightOffer extends FlightOffer {
  lastTicketingDate?: string;
  numberOfBookableSeats?: number;
}

export async function priceFlightOffer(flightOffer: FlightOffer): Promise<PricedFlightOffer> {
  try {
    const response = await amadeus.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers: [flightOffer],
        },
      })
    );

    return response.data.flightOffers[0];
  } catch (error) {
    console.error('Flight pricing error:', error);
    throw error;
  }
}

// ============================================
// FLIGHT PRICE ANALYSIS (Is it a good deal?)
// Based on amadeus-flight-price-analysis-django
// ============================================

export interface PriceMetrics {
  amount: string;
  quartileRanking: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH';
  isGoodDeal: boolean;
  priceAnalysis: {
    min: string;
    max: string;
    median: string;
    first: string;
    third: string;
  };
}

export async function analyzePriceMetrics(
  origin: string,
  destination: string,
  departureDate: string,
  currencyCode: string = 'USD'
): Promise<PriceMetrics | null> {
  try {
    const response = await amadeus.analytics.itineraryPriceMetrics.get({
      originIataCode: origin,
      destinationIataCode: destination,
      departureDate,
      currencyCode,
    });

    if (response.data && response.data.length > 0) {
      const metrics = response.data[0];
      const priceMetrics = metrics.priceMetrics;

      // Find the quartile rankings
      const first = priceMetrics.find((p: any) => p.quartileRanking === 'FIRST');
      const median = priceMetrics.find((p: any) => p.quartileRanking === 'MEDIUM');
      const third = priceMetrics.find((p: any) => p.quartileRanking === 'THIRD');

      return {
        amount: first?.amount || '0',
        quartileRanking: 'FIRST',
        isGoodDeal: true,
        priceAnalysis: {
          min: priceMetrics.find((p: any) => p.quartileRanking === 'MINIMUM')?.amount || '0',
          max: priceMetrics.find((p: any) => p.quartileRanking === 'MAXIMUM')?.amount || '0',
          median: median?.amount || '0',
          first: first?.amount || '0',
          third: third?.amount || '0',
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Price analysis error:', error);
    // Return null if price analysis not available for this route
    return null;
  }
}

// ============================================
// CUSTOM: Determine Buy/Wait Signal
// ============================================

export type Signal = 'BUY' | 'WAIT' | 'HOLD';

export interface BuyWaitSignal {
  signal: Signal;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  currentPrice: number;
  targetPrice?: number;
  expectedPrice?: number;
  optimalBookWindow?: string;
  fallbackDate?: string;
}

export function calculateBuyWaitSignal(
  currentPrice: number,
  targetPrice: number,
  daysUntilDeparture: number,
  priceMetrics: PriceMetrics | null,
  priceHistory: number[] = []
): BuyWaitSignal {
  // Rule 1: If current price <= target, BUY immediately
  if (currentPrice <= targetPrice) {
    return {
      signal: 'BUY',
      confidence: 'high',
      reason: `Price hit your target of $${targetPrice}! Book now to lock in savings.`,
      currentPrice,
      targetPrice,
    };
  }

  // Rule 2: If very close to departure (< 10 days), BUY now (prices spike)
  if (daysUntilDeparture < 10) {
    return {
      signal: 'BUY',
      confidence: 'high',
      reason: `Only ${daysUntilDeparture} days until departure. Prices typically spike from here. Book now.`,
      currentPrice,
      targetPrice,
    };
  }

  // Rule 3: If price is in lowest quartile (great deal), BUY
  if (priceMetrics && priceMetrics.quartileRanking === 'FIRST') {
    const medianPrice = parseFloat(priceMetrics.priceAnalysis.median);
    if (currentPrice < medianPrice * 0.85) {
      return {
        signal: 'BUY',
        confidence: 'high',
        reason: `This is in the lowest 25% of prices for this route. Great deal!`,
        currentPrice,
        targetPrice,
      };
    }
  }

  // Rule 4: Check price trend from history
  if (priceHistory.length >= 3) {
    const recentPrices = priceHistory.slice(-3);
    const trend = recentPrices[2] - recentPrices[0];
    const avgChange = trend / 2;

    // If prices rising sharply
    if (avgChange > currentPrice * 0.05) {
      return {
        signal: 'BUY',
        confidence: 'medium',
        reason: `Prices rising ${Math.round((avgChange / currentPrice) * 100)}% recently. Book before they go higher.`,
        currentPrice,
        targetPrice,
      };
    }

    // If prices dropping
    if (avgChange < -currentPrice * 0.03 && daysUntilDeparture > 21) {
      // Calculate expected price and optimal window
      const projectedDrop = Math.abs(avgChange) * 2;
      const expectedPrice = Math.round(currentPrice - projectedDrop);
      
      // Optimal window is typically 2-3 weeks before departure
      const optimalDaysOut = Math.min(daysUntilDeparture - 10, 21);
      const optimalDate = new Date();
      optimalDate.setDate(optimalDate.getDate() + (daysUntilDeparture - optimalDaysOut));

      const fallbackDate = new Date(optimalDate);
      fallbackDate.setDate(fallbackDate.getDate() + 2);

      return {
        signal: 'WAIT',
        confidence: 'medium',
        reason: `Prices dropped ${Math.round(Math.abs((avgChange / currentPrice) * 100))}% recently. More savings likely.`,
        currentPrice,
        targetPrice,
        expectedPrice: Math.max(expectedPrice, targetPrice),
        optimalBookWindow: formatDateRange(optimalDate, fallbackDate),
        fallbackDate: formatDate(fallbackDate),
      };
    }
  }

  // Rule 5: Default - if far out, suggest waiting for sweet spot
  if (daysUntilDeparture > 30) {
    const optimalDate = new Date();
    optimalDate.setDate(optimalDate.getDate() + (daysUntilDeparture - 21));

    const fallbackDate = new Date(optimalDate);
    fallbackDate.setDate(fallbackDate.getDate() + 4);

    // Estimate expected price (10-15% below current if typical pattern)
    const expectedDiscount = priceMetrics ? 0.12 : 0.08;
    const expectedPrice = Math.round(currentPrice * (1 - expectedDiscount));

    return {
      signal: 'WAIT',
      confidence: 'low',
      reason: `Booking ${daysUntilDeparture} days out. Sweet spot is typically 2-3 weeks before departure.`,
      currentPrice,
      targetPrice,
      expectedPrice: Math.max(expectedPrice, targetPrice),
      optimalBookWindow: formatDateRange(optimalDate, fallbackDate),
      fallbackDate: formatDate(fallbackDate),
    };
  }

  // Rule 6: In the sweet spot window (14-21 days out) - check if price is reasonable
  if (daysUntilDeparture >= 14 && daysUntilDeparture <= 21) {
    if (priceMetrics) {
      const thirdQuartile = parseFloat(priceMetrics.priceAnalysis.third);
      if (currentPrice <= thirdQuartile) {
        return {
          signal: 'BUY',
          confidence: 'medium',
          reason: `In optimal booking window. Current price is reasonable for this route.`,
          currentPrice,
          targetPrice,
        };
      }
    }
  }

  // Default: hold pattern
  return {
    signal: 'WAIT',
    confidence: 'low',
    reason: `Price is $${currentPrice - targetPrice} above your target. Watching for drops.`,
    currentPrice,
    targetPrice,
    expectedPrice: targetPrice,
  };
}

// Helper functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { day: 'numeric' });
  return `${startStr}–${endStr}`;
}

// ============================================
// AIRLINE DATA (for display)
// ============================================

export const AIRLINE_NAMES: Record<string, string> = {
  'ET': 'Ethiopian Airlines',
  'KQ': 'Kenya Airways',
  'SA': 'South African Airways',
  'AT': 'Royal Air Maroc',
  'W3': 'Arik Air',
  'DL': 'Delta',
  'UA': 'United',
  'AA': 'American Airlines',
  'BA': 'British Airways',
  'AF': 'Air France',
  'LH': 'Lufthansa',
  'TK': 'Turkish Airlines',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'MS': 'EgyptAir',
  'RW': 'RwandAir',
  'WB': 'RwandAir',
  '5Z': 'Cemair',
  'HF': 'Air Côte d\'Ivoire',
};

export function getAirlineName(code: string): string {
  return AIRLINE_NAMES[code] || code;
}

export default amadeus;
