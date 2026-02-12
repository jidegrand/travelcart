import React, { useState } from 'react';

const TravelCartApp = () => {
  const [activeScreen, setActiveScreen] = useState('detail');
  const [calendarAdded, setCalendarAdded] = useState(false);
  const [holdActive, setHoldActive] = useState(false);
  const [priceAlertThreshold, setPriceAlertThreshold] = useState(1175);

  const tripData = {
    route: 'Toronto → Lagos',
    dates: 'May 10–18, 2026 · Round trip',
    currentPrice: 1245,
    expectedPrice: 1150,
    bookWindow: 'Mar 8–12',
    fallbackDate: 'Mar 10',
    additionalSavings: 95,
    holdFee: 12,
    holdExpiry: 'Mar 12',
    priceHistory: [
      { week: '4 weeks out', price: 1380 },
      { week: '3 weeks out', price: 1290 },
      { week: '2 weeks out', price: 1150, isSweet: true },
      { week: '1 week out', price: 1420 },
      { week: 'Last minute', price: 1650 },
    ],
    breakdown: {
      baseFare: 1089,
      taxes: 124,
      baggage: 32,
      seatSelection: 0,
      total: 1245,
    },
    features: ['Baggage included', 'Free seat selection', 'Refundable for $50 fee'],
    bestOption: {
      name: 'Ethiopian Airlines direct',
      price: 1245,
    },
    alternatives: [
      { name: 'Royal Air Maroc via Casablanca', price: 1189, tradeoff: '+3hr travel time' },
      { name: 'Delta + Kenya Airways', price: 1312, tradeoff: 'Better cancellation policy' },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-10">
          <div className="flex items-center gap-3">
            <button className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{tripData.route}</h1>
              <p className="text-sm text-gray-500">{tripData.dates}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Wait for Better Price Card */}
          <div className="bg-amber-50 rounded-2xl p-5">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-amber-900">Wait for Better Price</h2>
                <p className="text-sm text-amber-700 mt-1">
                  Prices dropped 8% this week. Historical data suggests another 5-10% drop likely.
                </p>
              </div>
            </div>

            {/* Book Window Card */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Optimal book window</p>
                  <p className="text-2xl font-bold text-gray-900">{tripData.bookWindow}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">Expected price</p>
                  <p className="text-2xl font-bold text-emerald-600">~${tripData.expectedPrice}</p>
                </div>
              </div>
              <div className="bg-emerald-50 text-emerald-700 text-center py-2 px-4 rounded-lg font-medium text-sm">
                Save additional ${tripData.additionalSavings} by waiting
              </div>
            </div>

            {/* Price Curve */}
            <div className="bg-white rounded-xl p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Price Curve (YYZ → LOS)</p>
              
              {/* Gradient Bar */}
              <div className="relative mb-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-400"></div>
                {/* Sweet spot indicator */}
                <div className="absolute top-1/2 left-[40%] -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full"></div>
              </div>
              
              {/* Labels */}
              <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>Today</span>
                <span className="text-emerald-600 font-medium">Sweet spot</span>
                <span>Departure</span>
              </div>

              {/* Price Points */}
              <div className="grid grid-cols-5 gap-1">
                {tripData.priceHistory.map((point, i) => (
                  <div 
                    key={i}
                    className={`text-center p-2 rounded-lg ${
                      point.isSweet 
                        ? 'bg-emerald-50 border-2 border-emerald-400' 
                        : 'bg-gray-50'
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
                <span className="text-xl">🗓️</span>
                <h3 className="font-semibold text-gray-900">Smart Reminders</h3>
              </div>

              {calendarAdded ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
                    <div>
                      <p className="font-medium text-gray-900">Mar 8 · Optimal</p>
                      <p className="text-sm text-gray-500">"Check price — expecting ~$1150"</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</div>
                    <div>
                      <p className="font-medium text-gray-900">Mar 10 · Fallback</p>
                      <p className="text-sm text-gray-500">"Last chance — book today"</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium text-gray-900">Mar 8 · Optimal</p>
                        <p className="text-sm text-gray-500">"Check price — expecting ~$1150"</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium text-gray-900">Mar 10 · Fallback</p>
                        <p className="text-sm text-gray-500">"Last chance — book today"</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCalendarAdded(true)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🗓️</span>
                    Add Both Reminders
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hold This Price */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                <span className="text-lg">🔒</span>
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
                  <span className="font-medium text-violet-900">Price held at ${tripData.currentPrice}</span>
                </div>
                <p className="text-sm text-violet-700">Valid until {tripData.holdExpiry}. If price drops, you'll get the lower price.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <div>
                      <p className="font-medium text-gray-900">Lock in ${tripData.currentPrice}</p>
                      <p className="text-sm text-gray-500">Current price guaranteed until {tripData.holdExpiry}</p>
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
                    <p className="font-bold text-emerald-700">Book at ~${tripData.expectedPrice}</p>
                    <p className="text-xs text-emerald-600">You win 🎉</p>
                  </div>
                  <div className="bg-violet-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-violet-600 mb-1">If price spikes</p>
                    <p className="font-bold text-violet-700">Use ${tripData.currentPrice}</p>
                    <p className="text-xs text-violet-600">You're protected 🛡️</p>
                  </div>
                </div>

                <button 
                  onClick={() => setHoldActive(true)}
                  className="w-full py-4 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>🔒</span>
                    <span>Hold Price for ${tripData.holdFee}</span>
                  </div>
                  <p className="text-sm text-violet-200 font-normal mt-1">Valid until {tripData.holdExpiry}</p>
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
              <span className="text-xl">🔔</span>
              <h3 className="font-bold text-gray-900">Price Drop Alert</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 text-sm">Alert me if price drops below</span>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
                <span className="text-gray-400 mr-1">$</span>
                <input 
                  type="number" 
                  value={priceAlertThreshold}
                  onChange={(e) => setPriceAlertThreshold(e.target.value)}
                  className="w-16 text-gray-900 font-medium focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Why Two Reminders */}
          <div className="bg-amber-50 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">Why two reminders?</h4>
                <p className="text-sm text-amber-800">
                  Prices typically spike 10 days before departure. If the price hasn't dropped by {tripData.fallbackDate}, you should book anyway to avoid paying more.
                </p>
              </div>
            </div>
          </div>

          {/* Data Source */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>📊</span>
            <span>Based on 3 years of Toronto→Lagos pricing data</span>
          </div>

          {/* Book Now Anyway Button */}
          <button className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Book Now Anyway — ${tripData.currentPrice}
          </button>

          {/* True Cost Breakdown */}
          <div className="mt-6">
            <h3 className="font-bold text-gray-900 mb-3">True Cost Breakdown</h3>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Base Fare</span>
                <span className="text-gray-900">${tripData.breakdown.baseFare}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-900">${tripData.breakdown.taxes}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Baggage</span>
                <span className="text-gray-900">${tripData.breakdown.baggage}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-gray-100">
                <span className="text-gray-600">Seat Selection</span>
                <span className="text-gray-900">${tripData.breakdown.seatSelection}</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-semibold text-gray-900">${tripData.breakdown.total}</span>
              </div>
            </div>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mt-3">
              {tripData.features.map((feature, i) => (
                <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-full flex items-center gap-1">
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
                  <p className="font-medium text-gray-900">{tripData.bestOption.name}</p>
                  <p className="text-sm text-emerald-600">Best price found</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">${tripData.bestOption.price}</p>
              </div>
            </div>
          </div>

          {/* Alternatives */}
          <div className="mt-6 pb-8">
            <h3 className="font-bold text-gray-900 mb-3">Alternatives</h3>
            <div className="space-y-3">
              {tripData.alternatives.map((alt, i) => (
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
      </div>
    </div>
  );
};

export default TravelCartApp;
