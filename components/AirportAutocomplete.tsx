'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plane, Loader2 } from 'lucide-react';

interface Airport {
  iataCode: string;
  name: string;
  cityName: string;
  countryCode: string;
}

interface AirportAutocompleteProps {
  value: string;
  onChange: (code: string, display: string) => void;
  placeholder?: string;
  label?: string;
  icon?: 'origin' | 'destination';
}

export default function AirportAutocomplete({
  value,
  onChange,
  placeholder = 'City or airport',
  label,
  icon = 'origin',
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/airports/search?keyword=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(data.airports || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Airport search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    setDisplayValue(newValue);

    // If user clears the input, also clear the selected code
    if (!newValue) {
      onChange('', '');
    }
  };

  // Handle selection
  const handleSelect = (airport: Airport) => {
    const display = `${airport.cityName} (${airport.iataCode})`;
    setDisplayValue(display);
    setQuery('');
    onChange(airport.iataCode, display);
    setIsOpen(false);
    setSuggestions([]);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  // Sync display value when value prop changes (e.g., swap)
  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      setQuery('');
    }
  }, [value]);

  return (
    <div ref={wrapperRef} className="relative flex-1">
      {label && (
        <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      )}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon === 'origin' ? (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
            </div>
          ) : (
            <MapPin className="w-5 h-5" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={displayValue || query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
        {value && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
              {value}
            </span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((airport, index) => (
            <button
              key={`${airport.iataCode}-${index}`}
              onClick={() => handleSelect(airport)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors ${
                index === selectedIndex ? 'bg-indigo-50' : ''
              } ${index === 0 ? 'rounded-t-xl' : ''} ${
                index === suggestions.length - 1 ? 'rounded-b-xl' : ''
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <Plane className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{airport.cityName}</span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                    {airport.iataCode}
                  </span>
                </div>
                <p className="text-sm text-gray-500 truncate">
                  {airport.name} · {airport.countryCode}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center">
          <p className="text-sm text-gray-500">No airports found for &quot;{query}&quot;</p>
          <p className="text-xs text-gray-400 mt-1">Try a different city or airport code</p>
        </div>
      )}
    </div>
  );
}
