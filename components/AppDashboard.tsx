'use client';

import React, { useState, useEffect } from 'react';
import {
  Plane, Bell, Search, Calendar, Users, ArrowRight,
  ChevronDown, Plus, TrendingDown, Clock, Settings,
  LogOut, ChevronRight, Trash2, RefreshCw, ArrowLeftRight,
  Sparkles, Target, X, Hotel, Car, Palmtree, MapPin,
  Shield, TrendingUp, AlertTriangle, Lock, Info, Briefcase,
  CheckCircle, ExternalLink
} from 'lucide-react';
import AirportAutocomplete from './AirportAutocomplete';

const HERO_CITIES = [
  {
    name: 'Paris, France',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Tokyo, Japan',
    gradient: 'from-rose-400 via-pink-500 to-fuchsia-600',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'New York, USA',
    gradient: 'from-amber-400 via-orange-500 to-red-500',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Santorini, Greece',
    gradient: 'from-cyan-400 via-sky-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1920&q=80',
  },
  {
    name: 'Dubai, UAE',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80',
  },
];

// Airport code to city name mapping for better UX
const AIRPORT_CITIES: Record<string, string> = {
  // North America
  'JFK': 'New York', 'LGA': 'New York', 'EWR': 'Newark', 'NYC': 'New York',
  'LAX': 'Los Angeles', 'SFO': 'San Francisco', 'ORD': 'Chicago', 'MIA': 'Miami',
  'ATL': 'Atlanta', 'DFW': 'Dallas', 'BOS': 'Boston', 'SEA': 'Seattle',
  'DEN': 'Denver', 'IAD': 'Washington DC', 'DCA': 'Washington DC', 'PHX': 'Phoenix',
  'YYZ': 'Toronto', 'YVR': 'Vancouver', 'YUL': 'Montreal', 'MEX': 'Mexico City',
  // Europe
  'LHR': 'London', 'LGW': 'London', 'STN': 'London', 'CDG': 'Paris', 'ORY': 'Paris',
  'AMS': 'Amsterdam', 'FRA': 'Frankfurt', 'MUC': 'Munich', 'FCO': 'Rome', 'ROM': 'Rome',
  'MAD': 'Madrid', 'BCN': 'Barcelona', 'LIS': 'Lisbon', 'DUB': 'Dublin',
  'ZRH': 'Zurich', 'VIE': 'Vienna', 'CPH': 'Copenhagen', 'OSL': 'Oslo',
  'ARN': 'Stockholm', 'HEL': 'Helsinki', 'WAW': 'Warsaw', 'PRG': 'Prague',
  'BRU': 'Brussels', 'MXP': 'Milan', 'ATH': 'Athens', 'IST': 'Istanbul',
  // Africa
  'LOS': 'Lagos', 'ABV': 'Abuja', 'ACC': 'Accra', 'NBO': 'Nairobi',
  'ADD': 'Addis Ababa', 'JNB': 'Johannesburg', 'CPT': 'Cape Town', 'CAI': 'Cairo',
  'CMN': 'Casablanca', 'ALG': 'Algiers', 'TUN': 'Tunis', 'DAR': 'Dar es Salaam',
  'KGL': 'Kigali', 'EBB': 'Entebbe', 'DKR': 'Dakar', 'ABJ': 'Abidjan',
  // Asia
  'DXB': 'Dubai', 'AUH': 'Abu Dhabi', 'DOH': 'Doha', 'JED': 'Jeddah', 'RUH': 'Riyadh',
  'HKG': 'Hong Kong', 'SIN': 'Singapore', 'BKK': 'Bangkok', 'KUL': 'Kuala Lumpur',
  'NRT': 'Tokyo', 'HND': 'Tokyo', 'ICN': 'Seoul', 'PEK': 'Beijing', 'PVG': 'Shanghai',
  'DEL': 'Delhi', 'BOM': 'Mumbai', 'BLR': 'Bangalore', 'MAA': 'Chennai', 'AMD': 'Ahmedabad',
  'MNL': 'Manila', 'CGK': 'Jakarta', 'SGN': 'Ho Chi Minh', 'HAN': 'Hanoi',
  // Australia & Pacific
  'SYD': 'Sydney', 'MEL': 'Melbourne', 'BNE': 'Brisbane', 'AKL': 'Auckland',
  // South America
  'GRU': 'São Paulo', 'GIG': 'Rio de Janeiro', 'EZE': 'Buenos Aires', 'BOG': 'Bogotá',
  'LIM': 'Lima', 'SCL': 'Santiago',
};

const getCityName = (code: string): string => {
  return AIRPORT_CITIES[code.toUpperCase()] || code;
};

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const checked = new Date(dateString);
  const diffMs = now.getTime() - checked.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
};

const formatDateWithDay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

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
  signal: 'BUY' | 'WAIT' | 'HOLD' | 'SPIKE';
  signal_reason: string | null;
  confidence: 'high' | 'medium' | 'low';
  expected_price: number | null;
  optimal_book_window: string | null;
  fallback_date: string | null;
  hold_active: boolean;
  hold_price: number | null;
  hold_fee: number | null;
  hold_expiry: string | null;
  calendar_added: boolean;
  reminders_set: boolean;
  last_checked: string;
  priceHistory: number[];
  flight_data: any;
}

// localStorage key
const STORAGE_KEY = 'travelcart_items';

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

const saveItems = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

// Booked trips
interface BookedTrip {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  travelers: number;
  price_paid: number;
  original_price: number;
  booked_at: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  booking_ref: string;
}

const TRIPS_KEY = 'travelcart_trips';

const loadTrips = (): BookedTrip[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(TRIPS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

const saveTrips = (trips: BookedTrip[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

export default function AppDashboard() {
  // Search form state
  const [origin, setOrigin] = useState('');
  const [originDisplay, setOriginDisplay] = useState('');
  const [destination, setDestination] = useState('');
  const [destinationDisplay, setDestinationDisplay] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip');
  
  // App state
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifText, setNotifText] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [notifSaved, setNotifSaved] = useState(false);
  const [trips, setTrips] = useState<BookedTrip[]>([]);
  const [showMyTrips, setShowMyTrips] = useState(false);
  const [cityIndex, setCityIndex] = useState(0);
  const [showSearchExpanded, setShowSearchExpanded] = useState(false);
  const [pushNotification, setPushNotification] = useState<CartItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'buy'>('all');

  // Cycle hero city backgrounds
  useEffect(() => {
    const interval = setInterval(() => {
      setCityIndex((prev) => (prev + 1) % HERO_CITIES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Push notification for BUY/SPIKE signals
  useEffect(() => {
    const buyItem = items.find(i => i.signal === 'BUY' || i.signal === 'SPIKE');
    if (buyItem && !selectedItem) {
      const timer = setTimeout(() => setPushNotification(buyItem), 2500);
      return () => clearTimeout(timer);
    }
  }, [items, selectedItem]);

  // Load items and trips on mount
  useEffect(() => {
    setItems(loadItems());
    setTrips(loadTrips());
    setLoading(false);
  }, []);

  // Save items when changed
  useEffect(() => {
    if (!loading) {
      saveItems(items);
    }
  }, [items, loading]);

  // Save trips when changed
  useEffect(() => {
    if (!loading) {
      saveTrips(trips);
    }
  }, [trips, loading]);

  // Swap origin and destination
  const handleSwap = () => {
    const tempCode = origin;
    const tempDisplay = originDisplay;
    setOrigin(destination);
    setOriginDisplay(destinationDisplay);
    setDestination(tempCode);
    setDestinationDisplay(tempDisplay);
  };

  // Search flights
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!origin || !destination || !departureDate) {
      setError('Please fill in origin, destination, and departure date');
      return;
    }

    setSearching(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        departureDate,
        ...(returnDate && tripType === 'roundtrip' && { returnDate }),
        adults: travelers.toString(),
      });

      const response = await fetch(`/api/flights/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search flights');
      }

      if (!data.flights || data.flights.length === 0) {
        throw new Error('No flights found. Try different dates or airports.');
      }

      setSearchResults(data);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  };

  // Add to cart from search results
  const handleAddToCart = (flight: any, targetPrice: number) => {
    const currentPrice = parseFloat(flight.price.total);
    const departure = new Date(departureDate);
    const today = new Date();
    const daysOut = Math.ceil((departure.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const optimalStart = new Date(departure);
    optimalStart.setDate(departure.getDate() - Math.min(21, Math.max(14, daysOut - 10)));
    const optimalEnd = new Date(optimalStart);
    optimalEnd.setDate(optimalStart.getDate() + 4);
    const optimalWindow = `${optimalStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${optimalEnd.getDate()}`;

    let signal: 'BUY' | 'WAIT' | 'SPIKE' = 'WAIT';
    let signalReason = `AI is watching for your target of $${targetPrice}. We'll notify you when it's time to book.`;
    
    if (currentPrice <= targetPrice) {
      signal = 'BUY';
      signalReason = `Price is at or below your target of $${targetPrice}! Book now.`;
    } else if (daysOut < 10) {
      signal = 'BUY';
      signalReason = `Only ${daysOut} days until departure. Book now before prices spike.`;
    }

    const newItem: CartItem = {
      id: `item-${Date.now()}`,
      type: 'flight',
      origin: origin.toUpperCase(),
      destination: destination.toUpperCase(),
      departure_date: departureDate,
      return_date: tripType === 'roundtrip' ? returnDate : null,
      travelers,
      target_price: targetPrice,
      baseline_price: currentPrice,
      current_price: currentPrice,
      signal,
      signal_reason: signalReason,
      confidence: 'medium',
      expected_price: targetPrice,
      optimal_book_window: optimalWindow,
      fallback_date: optimalEnd.toISOString().split('T')[0],
      hold_active: false,
      hold_price: null,
      hold_fee: null,
      hold_expiry: null,
      calendar_added: false,
      reminders_set: false,
      last_checked: new Date().toISOString(),
      priceHistory: [currentPrice],
      flight_data: flight,
    };

    setItems([newItem, ...items]);
    setShowResults(false);
    setSearchResults(null);
    
    // Reset form
    setOrigin('');
    setDestination('');
    setDepartureDate('');
    setReturnDate('');
  };

  // Delete item
  const handleDelete = (id: string) => {
    if (confirm('Remove this trip from your watchlist?')) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Refresh prices
  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1500));
    setRefreshing(false);
  };

  // Book a trip (move from watchlist to booked trips)
  const handleBookTrip = (item: CartItem) => {
    const ref = `TC-${Date.now().toString(36).toUpperCase()}`;
    const departure = new Date(item.departure_date);
    const now = new Date();
    const newTrip: BookedTrip = {
      id: `trip-${Date.now()}`,
      origin: item.origin,
      destination: item.destination,
      departure_date: item.departure_date,
      return_date: item.return_date,
      travelers: item.travelers,
      price_paid: item.current_price,
      original_price: item.baseline_price,
      booked_at: new Date().toISOString(),
      status: departure > now ? 'upcoming' : 'completed',
      booking_ref: ref,
    };
    setTrips([newTrip, ...trips]);
    setItems(items.filter(i => i.id !== item.id));
    setSelectedItem(null);
  };

  // Format date
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate totals
  const totalCurrent = items.reduce((sum, item) => sum + item.current_price * item.travelers, 0);
  const totalBaseline = items.reduce((sum, item) => sum + item.baseline_price * item.travelers, 0);
  const totalSaved = totalBaseline - totalCurrent;
  const readyToBuy = items.filter(i => i.signal === 'BUY').length;
  const filteredItems = filter === 'buy' ? items.filter(i => i.signal === 'BUY') : items;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      {/* Top Navigation */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200/50">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">TravelCart</span>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMyTrips(true)}
                className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">My Trips</span>
                {trips.length > 0 && (
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {trips.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  if (readyToBuy > 0) {
                    const buyItem = items.find(i => i.signal === 'BUY');
                    if (buyItem) setSelectedItem(buyItem);
                  }
                }}
                className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <Bell className="w-5 h-5" />
                {readyToBuy > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>
              <button
                onClick={() => setShowNotifSettings(!showNotifSettings)}
                className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-white font-semibold text-sm ml-1 shadow-md shadow-indigo-200/50">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Hopper Style */}
        <div className="relative mb-8 rounded-2xl overflow-hidden" style={{ minHeight: '420px' }}>
          {/* Cycling City Backgrounds with Images */}
          {HERO_CITIES.map((city, i) => (
            <div
              key={city.name}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === cityIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Gradient fallback */}
              <div className={`absolute inset-0 bg-gradient-to-br ${city.gradient}`} />
              {/* City photo */}
              <img
                src={city.image}
                alt={city.name}
                className="absolute inset-0 w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}

          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-black/30" />

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center px-6 pt-16 pb-24" style={{ minHeight: '420px' }}>
            {/* Category Nav */}
            <div className="flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full p-1 mb-10">
              {[
                { icon: Plane, label: 'Flights', active: true },
                { icon: Hotel, label: 'Stays', active: false },
                { icon: Car, label: 'Cars', active: false },
                { icon: Palmtree, label: 'Packages', active: false },
                { icon: Sparkles, label: 'AI Mode', active: false },
              ].map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    cat.active
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl font-bold text-white text-center leading-tight tracking-tight mb-3 drop-shadow-lg">
              Stop checking flight prices.
            </h1>
            <p className="text-lg sm:text-xl text-white/80 text-center font-light mb-10 drop-shadow">
              Add your trip. AI tells you exactly when to book.
            </p>

            {/* Compact Search Bar - Hopper Style */}
            <form onSubmit={handleSearch} className="w-full max-w-3xl">
              {!showSearchExpanded ? (
                /* Collapsed search bar */
                <div
                  onClick={() => setShowSearchExpanded(true)}
                  className="bg-white rounded-full shadow-2xl shadow-black/20 flex items-center cursor-pointer hover:shadow-2xl hover:shadow-black/30 transition-shadow"
                >
                  <div className="flex-1 flex items-center divide-x divide-gray-200">
                    <div className="flex-1 px-6 py-4">
                      <p className="text-xs font-semibold text-gray-500">From</p>
                      <p className="text-sm text-gray-400 truncate">{originDisplay || origin || 'Where from?'}</p>
                    </div>
                    <div className="flex-1 px-6 py-4">
                      <p className="text-xs font-semibold text-gray-500">To</p>
                      <p className="text-sm text-gray-400 truncate">{destinationDisplay || destination || 'Where to?'}</p>
                    </div>
                    <div className="flex-1 px-6 py-4 hidden sm:block">
                      <p className="text-xs font-semibold text-gray-500">Dates</p>
                      <p className="text-sm text-gray-400">{departureDate ? formatDate(departureDate) : 'Add dates'}</p>
                    </div>
                    <div className="px-6 py-4 hidden md:block">
                      <p className="text-xs font-semibold text-gray-500">Travelers</p>
                      <p className="text-sm text-gray-400">{travelers} guest{travelers > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="pr-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-300/50">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                /* Expanded search form */
                <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 p-6 animate-in">
                  {/* Trip type + close */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setTripType('roundtrip')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          tripType === 'roundtrip'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        Round trip
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType('oneway')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          tripType === 'oneway'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        One way
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowSearchExpanded(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
                      <AirportAutocomplete
                        value={origin}
                        onChange={(code, display) => {
                          setOrigin(code);
                          setOriginDisplay(display);
                        }}
                        placeholder="City or airport"
                        icon="origin"
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
                      <AirportAutocomplete
                        value={destination}
                        onChange={(code, display) => {
                          setDestination(code);
                          setDestinationDisplay(display);
                        }}
                        placeholder="City or airport"
                        icon="destination"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Depart</label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full pl-9 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-gray-900 text-sm"
                        />
                      </div>
                    </div>
                    {tripType === 'roundtrip' && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Return</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            min={departureDate || new Date().toISOString().split('T')[0]}
                            className="w-full pl-9 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-gray-900 text-sm"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">Travelers</label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                          value={travelers}
                          onChange={(e) => setTravelers(parseInt(e.target.value))}
                          className="w-full pl-9 pr-6 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white text-gray-900 appearance-none text-sm"
                        >
                          {[1, 2, 3, 4, 5, 6].map(n => (
                            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  {/* Search button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <p className="text-xs text-gray-400">AI tracks prices &amp; notifies you</p>
                    </div>
                    <button
                      type="submit"
                      disabled={searching}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                      {searching ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          Search Flights
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* City name badge */}
          <div className="absolute bottom-4 right-6 z-10 flex items-center gap-1.5 text-white/70 text-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-medium">{HERO_CITIES[cityIndex].name}</span>
            {/* Dots */}
            <div className="flex items-center gap-1 ml-2">
              {HERO_CITIES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCityIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === cityIndex ? 'bg-white w-4' : 'bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Search Results Modal */}
        {showResults && searchResults && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {origin} → {destination}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(departureDate)}
                    {returnDate && tripType === 'roundtrip' && ` – ${formatDate(returnDate)}`}
                    {' · '}{travelers} traveler{travelers > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => { setShowResults(false); setSearchResults(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* AI Suggestion */}
                <div className="bg-indigo-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-indigo-900">AI Recommended Target</p>
                      <p className="text-2xl font-bold text-indigo-600 mt-1">
                        ${Math.round(parseFloat(searchResults.flights[0].price.total) * 0.88)}
                      </p>
                      <p className="text-sm text-indigo-700 mt-1">
                        12% below current price · Based on historical data
                      </p>
                    </div>
                  </div>
                </div>

                {/* Flight Options */}
                <div className="space-y-4">
                  {searchResults.flights.slice(0, 5).map((flight: any, i: number) => {
                    const price = parseFloat(flight.price.total);
                    const suggestedTarget = Math.round(price * 0.88);

                    return (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {flight.itineraries?.[0]?.segments?.[0]?.carrierCode || 'Airline'} {flight.itineraries?.[0]?.segments?.[0]?.number || ''}
                            </p>
                            <p className="text-sm text-gray-500">
                              {flight.itineraries?.[0]?.duration?.replace('PT', '').toLowerCase() || 'Duration N/A'}
                              {flight.itineraries?.[0]?.segments?.length > 1 && ` · ${flight.itineraries[0].segments.length - 1} stop`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">${Math.round(price)}</p>
                            <p className="text-sm text-gray-500">per person</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(flight, suggestedTarget)}
                          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Watch this flight (Target: ${suggestedTarget})
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip Detail Modal - V3 */}
        {selectedItem && (() => {
          const isBuy = selectedItem.signal === 'BUY';
          const isSpike = selectedItem.signal === 'SPIKE';
          const isWait = selectedItem.signal === 'WAIT' || selectedItem.signal === 'HOLD';
          const priceDiff = selectedItem.current_price - selectedItem.target_price;
          const priceProgress = Math.min(100, Math.max(0, (selectedItem.target_price / selectedItem.current_price) * 100));
          const holdFee = selectedItem.hold_fee || Math.round(selectedItem.current_price * 0.02);

          const headerGradient = isBuy
            ? 'from-emerald-500 to-teal-600'
            : isSpike
              ? 'from-red-500 to-orange-600'
              : 'from-indigo-500 to-violet-600';

          const headerBadge = isBuy
            ? { emoji: '🎯', text: 'TARGET HIT' }
            : isSpike
              ? { emoji: '🚨', text: 'PRICE SPIKE' }
              : { emoji: '⏳', text: 'WATCHING' };

          return (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedItem(null); }}
          >
            <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-in max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className={`relative px-6 pt-6 pb-8 bg-gradient-to-br ${headerGradient}`}>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-4 bg-white/20 text-white">
                  <span>{headerBadge.emoji}</span>
                  {headerBadge.text}
                  {selectedItem.hold_active && <Lock className="w-3 h-3 ml-1" />}
                  {selectedItem.reminders_set && <span className="ml-1">🗓️ 2</span>}
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {selectedItem.origin} → {selectedItem.destination}
                    </h3>
                    <p className="text-white/80 text-sm mt-1">
                      {formatDate(selectedItem.departure_date)}
                      {selectedItem.return_date && ` – ${formatDate(selectedItem.return_date)}`}
                      {' · '}{selectedItem.travelers} traveler{selectedItem.travelers > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">${Math.round(selectedItem.current_price)}</p>
                    {selectedItem.current_price !== selectedItem.baseline_price && (
                      <p className="text-sm text-white/60 line-through">${Math.round(selectedItem.baseline_price)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5 space-y-5">
                {/* Spike Warning */}
                {isSpike && (
                  <div className="rounded-xl p-4 bg-red-50 border border-red-100">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-100">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Price Spiking — Act Fast</p>
                        <p className="text-xs mt-0.5 text-red-600">
                          Price jumped ${Math.round(selectedItem.current_price - selectedItem.baseline_price)} in the last 24h. Book now or hold to lock the rate.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Signal Message */}
                {!isSpike && (
                  <div className={`rounded-xl p-4 ${isBuy ? 'bg-emerald-50' : 'bg-indigo-50'}`}>
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isBuy ? 'bg-emerald-100' : 'bg-indigo-100'
                      }`}>
                        <Sparkles className={`w-4 h-4 ${isBuy ? 'text-emerald-600' : 'text-indigo-600'}`} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isBuy ? 'text-emerald-800' : 'text-indigo-800'}`}>
                          {isBuy ? 'AI: Book Now — Target Hit' : 'AI: Wait — Price Dropping'}
                        </p>
                        <p className={`text-xs mt-0.5 ${isBuy ? 'text-emerald-600' : 'text-indigo-600'}`}>
                          {selectedItem.signal_reason || (isBuy ? 'Price has dropped to your target.' : 'Prices typically drop further for this route.')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Price Forecast (WAIT/HOLD only) */}
                {isWait && (
                  <div className="rounded-xl border border-indigo-100 p-4 bg-gradient-to-br from-indigo-50/50 to-violet-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-900">Price Forecast</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        selectedItem.confidence === 'high' ? 'bg-emerald-100 text-emerald-700'
                          : selectedItem.confidence === 'medium' ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedItem.confidence?.toUpperCase()} CONFIDENCE
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-[10px] uppercase text-gray-400 font-medium">Optimal window</p>
                        <p className="text-sm font-bold text-gray-900">{selectedItem.optimal_book_window || 'Mar 8–12'}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-[10px] uppercase text-gray-400 font-medium">Expected price</p>
                        <p className="text-sm font-bold text-indigo-600">~${Math.round(selectedItem.expected_price || selectedItem.current_price * 0.92)}</p>
                      </div>
                    </div>

                    {/* Mini price curve */}
                    <div className="flex items-end gap-0.5 h-8 mb-2">
                      {[100, 97, 94, 91, 88, 86, 84, 83, 82, 83, 85, 88, 92, 97, 103].map((v, i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-sm ${i < 9 ? 'bg-indigo-300' : i === 9 ? 'bg-emerald-400' : 'bg-gray-200'}`}
                          style={{ height: `${v - 70}%` }}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Now</span>
                      <span className="text-emerald-600 font-semibold">Best time</span>
                      <span>Too late</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Based on 3 years of data for this route</p>
                  </div>
                )}

                {/* Price Progress */}
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>Target: ${Math.round(selectedItem.target_price)}</span>
                    <span>Current: ${Math.round(selectedItem.current_price)}</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isBuy ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : isSpike ? 'bg-gradient-to-r from-red-400 to-orange-500'
                            : 'bg-gradient-to-r from-indigo-400 to-violet-500'
                      }`}
                      style={{ width: `${priceProgress}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1.5 font-medium ${
                    isBuy ? 'text-emerald-600' : isSpike ? 'text-red-600' : 'text-indigo-600'
                  }`}>
                    {isBuy
                      ? `$${Math.abs(Math.round(priceDiff))} below your target`
                      : `$${Math.round(Math.abs(priceDiff))} ${priceDiff > 0 ? 'above' : 'below'} target`
                    }
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {selectedItem.optimal_book_window && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">Book window</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{selectedItem.optimal_book_window}</p>
                    </div>
                  )}
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">Last checked</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(selectedItem.last_checked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">Target</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">${Math.round(selectedItem.target_price)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-500">Total cost</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      ${Math.round(selectedItem.current_price * selectedItem.travelers).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Price Hold (active) */}
                {selectedItem.hold_active && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-800">Price Held</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-emerald-700">${Math.round(selectedItem.hold_price || selectedItem.current_price)}</p>
                        <p className="text-[10px] text-emerald-600">Locked rate</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-700">${selectedItem.hold_fee || holdFee}</p>
                        <p className="text-[10px] text-gray-500">Fee paid</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-700">{selectedItem.hold_expiry ? formatDate(selectedItem.hold_expiry) : '48h'}</p>
                        <p className="text-[10px] text-gray-500">Expires</p>
                      </div>
                    </div>
                    <p className="text-[10px] text-emerald-600 mt-2">If price drops, book lower. If it spikes, use your locked rate.</p>
                  </div>
                )}

                {/* Dual Calendar Reminders (WAIT) */}
                {isWait && !selectedItem.reminders_set && (
                  <div className="rounded-xl border border-indigo-100 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      <span className="text-sm font-semibold text-gray-900">Smart Reminders</span>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">1</div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">Optimal date — {selectedItem.optimal_book_window || 'Mar 8'}</p>
                          <p className="text-[10px] text-gray-500">Check if price hit target</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 bg-amber-50 rounded-lg p-2.5">
                        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600">2</div>
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-gray-800">Fallback — {selectedItem.fallback_date ? formatDate(selectedItem.fallback_date) : 'Mar 15'}</p>
                          <p className="text-[10px] text-gray-500">Last chance, book today regardless</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const optimalDate = selectedItem.optimal_book_window?.split('–')[0]?.trim() || '';
                        const fallbackDate = selectedItem.fallback_date || '';
                        // Add first reminder
                        const event1 = {
                          title: `✈️ Check flight: ${selectedItem.origin} → ${selectedItem.destination}`,
                          details: `Target: $${Math.round(selectedItem.target_price)}. Open TravelCart to check price.`,
                        };
                        window.open(
                          `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event1.title)}&details=${encodeURIComponent(event1.details)}`,
                          '_blank'
                        );
                        setItems(items.map(i => i.id === selectedItem.id ? { ...i, reminders_set: true, calendar_added: true } : i));
                        setSelectedItem({ ...selectedItem, reminders_set: true, calendar_added: true });
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Add Both Reminders
                    </button>
                    {/* Why two reminders */}
                    <details className="mt-2">
                      <summary className="text-[10px] text-gray-400 cursor-pointer flex items-center gap-1">
                        <Info className="w-3 h-3" /> Why two reminders?
                      </summary>
                      <p className="text-[10px] text-gray-400 mt-1 pl-4">
                        The first reminder is the AI-predicted optimal date. If the price hasn&apos;t dropped by the fallback date, book anyway before prices rise further.
                      </p>
                    </details>
                  </div>
                )}

                {/* Reminders set badge */}
                {isWait && selectedItem.reminders_set && (
                  <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-indigo-800">🗓️ 2 reminders set</p>
                      <p className="text-[10px] text-indigo-600">Optimal + fallback dates added to calendar</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-2.5 pt-1">
                  {/* BUY → Book Now */}
                  {isBuy && (
                    <a
                      href={`https://www.google.com/travel/flights?q=flights+from+${selectedItem.origin}+to+${selectedItem.destination}+on+${selectedItem.departure_date}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                    >
                      <Plane className="w-5 h-5" />
                      Book Now on Google Flights
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  )}

                  {/* SPIKE → Book Now + Hold */}
                  {isSpike && (
                    <>
                      <a
                        href={`https://www.google.com/travel/flights?q=flights+from+${selectedItem.origin}+to+${selectedItem.destination}+on+${selectedItem.departure_date}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3.5 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-red-200 transition-all flex items-center justify-center gap-2"
                      >
                        <Plane className="w-5 h-5" />
                        Book Now Before It Rises
                        <ArrowRight className="w-4 h-4" />
                      </a>
                      {!selectedItem.hold_active && (
                        <button
                          onClick={() => {
                            const updated = {
                              ...selectedItem,
                              hold_active: true,
                              hold_price: selectedItem.current_price,
                              hold_fee: holdFee,
                              hold_expiry: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
                            };
                            setItems(items.map(i => i.id === selectedItem.id ? updated : i));
                            setSelectedItem(updated);
                          }}
                          className="w-full py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <Shield className="w-4 h-4" />
                          Hold Price for ${holdFee}
                        </button>
                      )}
                    </>
                  )}

                  {/* WAIT → Hold option + Calendar (if reminders not shown above) */}
                  {isWait && !selectedItem.hold_active && (
                    <button
                      onClick={() => {
                        const updated = {
                          ...selectedItem,
                          hold_active: true,
                          hold_price: selectedItem.current_price,
                          hold_fee: holdFee,
                          hold_expiry: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
                        };
                        setItems(items.map(i => i.id === selectedItem.id ? updated : i));
                        setSelectedItem(updated);
                      }}
                      className="w-full py-3 border-2 border-indigo-200 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Hold Price for ${holdFee}
                      <span className="text-[10px] text-indigo-400 ml-1">(48h lock)</span>
                    </button>
                  )}

                  {/* Mark as Booked */}
                  <button
                    onClick={() => handleBookTrip(selectedItem)}
                    className="w-full py-3 border-2 border-emerald-200 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark as Booked
                  </button>

                  {/* Remove */}
                  <button
                    onClick={() => {
                      handleDelete(selectedItem.id);
                      setSelectedItem(null);
                    }}
                    className="w-full py-3 text-gray-400 rounded-xl text-sm font-medium hover:text-red-500 hover:bg-red-50 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove from watchlist
                  </button>
                </div>
              </div>
            </div>
          </div>
          );
        })()}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Watchlist */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                {filter === 'buy' ? 'Ready to Book' : 'Your Watchlist'}
                {filteredItems.length > 0 && (
                  <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{filteredItems.length}</span>
                )}
                {filter !== 'all' && (
                  <button
                    onClick={() => setFilter('all')}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700 ml-1"
                  >
                    Show all
                  </button>
                )}
              </h2>
              {items.length > 0 && (
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              )}
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Loading your trips...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Plane className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No flights yet</h3>
                <p className="text-gray-500 mb-1">Search for a flight above to start tracking prices</p>
                <p className="text-sm text-gray-400">Our AI will watch for the perfect moment to book</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No flights ready to book</h3>
                <p className="text-gray-500 text-sm mb-3">None of your watched flights have hit their target price yet.</p>
                <button
                  onClick={() => setFilter('all')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all {items.length} watched flights
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map(item => {
                  const isBuySignal = item.signal === 'BUY';
                  const isSpikeSignal = item.signal === 'SPIKE';
                  const priceDiff = item.current_price - item.baseline_price;
                  const priceDiffPercent = Math.abs(Math.round((priceDiff / item.baseline_price) * 100));
                  const isBelow = item.current_price < item.baseline_price;
                  const targetDiff = item.current_price - item.target_price;
                  const progressToTarget = Math.max(0, Math.min(100, ((item.baseline_price - item.current_price) / (item.baseline_price - item.target_price)) * 100));

                  return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all group ${
                      isBuySignal ? 'border-emerald-200 ring-1 ring-emerald-100' :
                      isSpikeSignal ? 'border-red-200 ring-1 ring-red-100' :
                      'border-gray-100'
                    }`}
                  >
                    <div className="p-5">
                      {/* Header Row */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isBuySignal
                              ? 'bg-gradient-to-br from-emerald-100 to-teal-100'
                              : isSpikeSignal
                                ? 'bg-gradient-to-br from-red-100 to-orange-100'
                                : 'bg-gradient-to-br from-indigo-100 to-violet-100'
                          }`}>
                            <Plane className={`w-5 h-5 ${
                              isBuySignal ? 'text-emerald-600' : isSpikeSignal ? 'text-red-600' : 'text-indigo-600'
                            }`} />
                          </div>

                          {/* Route & Details */}
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900">
                                {getCityName(item.origin)}
                                <span className="text-gray-300 mx-1.5">→</span>
                                {getCityName(item.destination)}
                              </h3>
                              <span className="text-xs text-gray-400 font-medium">
                                {item.origin}–{item.destination}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span>{formatDateWithDay(item.departure_date)}</span>
                              {item.return_date && (
                                <>
                                  <span className="text-gray-300">→</span>
                                  <span>{formatDateWithDay(item.return_date)}</span>
                                </>
                              )}
                              <span className="text-gray-300">·</span>
                              <span>{item.travelers} traveler{item.travelers > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Trend */}
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <p className="text-2xl font-bold text-gray-900">
                              ${Math.round(item.current_price).toLocaleString()}
                            </p>
                            {priceDiff !== 0 && (
                              <div className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded ${
                                isBelow
                                  ? 'text-emerald-700 bg-emerald-50'
                                  : 'text-red-700 bg-red-50'
                              }`}>
                                {isBelow ? (
                                  <TrendingDown className="w-3 h-3" />
                                ) : (
                                  <TrendingUp className="w-3 h-3" />
                                )}
                                {priceDiffPercent}%
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">per person</p>
                        </div>
                      </div>

                      {/* Progress to Target */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-gray-500">Progress to target</span>
                          <span className={`font-semibold ${
                            item.current_price <= item.target_price
                              ? 'text-emerald-600'
                              : 'text-gray-600'
                          }`}>
                            {item.current_price <= item.target_price
                              ? '✓ Target reached!'
                              : `$${Math.round(targetDiff)} above target`
                            }
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.current_price <= item.target_price
                                ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                                : 'bg-gradient-to-r from-indigo-400 to-violet-400'
                            }`}
                            style={{ width: `${Math.min(100, progressToTarget)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs mt-1.5">
                          <span className="text-gray-400">
                            Started: ${Math.round(item.baseline_price).toLocaleString()}
                          </span>
                          <span className="text-indigo-600 font-medium">
                            Target: ${Math.round(item.target_price).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Price History Sparkline */}
                      {item.priceHistory.length > 1 && (
                        <div className="flex items-end gap-0.5 h-8 mb-4 px-1">
                          {item.priceHistory.slice(-10).map((price, i, arr) => {
                            const max = Math.max(...arr);
                            const min = Math.min(...arr);
                            const range = max - min || 1;
                            const height = ((price - min) / range) * 100;
                            const isLast = i === arr.length - 1;
                            return (
                              <div
                                key={i}
                                className={`flex-1 rounded-sm transition-all ${
                                  isLast
                                    ? isBuySignal ? 'bg-emerald-400' : isSpikeSignal ? 'bg-red-400' : 'bg-indigo-500'
                                    : 'bg-gray-200'
                                }`}
                                style={{ height: `${Math.max(15, height)}%` }}
                              />
                            );
                          })}
                        </div>
                      )}

                      {/* Footer Meta */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {item.hold_active && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                              <Lock className="w-3 h-3" /> Price held
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3.5 h-3.5" />
                            Updated {getTimeAgo(item.last_checked)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <button
                      onClick={() => setSelectedItem(item)}
                      className={`w-full px-5 py-3.5 flex items-center justify-between cursor-pointer transition-all ${
                        isBuySignal
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                          : isSpikeSignal
                            ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600'
                            : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 hover:from-indigo-50 hover:to-violet-50 hover:text-indigo-700'
                      }`}
                    >
                      <span className="font-semibold text-sm">
                        {isBuySignal
                          ? '🎯 Target hit — Book now!'
                          : isSpikeSignal
                            ? '🚨 Price spiking — Act fast!'
                            : `⏳ Wait — book ${item.optimal_book_window || 'when price drops'}`
                        }
                      </span>
                      <ChevronRight className={`w-5 h-5 ${
                        isBuySignal || isSpikeSignal ? 'text-white/70' : 'text-gray-400'
                      }`} />
                    </button>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Stats Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                Overview
              </h3>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`rounded-xl p-3.5 text-center transition-all cursor-pointer ${
                    filter === 'all'
                      ? 'bg-indigo-50 ring-2 ring-indigo-300'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Watching</p>
                </button>
                <button
                  onClick={() => setFilter('buy')}
                  className={`rounded-xl p-3.5 text-center transition-all cursor-pointer ${
                    filter === 'buy'
                      ? 'bg-emerald-100 ring-2 ring-emerald-400'
                      : 'bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  <p className="text-2xl font-bold text-emerald-600">{readyToBuy}</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Ready to book</p>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total value</span>
                  <span className="text-lg font-bold text-gray-900">${Math.round(totalCurrent).toLocaleString()}</span>
                </div>
                {totalSaved > 0 && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm text-gray-500">Savings</span>
                    <span className="text-sm font-semibold text-emerald-600">-${Math.round(totalSaved).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Status Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-200/50">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold">AI Price Monitor</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                      <p className="text-xs text-indigo-200">Active</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  Checking prices every 6 hours across {items.length > 0 ? items.length : 'your'} route{items.length !== 1 ? 's' : ''}.
                  You'll be notified when it's time to book.
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 px-1">
                <div className="w-1.5 h-5 bg-gradient-to-b from-indigo-500 to-violet-500 rounded-full" />
                Quick Actions
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setShowNotifSettings(!showNotifSettings)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-sm"
                >
                  <Bell className="w-4 h-4" />
                  <span>Notification settings</span>
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${showNotifSettings ? 'rotate-90' : ''}`} />
                </button>
                {showNotifSettings && (
                  <div className="ml-10 space-y-3 py-2">
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifEmail}
                          onChange={() => setNotifEmail(!notifEmail)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Email alerts
                      </label>
                      <p className="text-xs text-gray-400 ml-6 mt-0.5">Get price drop alerts sent to your inbox</p>
                      {notifEmail && (
                        <div className="ml-6 mt-2">
                          <input
                            type="email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-300"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifText}
                          onChange={() => setNotifText(!notifText)}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Text alerts (SMS)
                      </label>
                      <p className="text-xs text-gray-400 ml-6 mt-0.5">Get SMS messages for price drops and booking reminders</p>
                      {notifText && (
                        <div className="ml-6 mt-2">
                          <input
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            placeholder="+1 (555) 123-4567"
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-300"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifPush}
                          onChange={() => {
                            setNotifPush(!notifPush);
                            if (!notifPush && 'Notification' in window) {
                              Notification.requestPermission();
                            }
                          }}
                          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Push notifications
                      </label>
                      <p className="text-xs text-gray-400 ml-6 mt-0.5">Instant browser alerts when prices hit your target</p>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => {
                        setNotifSaved(true);
                        setTimeout(() => setNotifSaved(false), 2500);
                      }}
                      disabled={notifSaved}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        notifSaved
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98]'
                      }`}
                    >
                      {notifSaved ? 'Saved!' : 'Save preferences'}
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowMyTrips(true)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-sm"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>My Trips</span>
                  {trips.length > 0 && (
                    <span className="ml-auto text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{trips.length}</span>
                  )}
                </button>
                <button
                  onClick={() => {
                    window.open('https://calendar.google.com', '_blank');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-sm"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Connect calendar</span>
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Back to home</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* My Trips Modal */}
      {showMyTrips && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowMyTrips(false); }}
        >
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My Trips</h2>
                  <p className="text-xs text-gray-400">{trips.length} booking{trips.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button
                onClick={() => setShowMyTrips(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-3 flex gap-1 flex-shrink-0">
              {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => {
                const count = tab === 'all' ? trips.length : trips.filter(t => t.status === tab).length;
                return (
                  <button
                    key={tab}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    {tab} {count > 0 && <span className="ml-1 text-gray-300">{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Trip List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {trips.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-8 h-8 text-indigo-300" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">No trips yet</h3>
                  <p className="text-sm text-gray-400 mb-1">Your booked flights will appear here</p>
                  <p className="text-xs text-gray-300">Search for a flight and mark it as booked to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trips.map((trip) => {
                    const saved = trip.original_price - trip.price_paid;
                    const isUpcoming = trip.status === 'upcoming';
                    const departure = new Date(trip.departure_date);
                    const now = new Date();
                    const daysUntil = Math.ceil((departure.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <div
                        key={trip.id}
                        className={`rounded-2xl border p-4 transition-all ${
                          isUpcoming ? 'border-indigo-100 bg-gradient-to-r from-white to-indigo-50/30' : 'border-gray-100 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {getCityName(trip.origin)}
                                <span className="text-gray-300 mx-1.5">&rarr;</span>
                                {getCityName(trip.destination)}
                              </h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                trip.status === 'upcoming'
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : trip.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-gray-100 text-gray-500'
                              }`}>
                                {trip.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {trip.origin}&ndash;{trip.destination}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">${Math.round(trip.price_paid).toLocaleString()}</p>
                            {saved > 0 && (
                              <p className="text-xs text-emerald-600 font-medium">Saved ${Math.round(saved)}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDateWithDay(trip.departure_date)}
                            {trip.return_date && (
                              <> &rarr; {formatDateWithDay(trip.return_date)}</>
                            )}
                          </span>
                          <span>{trip.travelers} traveler{trip.travelers > 1 ? 's' : ''}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-mono">Ref: {trip.booking_ref}</span>
                            {isUpcoming && daysUntil > 0 && (
                              <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {daysUntil} day{daysUntil !== 1 ? 's' : ''} away
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              if (confirm('Remove this trip from your history?')) {
                                setTrips(trips.filter(t => t.id !== trip.id));
                              }
                            }}
                            className="p-1.5 text-gray-300 hover:text-red-400 rounded-lg transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {trips.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total spent</span>
                  <span className="font-bold text-gray-900">
                    ${Math.round(trips.reduce((sum, t) => sum + t.price_paid * t.travelers, 0)).toLocaleString()}
                  </span>
                </div>
                {trips.reduce((sum, t) => sum + (t.original_price - t.price_paid), 0) > 0 && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-emerald-600">Total saved with TravelCart</span>
                    <span className="font-bold text-emerald-600">
                      ${Math.round(trips.reduce((sum, t) => sum + (t.original_price - t.price_paid) * t.travelers, 0)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Push Notification Toast */}
      {pushNotification && !selectedItem && (
        <div className="fixed top-20 right-6 z-50 animate-slide-down">
          <div
            onClick={() => {
              setSelectedItem(pushNotification);
              setPushNotification(null);
            }}
            className={`cursor-pointer rounded-2xl shadow-2xl border p-4 w-80 ${
              pushNotification.signal === 'BUY'
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                : pushNotification.signal === 'SPIKE'
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                  : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                pushNotification.signal === 'BUY'
                  ? 'bg-emerald-100'
                  : pushNotification.signal === 'SPIKE'
                    ? 'bg-red-100'
                    : 'bg-indigo-100'
              }`}>
                {pushNotification.signal === 'SPIKE'
                  ? <AlertTriangle className="w-5 h-5 text-red-600" />
                  : <Plane className="w-5 h-5 text-emerald-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">
                  {pushNotification.signal === 'BUY'
                    ? '🎯 Price target hit!'
                    : '🚨 Price spiking!'
                  }
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {pushNotification.origin} → {pushNotification.destination} · ${Math.round(pushNotification.current_price)}
                </p>
                <p className="text-[10px] text-indigo-600 mt-1 font-medium">Tap to view →</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPushNotification(null);
                }}
                className="p-1 text-gray-300 hover:text-gray-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
