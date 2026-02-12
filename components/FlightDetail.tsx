'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, Lock, Calendar, Bell, Lightbulb, BarChart3 } from 'lucide-react';

interface CartItem {
  id: string;
  type: 'flight' | 'hotel' | 'car';
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  travelers: number;
  target_price: number;
  baseline_price: number;
  current_price: number;
  signal: 'BUY' | 'WAIT' | 'HOLD';
  signal_reason: string | null;
  confidence: 'high' | 'medium' | 'low';
  expected_price: number | null;
  optimal_book_window: string | null;
  fallback_date: string | null;
  hold_active: boolean;
  calendar_added: boolean;
  priceHistory: number[];
  flight_data: any;
}

interface FlightDetailProps {
  item: CartItem;
  onBack: () => void;
  onUpdate: (item: CartItem) => void;
}

// Helper: Format price with no decimals
const formatPrice = (price: number) => Math.round(price);

// Helper: Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper: Format full date
const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Helper: Add days to date
const addDays = (dateStr: string, days: number) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date;
};

// Helper: Calculate days between dates
const daysBetween = (date1: string, date2: Date) => {
  const d1 = new Date(date1);
  const diff = d1.getTime() - date2.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export default function FlightDetail({ item, onBack, onUpdate }: FlightDetailProps) {
  const [calendarAdded, setCalendarAdded] = useState(item.calendar_added);
  const [holdActive, setHoldActive] = useState(item.hold_active);
  const [priceAlertThreshold, setPriceAlertThreshold] = useState(formatPrice(item.target_price * 0.95));

  const isWaitSignal = item.signal === 'WAIT';
  const isBuySignal = item.signal === 'BUY';

  // Calculate dynamic dates
  const calculatedDates = useMemo(() => {
    const today = new Date();
    const departure = new Date(item.departure_date);
    const daysUntilDeparture = daysBetween(item.departure_date, today);
    
    // Optimal booking is typically 2-3 weeks before departure
    // But not less than 10 days out (prices spike after that)
    const optimalDaysOut = Math.max(14, Math.min(21, daysUntilDeparture - 10));
    const optimalDate = addDays(item.departure_date, -optimalDaysOut);
    
    // Fallback is 2-3 days after optimal
    const fallbackDate = addDays(item.departure_date, -(optimalDaysOut - 3));
    
    // Hold expires at fallback date
    const holdExpiry = fallbackDate;
    
    // If optimal date is in the past, use tomorrow
    const finalOptimalDate = optimalDate < today ? addDays(today.toISOString(), 1) : optimalDate;
    const finalFallbackDate = fallbackDate < today ? addDays(today.toISOString(), 3) : fallbackDate;
    
    return {
      optimalDate: finalOptimalDate,
      fallbackDate: finalFallbackDate,
      holdExpiry: finalFallbackDate,
      daysUntilDeparture,
      optimalWindowStr: `${formatDate(finalOptimalDate.toISOString())}–${finalFallbackDate.getDate()}`,
    };
  }, [item.departure_date]);

  // Calculate dynamic price curve based on baseline
  const priceCurve = useMemo(() => {
    const baseline = item.baseline_price;
    return [
      { week: '4 weeks out', price: formatPrice(baseline * 1.0) },
      { week: '3 weeks out', price: formatPrice(baseline * 0.93) },
      { week: '2 weeks out', price: formatPrice(baseline * 0.85), isSweet: true },
      { week: '1 week out', price: formatPrice(baseline * 1.05) },
      { week: 'Last minute', price: formatPrice(baseline * 1.22) },
    ];
  }, [item.baseline_price]);

  // Calculate breakdown from current price (estimated split)
  const breakdown = useMemo(() => {
    const total = item.current_price;
    return {
      baseFare: formatPrice(total * 0.82),
      taxes: formatPrice(total * 0.12),
      baggage: formatPrice(total * 0.04),
      seatSelection: 0,
      total: formatPrice(total),
    };
  }, [item.current_price]);

  const features = ['Baggage included', 'Free seat selection', 'Refundable for $50 fee'];

  const alternatives = useMemo(() => [
    { 
      name: 'Royal Air Maroc via Casablanca', 
      price: formatPrice(item.current_price * 0.95), 
      tradeoff: '+3hr travel time' 
    },
    { 
      name: 'Delta + Kenya Airways', 
      price: formatPrice(item.current_price * 1.05), 
      tradeoff: 'Better cancellation policy' 
    },
  ], [item.current_price]);

  const handleAddCalendar = () => {
    setCalendarAdded(true);
    onUpdate({ ...item, calendar_added: true });
    
    // In production, generate .ics file here
    // For now, just update state
  };

  const handleHoldPrice = () => {
    setHoldActive(true);
    onUpdate({ ...item, hold_active: true });
  };

  // Calculate savings
  const expectedPrice = item.expected_price || item.target_price;
  const potentialSavings = formatPrice(item.current_price - expectedPrice);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="text-gray-400 hover:text-gray-600">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {item.origin} → {item.destination}
              </h1>
              <p className="text-sm text-gray-500">
                {formatFullDate(item.departure_date)}
                {item.return_date && ` – ${formatFullDate(item.return_date)}`} · Round trip
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Wait for Better Price Card (shown for WAIT signal) */}
          {isWaitSignal && (
            <div className="bg-amber-50 rounded-2xl p-5">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏳</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-amber-900">Wait for Better Price</h2>
                  <p className="text-sm text-amber-700 mt-1">{item.signal_reason}</p>
                </div>
              </div>

              {/* Book Window Card */}
              <div className="bg-white rounded-xl p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Optimal book window</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {item.optimal_book_window || calculatedDates.optimalWindowStr}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Expected price</p>
                    <p className="text-2xl font-bold text-emerald-600">~${formatPrice(expectedPrice)}</p>
                  </div>
                </div>
                {potentialSavings > 0 && (
                  <div className="bg-emerald-50 text-emerald-700 text-center py-2 px-4 rounded-lg font-medium text-sm">
                    Save additional ${potentialSavings} by waiting
                  </div>
                )}
              </div>

              {/* Price Curve */}
              <div className="bg-white rounded-xl p-4 mb-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Price Curve ({item.origin} → {item.destination})
                </p>

                {/* Gradient Bar */}
                <div className="relative mb-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400" />
                  <div className="absolute top-1/2 left-[40%] -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full" />
                </div>

                {/* Labels */}
                <div className="flex justify-between text-xs text-gray-500 mb-4">
                  <span>Today</span>
                  <span className="text-emerald-600 font-medium">Sweet spot</span>
                  <span>Departure</span>
                </div>

                {/* Price Points */}
                <div className="grid grid-cols-5 gap-1">
                  {priceCurve.map((point, i) => (
                    <div
                      key={i}
                      className={`text-center p-2 rounded-lg ${
                        point.isSweet ? 'bg-emerald-50 border-2 border-emerald-400' : 'bg-gray-50'
                      }`}
                    >
                      <p className={`font-bold text-sm ${point.isSweet ? 'text-emerald-600' : 'text-gray-900'}`}>
                        ${point.price}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 leading-tight">{point.week}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Smart Reminders */}
              <div className="bg-white rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Smart Reminders</h3>
                </div>

                {calendarAdded ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(calculatedDates.optimalDate.toISOString())} · Optimal
                        </p>
                        <p className="text-sm text-gray-500">
                          "Check price — expecting ~${formatPrice(expectedPrice)}"
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(calculatedDates.fallbackDate.toISOString())} · Fallback
                        </p>
                        <p className="text-sm text-gray-500">"Last chance — book today"</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(calculatedDates.optimalDate.toISOString())} · Optimal
                          </p>
                          <p className="text-sm text-gray-500">
                            "Check price — expecting ~${formatPrice(expectedPrice)}"
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {formatDate(calculatedDates.fallbackDate.toISOString())} · Fallback
                          </p>
                          <p className="text-sm text-gray-500">"Last chance — book today"</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAddCalendar}
                      className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-5 h-5" />
                      Add Both Reminders
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Buy Now Signal */}
          {isBuySignal && (
            <div className="bg-emerald-50 rounded-2xl p-5 border-2 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xl">
                  🎯
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">Target Price Hit!</h2>
                  <p className="text-sm text-emerald-700 mt-1">{item.signal_reason}</p>
                  <p className="text-xs text-emerald-600 mt-2">
                    Confidence: {item.confidence} · Book now before prices rise
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Hold This Price */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Hold This Price</h3>
                <p className="text-sm text-gray-500">Protect against price spikes while you wait</p>
              </div>
            </div>

            {holdActive ? (
              <div className="bg-violet-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-emerald-500">✓</span>
                  <span className="font-medium text-violet-900">
                    Price held at ${formatPrice(item.current_price)}
                  </span>
                </div>
                <p className="text-sm text-violet-700">
                  Valid until {formatDate(calculatedDates.holdExpiry.toISOString())}. 
                  If price drops, you'll get the lower price.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <div>
                      <p className="font-medium text-gray-900">Lock in ${formatPrice(item.current_price)}</p>
                      <p className="text-sm text-gray-500">
                        Current price guaranteed until {formatDate(calculatedDates.holdExpiry.toISOString())}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <div>
                      <p className="font-medium text-gray-900">Still get lower price if it drops</p>
                      <p className="text-sm text-gray-500">Hold doesn't lock you in — only protects you</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <div>
                      <p className="font-medium text-gray-900">Peace of mind</p>
                      <p className="text-sm text-gray-500">Wait for better price without the risk</p>
                    </div>
                  </div>
                </div>

                {/* Outcome boxes */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-emerald-600 mb-1">If price drops</p>
                    <p className="font-bold text-emerald-700">Book at ~${formatPrice(expectedPrice)}</p>
                    <p className="text-xs text-emerald-600">You win 🎉</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-violet-600 mb-1">If price spikes</p>
                    <p className="font-bold text-violet-700">Use ${formatPrice(item.current_price)}</p>
                    <p className="text-xs text-violet-600">You're protected 🛡️</p>
                  </div>
                </div>

                <button
                  onClick={handleHoldPrice}
                  className="w-full py-4 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-5 h-5" />
                    <span>Hold Price for $12</span>
                  </div>
                  <p className="text-sm text-violet-200 font-normal mt-1">
                    Valid until {formatDate(calculatedDates.holdExpiry.toISOString())}
                  </p>
                </button>

                <p className="text-xs text-center text-gray-400 mt-3">
                  Non-refundable · Via Ethiopian Airlines
                </p>
              </>
            )}
          </div>

          {/* Price Drop Alert */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-gray-900">Price Drop Alert</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Alert me if price drops below</span>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-gray-400 mr-1">$</span>
                <input
                  type="number"
                  value={priceAlertThreshold}
                  onChange={(e) => setPriceAlertThreshold(parseInt(e.target.value) || 0)}
                  className="w-16 text-gray-900 font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Why Two Reminders */}
          {isWaitSignal && (
            <div className="bg-amber-50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Why two reminders?</h4>
                  <p className="text-sm text-amber-800">
                    Prices typically spike {Math.min(10, calculatedDates.daysUntilDeparture - 7)} days before departure. 
                    If the price hasn't dropped by {formatDate(calculatedDates.fallbackDate.toISOString())}, 
                    you should book anyway to avoid paying more.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Data Source */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <BarChart3 className="w-4 h-4" />
            <span>Based on 3 years of {item.origin}→{item.destination} pricing data</span>
          </div>

          {/* Book Now Anyway Button */}
          {isWaitSignal && (
            <button className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
              Book Now Anyway — ${formatPrice(item.current_price)}
            </button>
          )}

          {/* True Cost Breakdown */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-3">True Cost Breakdown</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Base Fare</span>
                <span className="text-gray-900">${breakdown.baseFare}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-900">${breakdown.taxes}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Baggage</span>
                <span className="text-gray-900">${breakdown.baggage}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Seat Selection</span>
                <span className="text-gray-900">${breakdown.seatSelection}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">${breakdown.total}</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-3">
              {features.map((feature, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-full flex items-center gap-1"
                >
                  <span className="text-emerald-500">✓</span>
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Best Available */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-3">Best Available</h3>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">Ethiopian Airlines direct</p>
                  <p className="text-sm text-emerald-600">Best price found</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">${formatPrice(item.current_price)}</p>
              </div>
            </div>
          </div>

          {/* Alternatives */}
          <div className="mt-6 pb-8">
            <h3 className="font-bold text-gray-900 mb-3">Alternatives</h3>
            <div className="space-y-3">
              {alternatives.map((alt, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alt.name}</p>
                      <p className="text-sm text-gray-500">{alt.tradeoff}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-900">${alt.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Book Button for BUY signal */}
        {isBuySignal && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <div className="max-w-md mx-auto">
              <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                Book Now — ${formatPrice(item.current_price)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
