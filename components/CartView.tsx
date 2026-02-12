'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Plus, Plane, Hotel, Car, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';
import FlightDetail from './FlightDetail';
import AddTripModal from './AddTripModal';

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
  last_checked: string;
  priceHistory: number[];
  flight_data: any;
}

// localStorage key
const STORAGE_KEY = 'travelcart_items';

// Load from localStorage
const loadItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

// Save to localStorage
const saveItems = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export default function CartView() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load items from localStorage on mount
  useEffect(() => {
    const loaded = loadItems();
    setItems(loaded);
    setLoading(false);
  }, []);

  // Save items whenever they change
  useEffect(() => {
    if (!loading) {
      saveItems(items);
    }
  }, [items, loading]);

  // Calculate totals
  const totalCurrent = items.reduce((sum, item) => sum + item.current_price * item.travelers, 0);
  const totalBaseline = items.reduce((sum, item) => sum + item.baseline_price * item.travelers, 0);
  const totalSaved = totalBaseline - totalCurrent;
  const readyToBuy = items.filter((i) => i.signal === 'BUY').length;

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get icon for item type
  const getItemIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-6 h-6" />;
      case 'hotel':
        return <Hotel className="w-6 h-6" />;
      case 'car':
        return <Car className="w-6 h-6" />;
      default:
        return <Plane className="w-6 h-6" />;
    }
  };

  // Get signal display
  const getSignalDisplay = (item: CartItem) => {
    if (item.signal === 'BUY') {
      return {
        bg: 'bg-emerald-500',
        text: `🎯 Target hit — Book now!`,
        textColor: 'text-white',
      };
    }
    if (item.signal === 'WAIT') {
      return {
        bg: 'bg-amber-50',
        text: `⏳ Wait — book ${item.optimal_book_window || 'soon'}`,
        textColor: 'text-amber-700',
      };
    }
    return {
      bg: 'bg-blue-50',
      text: '👀 Watching',
      textColor: 'text-blue-700',
    };
  };

  // Mini sparkline component
  const Sparkline = ({ data, trend }: { data: number[]; trend: 'up' | 'down' | 'stable' }) => {
    if (!data || data.length === 0) {
      return (
        <div className="flex items-end gap-0.5 h-8">
          {[1, 2, 3, 4, 5].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-200 rounded-t"
              style={{ height: `${30 + Math.random() * 50}%` }}
            />
          ))}
        </div>
      );
    }

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
      <div className="flex items-end gap-0.5 h-8">
        {data.map((price, i) => {
          const height = ((price - min) / range) * 100;
          const isLast = i === data.length - 1;
          return (
            <div
              key={i}
              className={`flex-1 rounded-t ${
                isLast
                  ? trend === 'down'
                    ? 'bg-emerald-400'
                    : 'bg-red-400'
                  : 'bg-gray-200'
              }`}
              style={{ height: `${Math.max(15, height)}%` }}
            />
          );
        })}
      </div>
    );
  };

  // Add item handler
  const handleAddItem = (newItem: CartItem) => {
    setItems([newItem, ...items]);
    setShowAddModal(false);
  };

  // Update item handler
  const handleUpdateItem = (updatedItem: CartItem) => {
    setItems(items.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
  };

  // Delete item handler
  const handleDeleteItem = (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Remove this item from your cart?')) {
      setItems(items.filter((i) => i.id !== itemId));
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }
    }
  };

  // Refresh prices (simulated for now)
  const handleRefresh = async () => {
    setRefreshing(true);
    // TODO: Call Amadeus API to refresh prices
    await new Promise(r => setTimeout(r, 1500));
    setRefreshing(false);
  };

  // Item card component
  const ItemCard = ({ item }: { item: CartItem }) => {
    const signal = getSignalDisplay(item);
    const trend =
      item.priceHistory && item.priceHistory.length > 1
        ? item.priceHistory[item.priceHistory.length - 1] < item.priceHistory[0]
          ? 'down'
          : 'up'
        : 'stable';

    return (
      <div
        onClick={() => setSelectedItem(item)}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="p-4">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
              {getItemIcon(item.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {item.origin} → {item.destination}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(item.departure_date)}
                    {item.return_date && `–${formatDate(item.return_date)}`}
                    {item.travelers > 1 && ` · ${item.travelers} travelers`}
                  </p>
                </div>
                <div className="text-right flex items-start gap-2">
                  <div>
                    <p className="font-bold text-gray-900">${Math.round(item.current_price)}</p>
                    <p className="text-sm text-gray-400 line-through">${Math.round(item.baseline_price)}</p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteItem(item.id, e)}
                    className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="mt-3">
            <Sparkline data={item.priceHistory} trend={trend} />
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-2 mt-3">
            {item.hold_active && (
              <span className="text-xs bg-violet-100 text-violet-700 px-2 py-1 rounded-full">
                🔒 Held
              </span>
            )}
            {item.calendar_added && (
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                🗓️ 2 reminders
              </span>
            )}
            <span className="text-xs text-gray-400 ml-auto">
              Checked {new Date(item.last_checked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Signal bar */}
        <div
          className={`px-4 py-3 flex items-center justify-between ${signal.bg} ${signal.textColor}`}
        >
          <span className="font-medium text-sm">{signal.text}</span>
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // If an item is selected, show detail view
  if (selectedItem) {
    return (
      <FlightDetail
        item={selectedItem}
        onBack={() => setSelectedItem(null)}
        onUpdate={handleUpdateItem}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">TravelCart</h1>
            <button className="relative p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
          </div>

          {/* AI Status */}
          <div className="bg-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-xl">
              🤖
            </div>
            <div className="flex-1">
              <p className="font-medium">
                {items.length > 0 ? `AI watching ${items.length} item${items.length > 1 ? 's' : ''}` : 'No items yet'}
              </p>
              <p className="text-sm text-indigo-200">
                {items.length > 0 ? 'Checks every 6 hrs' : 'Add a trip to start watching'}
              </p>
            </div>
            {items.length > 0 && (
              <>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                {readyToBuy > 0 && (
                  <div className="text-right">
                    <p className="text-2xl font-bold">{readyToBuy}</p>
                    <p className="text-xs text-indigo-200">Ready to book</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        {/* Empty State */}
        {items.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center mb-6">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Start saving on travel</h2>
            <p className="text-gray-500 mb-6">
              Add a flight and our AI will watch prices 24/7, alerting you when it's the perfect time to book.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add your first trip
            </button>
          </div>
        )}

        {/* Savings Summary */}
        {items.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current best total</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${Math.round(totalCurrent).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Baseline total</p>
                <p className="text-lg text-gray-400 line-through">
                  ${Math.round(totalBaseline).toLocaleString()}
                </p>
              </div>
            </div>
            {totalSaved > 0 && (
              <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <div>
                  <p className="font-semibold text-emerald-800">
                    You're saving ${Math.round(totalSaved).toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-600">
                    {Math.round((totalSaved / totalBaseline) * 100)}% below baseline
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        {items.length > 0 && (
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Add Item Button */}
        {items.length > 0 && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Add flight, hotel, or car</span>
          </button>
        )}
      </div>

      {/* Book All CTA */}
      {readyToBuy > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-gray-900">Ready to book?</p>
                <p className="text-sm text-gray-500">
                  {readyToBuy} of {items.length} items recommend "buy now"
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ${Math.round(totalCurrent).toLocaleString()}
                </p>
                <p className="text-sm text-emerald-600">-${Math.round(totalSaved)} savings</p>
              </div>
            </div>
            <button className="w-full py-4 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
              Book Ready Items ({readyToBuy})
            </button>
          </div>
        </div>
      )}

      {/* Add Trip Modal */}
      {showAddModal && (
        <AddTripModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddItem}
        />
      )}
    </div>
  );
}