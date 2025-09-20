// Places Search Autocomplete Component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getAutocompletePredictions, getPlaceDetails, type PlaceSearchResult } from '@/services/location/placesSearch';
import { useDebounce } from '@/hooks/core/useDebounce';
import type { LatLng } from '@/services/location/geolocation';

export interface PlaceSelection {
  description: string;
  placeId: string;
  latlng: LatLng;
  name?: string;
  formattedAddress?: string;
}

interface PlaceSearchProps {
  onPlaceSelect: (place: PlaceSelection) => void;
  placeholder?: string;
  className?: string;
  initialValue?: string;
  disabled?: boolean;
  userLocation?: LatLng; // For location biasing
}

export const PlaceSearch: React.FC<PlaceSearchProps> = ({
  onPlaceSelect,
  placeholder = "Search for a city or location...",
  className,
  initialValue = "",
  disabled = false,
  userLocation
}) => {
  const [input, setInput] = useState(initialValue);
  const [predictions, setPredictions] = useState<PlaceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [apiKey, setApiKey] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounce the search input
  const debouncedInput = useDebounce(input, 300);

  // Get API key from environment or edge function
  useEffect(() => {
    const getApiKey = async () => {
      try {
        // In production, get the key from an edge function to keep it secure
        const response = await fetch('/api/get-maps-key', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          setApiKey(data.apiKey);
        } else {
          // Fallback - use environment variable (not recommended for production)
          const envKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
          if (envKey) {
            setApiKey(envKey);
          }
        }
      } catch (error) {
        console.warn('Could not get Google Maps API key:', error);
      }
    };

    getApiKey();
  }, []);

  // Fetch predictions when input changes
  useEffect(() => {
    if (!debouncedInput.trim() || !apiKey) {
      setPredictions([]);
      setShowSuggestions(false);
      return;
    }

    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const results = await getAutocompletePredictions(debouncedInput, apiKey, {
          location: userLocation,
          radius: 50000, // 50km radius
          types: '(cities)', // Focus on cities and localities
        });
        
        setPredictions(results);
        setShowSuggestions(results.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Failed to fetch place predictions:', error);
        setPredictions([]);
        setShowSuggestions(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  }, [debouncedInput, apiKey, userLocation]);

  // Handle prediction selection
  const handlePredictionSelect = useCallback(async (prediction: PlaceSearchResult) => {
    if (!apiKey) return;

    setIsLoading(true);
    setShowSuggestions(false);
    setInput(prediction.description);

    try {
      // If we already have coordinates, use them
      if (prediction.latlng) {
        onPlaceSelect({
          description: prediction.description,
          placeId: prediction.placeId,
          latlng: prediction.latlng
        });
      } else {
        // Otherwise, fetch place details to get coordinates
        const details = await getPlaceDetails(prediction.placeId, apiKey);
        if (details) {
          onPlaceSelect({
            description: prediction.description,
            placeId: prediction.placeId,
            latlng: details.latlng,
            name: details.name,
            formattedAddress: details.formattedAddress
          });
        }
      }
    } catch (error) {
      console.error('Failed to get place details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, onPlaceSelect]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions || predictions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < predictions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : predictions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < predictions.length) {
          handlePredictionSelect(predictions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  }, [showSuggestions, predictions, selectedIndex, handlePredictionSelect]);

  // Clear input
  const handleClear = useCallback(() => {
    setInput('');
    setPredictions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {input && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && predictions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          {predictions.map((prediction, index) => (
            <button
              key={prediction.placeId}
              onClick={() => handlePredictionSelect(prediction)}
              className={cn(
                "w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none text-sm",
                selectedIndex === index && "bg-accent text-accent-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{prediction.description}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
