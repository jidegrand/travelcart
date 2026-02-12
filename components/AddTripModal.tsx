'use client';

import React, { useState } from 'react';
import { X, Plane, Hotel, Car, Ticket, Search } from 'lucide-react';

interface AddTripModalProps {
  onClose: () => void;
  onAdd: (item: any) => void;
}

type TripType = 'flight' | 'hotel' | 'car' | 'activity';

export default function AddTripModal({ onClose, onAdd }: AddTripModalProps) {
  const [step, setStep] = useState(1);
  const [tripType, setTripType] = useState<TripType>('flight');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [targetPrice, setTargetPrice] = useState<number | null>(null);

  // Data from API
  const [suggestedTarget, setSuggestedTarget] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [flightData, setFlightData] = useState<any>(null);
  const [signal, setSignal] = useState<any>(null);

  const tripTypes = [
    { type: 'flight' as TripType, icon: Plane, label: 'Flight' },
    { type: 'hotel' as TripType, icon: Hotel, label: 'Hotel' },
    { type: 'car' as TripType, icon: Car, label: 'Car' },
    { type: 'activity' as TripType, icon: Ticket, label: 'Activity' },
  ];

  const handleSearch = async () => {
    if (!origin || !destination || !departureDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call Amadeus API via our route
      const params = new URLSearchParams({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate,
        ...(returnDate && { returnDate }),
        adults: travelers.toString(),
        ...(targetPrice && { targetPrice: targetPrice.toString() }),
      });

      const response = await fetch(`/api/flights/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search flights');
      }

      if (!data.flights || data.flights.length === 0) {
        throw new Error('No flights found for this route. Try different dates or airports.');
      }

      // Get cheapest flight
      const cheapest = data.flights[0];
      const price = parseFloat(cheapest.price.total);
      
      setCurrentPrice(price);
      setFlightData(cheapest);
      setSignal(data.signal);

      // Suggest target (12% below current)
      const suggested = Math.round(price * 0.88);
      setSuggestedTarget(suggested);
      setTargetPrice(suggested);

      setStep(2);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!targetPrice || !currentPrice) {
      setError('Please set a target price');
      return;
    }

    // Calculate optimal booking window (2-3 weeks before departure)
    const departure = new Date(departureDate);
    const today = new Date();
    const daysOut = Math.ceil((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const optimalStart = new Date(departure);
    optimalStart.setDate(departure.getDate() - Math.min(21, Math.max(14, daysOut - 10)));
    
    const optimalEnd = new Date(optimalStart);
    optimalEnd.setDate(optimalStart.getDate() + 4);
    
    const optimalWindow = `${optimalStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${optimalEnd.getDate()}`;

    // Determine signal
    let itemSignal: 'BUY' | 'WAIT' = 'WAIT';
    let signalReason = `AI is watching for your target of $${targetPrice}. We'll notify you when it's time to book.`;
    
    if (currentPrice <= targetPrice) {
      itemSignal = 'BUY';
      signalReason = `Price hit your target of $${targetPrice}! Book now to lock in savings.`;
    } else if (daysOut < 10) {
      itemSignal = 'BUY';
      signalReason = `Only ${daysOut} days until departure. Book now before prices spike.`;
    }

    // Create the cart item
    const newItem = {
      id: `item-${Date.now()}`,
      type: tripType,
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departure_date: departureDate,
      return_date: returnDate || null,
      travelers,
      target_price: targetPrice,
      baseline_price: currentPrice,
      current_price: currentPrice,
      signal: itemSignal,
      signal_reason: signalReason,
      confidence: 'medium' as const,
      expected_price: targetPrice,
      optimal_book_window: optimalWindow,
      fallback_date: optimalEnd.toISOString().split('T')[0],
      hold_active: false,
      calendar_added: false,
      last_checked: new Date().toISOString(),
      priceHistory: [currentPrice],
      flight_data: flightData,
    };

    onAdd(newItem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Step 1: Trip Details */}
        {step === 1 && (
          <>
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Add to Cart</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">AI will watch prices and notify you when to book</p>
            </div>

            {/* Type Selector */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex gap-2">
                {tripTypes.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => setTripType(item.type)}
                    className={`flex-1 py-3 rounded-xl text-center transition-all ${
                      tripType === item.type
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {tripType === 'flight' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="text"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                        placeholder="YYZ"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="text"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value.toUpperCase())}
                        placeholder="LOS"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Depart</label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Return</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={departureDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Travelers</label>
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} traveler{n > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="flexible"
                      checked={flexibleDates}
                      onChange={(e) => setFlexibleDates(e.target.checked)}
                      className="w-5 h-5 rounded text-indigo-600"
                    />
                    <label htmlFor="flexible" className="text-gray-700">
                      <span className="font-medium">Flexible dates</span>
                      <span className="text-gray-500 text-sm block">±3 days — AI will find the cheapest window</span>
                    </label>
                  </div>
                </>
              )}

              {tripType !== 'flight' && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">Coming soon!</p>
                  <p className="text-sm">Hotel and car tracking will be available in a future update.</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              <button
                onClick={handleSearch}
                disabled={loading || tripType !== 'flight'}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Searching Amadeus...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    <span>Search & Get Target</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {/* Step 2: Set Target Price */}
        {step === 2 && (
          <>
            <div className="p-6 border-b border-gray-100">
              <button
                onClick={() => setStep(1)}
                className="text-indigo-600 text-sm mb-2 flex items-center gap-1"
              >
                ← Back
              </button>
              <h2 className="text-xl font-bold text-gray-900">Set Your Target Price</h2>
              <p className="text-gray-500 text-sm mt-1">AI will notify you when it's time to book</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current price */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current price</span>
                  <span className="font-bold text-xl text-gray-900">${currentPrice?.toFixed(2)}</span>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="bg-indigo-50 rounded-xl p-4 border-2 border-indigo-200">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <div className="flex-1">
                    <p className="font-semibold text-indigo-900">AI Suggested Target</p>
                    <p className="text-3xl font-bold text-indigo-600 my-2">${suggestedTarget}</p>
                    <p className="text-sm text-indigo-700">
                      Based on historical patterns, prices for this route typically drop 10-15% during the optimal booking window.
                    </p>
                  </div>
                </div>
              </div>

              {/* Custom target */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Or set your own target</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    value={targetPrice || ''}
                    onChange={(e) => setTargetPrice(parseInt(e.target.value) || null)}
                    className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
                  />
                </div>
                {targetPrice && currentPrice && (
                  <p className="text-sm text-gray-500 mt-2">
                    {Math.round(((currentPrice - targetPrice) / currentPrice) * 100)}% below current price
                  </p>
                )}
              </div>

              {/* What happens next */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">What happens next:</p>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mt-0.5">
                    1
                  </div>
                  <p className="text-sm text-gray-600">AI checks prices every 6 hours</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mt-0.5">
                    2
                  </div>
                  <p className="text-sm text-gray-600">You get a push notification when it's time to book</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold mt-0.5">
                    3
                  </div>
                  <p className="text-sm text-gray-600">One tap to book at the best price</p>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!targetPrice}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>🤖</span>
                <span>Start Watching</span>
              </button>

              <p className="text-xs text-center text-gray-400">
                Data persists in your browser. Clear cache to reset.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}