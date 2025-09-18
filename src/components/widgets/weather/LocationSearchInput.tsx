// Location Search Input with Autocomplete
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { weatherService, WeatherLocation } from '@/services/weatherService';
import { cn } from '@/lib/utils';

interface LocationSearchInputProps {
  onLocationSelect: (location: WeatherLocation) => void;
  currentLocation?: WeatherLocation | null;
  placeholder?: string;
  className?: string;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onLocationSelect,
  currentLocation,
  placeholder = "Search for a city or ZIP code...",
  className
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<WeatherLocation[]>([]);
  const [recentLocations, setRecentLocations] = useState<WeatherLocation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent locations on mount
  useEffect(() => {
    setRecentLocations(weatherService.getRecentLocations());
  }, []);

  // Handle search input changes
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await weatherService.searchLocations(query);
        setSuggestions(results);
      } catch (error) {
        console.error('Location search failed:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  // Handle location selection
  const handleLocationSelect = (location: WeatherLocation) => {
    weatherService.saveRecentLocation(location);
    setRecentLocations(weatherService.getRecentLocations());
    onLocationSelect(location);
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = [...suggestions, ...recentLocations];
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          handleLocationSelect(items[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  // Handle input blur
  const handleBlur = (e: React.FocusEvent) => {
    // Delay closing to allow clicks on dropdown items
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Clear recent locations
  const clearRecent = () => {
    weatherService.clearRecentLocations();
    setRecentLocations([]);
  };

  const allItems = [...suggestions, ...recentLocations];
  const showDropdown = isOpen && (suggestions.length > 0 || recentLocations.length > 0 || loading);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {showDropdown && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 shadow-lg"
        >
          <CardContent className="p-0">
            <ScrollArea className="max-h-80">
              {loading && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Searching locations...
                </div>
              )}

              {/* Search Results */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                    Search Results
                  </div>
                  {suggestions.map((location, index) => (
                    <button
                      key={`search-${index}`}
                      onClick={() => handleLocationSelect(location)}
                      className={cn(
                        "w-full text-left p-2 rounded-md hover:bg-accent transition-colors",
                        "flex items-center gap-3",
                        selectedIndex === index && "bg-accent"
                      )}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {location.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Locations */}
              {recentLocations.length > 0 && (
                <div className="p-2 border-t">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <div className="text-xs font-medium text-muted-foreground">
                      Recent Locations
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={clearRecent}
                      className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                  </div>
                  {recentLocations.map((location, index) => {
                    const adjustedIndex = suggestions.length + index;
                    return (
                      <button
                        key={`recent-${index}`}
                        onClick={() => handleLocationSelect(location)}
                        className={cn(
                          "w-full text-left p-2 rounded-md hover:bg-accent transition-colors",
                          "flex items-center gap-3",
                          selectedIndex === adjustedIndex && "bg-accent"
                        )}
                      >
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {location.displayName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                          </div>
                        </div>
                        {currentLocation && 
                         currentLocation.lat === location.lat && 
                         currentLocation.lng === location.lng && (
                          <Badge variant="secondary" className="text-xs">
                            Current
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No results */}
              {!loading && suggestions.length === 0 && recentLocations.length === 0 && query.length >= 2 && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No locations found for "{query}"
                </div>
              )}

              {/* Empty state */}
              {!loading && suggestions.length === 0 && recentLocations.length === 0 && query.length < 2 && (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  Type at least 2 characters to search
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};