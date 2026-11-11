// Source: Google Maps Platform Code Assist
import React, { useState, useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search, X, Loader2, Navigation } from 'lucide-react';
import { AppLanguage } from '../types';

export interface PlaceResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  placeId?: string;
}

interface SuggestionItem {
  id: string;
  title: string;
  subtitle: string;
  placeId?: string;
  placePrediction?: any;
}

interface PlacesAutocompleteInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  onSelectPlace: (place: PlaceResult) => void;
  icon?: React.ReactNode;
  error?: string;
  helperText?: string;
  className?: string;
  language?: AppLanguage;
}

export const PlacesAutocompleteInput: React.FC<PlacesAutocompleteInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  onSelectPlace,
  icon,
  error,
  helperText,
  className = '',
  language = 'pt',
}) => {
  const isEn = language === 'en';
  const placesLib = useMapsLibrary('places');
  const [focused, setFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sessionTokenRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  // Ref flag to completely prevent re-opening dropdown after choosing a suggestion
  const isSelectionActionRef = useRef<boolean>(false);

  // Initialize Places Autocomplete Session Token (Places API New)
  useEffect(() => {
    if (placesLib && !sessionTokenRef.current) {
      try {
        const SessionTokenClass =
          placesLib.AutocompleteSessionToken ||
          (window.google?.maps as any)?.places?.AutocompleteSessionToken;
        if (SessionTokenClass) {
          sessionTokenRef.current = new SessionTokenClass();
        }
      } catch {
        // Fallback
      }
    }
  }, [placesLib]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recommendations using modern google.maps.places.AutocompleteSuggestion
  useEffect(() => {
    // If this update was triggered by selecting a suggestion, skip search and keep dropdown closed!
    if (isSelectionActionRef.current) {
      isSelectionActionRef.current = false;
      setIsLoading(false);
      setShowDropdown(false);
      return;
    }

    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      // Re-verify selection ref inside timer before firing network request
      if (isSelectionActionRef.current) {
        isSelectionActionRef.current = false;
        setIsLoading(false);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);

      // Strategy 1: google.maps.places.AutocompleteSuggestion (Places API New)
      try {
        const AutocompleteSuggestion =
          placesLib?.AutocompleteSuggestion ||
          (window.google?.maps as any)?.places?.AutocompleteSuggestion;

        if (AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
          const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: value,
            sessionToken: sessionTokenRef.current,
          });

          if (isSelectionActionRef.current) {
            setIsLoading(false);
            return;
          }

          if (response?.suggestions && response.suggestions.length > 0) {
            const list: SuggestionItem[] = response.suggestions.map((s: any, idx: number) => {
              const pred = s.placePrediction;
              const mainText =
                pred?.mainText?.toString?.() ||
                pred?.structuredFormat?.mainText?.text ||
                pred?.text?.toString?.() ||
                '';
              const secondaryText =
                pred?.secondaryText?.toString?.() ||
                pred?.structuredFormat?.secondaryText?.text ||
                '';
              const fullText = pred?.text?.toString?.() || pred?.displayName?.toString?.() || '';

              const title = mainText || fullText.split(',')[0].trim();
              const subtitle = secondaryText || fullText.split(',').slice(1).join(',').trim() || (isEn ? 'Google Maps Place' : 'Local Google Maps');

              return {
                id: pred?.placeId || `sugg-${idx}`,
                title: title || (isEn ? 'Found Place' : 'Local Encontrado'),
                subtitle,
                placeId: pred?.placeId,
                placePrediction: pred,
              };
            });

            setSuggestions(list);
            setShowDropdown(true);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to geocoder
      }

      // Strategy 2: Direct Geocoder lookup
      fetchFallbackGeocode(value);
    }, 250);

    return () => clearTimeout(timer);
  }, [value, placesLib]);

  const fetchFallbackGeocode = (input: string) => {
    if (isSelectionActionRef.current) {
      setIsLoading(false);
      return;
    }

    if (window.google?.maps?.Geocoder) {
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }
      geocoderRef.current.geocode({ address: input }, (results: any, status: any) => {
        setIsLoading(false);
        if (isSelectionActionRef.current) return;

        if (status === 'OK' && results && results.length > 0) {
          const list: SuggestionItem[] = results.slice(0, 4).map((r: any, idx: number) => {
            const parts = r.formatted_address.split(',');
            return {
              id: r.place_id || `geo-${idx}`,
              title: parts[0].trim(),
              subtitle: parts.slice(1).join(', ').trim() || (isEn ? 'Geocoded Address' : 'Morada Georreferenciada'),
              placeId: r.place_id,
            };
          });
          setSuggestions(list);
          setShowDropdown(true);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      });
    } else {
      setIsLoading(false);
    }
  };

  // Handle selecting a place recommendation
  const handleSelect = async (item: SuggestionItem) => {
    const fullAddress = item.subtitle ? `${item.title}, ${item.subtitle}` : item.title;
    
    // Set lock flag and close dropdown immediately
    isSelectionActionRef.current = true;
    setShowDropdown(false);
    setSuggestions([]);
    onChange(fullAddress);

    // Primary: If PlacePrediction is available, resolve location via place.fetchFields()
    if (item.placePrediction?.toPlace) {
      try {
        const place = item.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location'],
        });

        if (place.location) {
          const lat = typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat;
          const lng = typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng;
          const resolvedAddress = place.formattedAddress || fullAddress;

          onSelectPlace({
            name: place.displayName || item.title,
            address: resolvedAddress,
            lat,
            lng,
            placeId: item.placeId,
          });

          // Reset session token for next search session
          const SessionTokenClass =
            placesLib?.AutocompleteSessionToken ||
            (window.google?.maps as any)?.places?.AutocompleteSessionToken;
          if (SessionTokenClass) {
            sessionTokenRef.current = new SessionTokenClass();
          }
          return;
        }
      } catch {
        // Fall back to Geocoder if fetchFields encounters an issue
      }
    }

    // Secondary: Geocoder resolution
    if (window.google?.maps?.Geocoder) {
      const geocoder = geocoderRef.current || new window.google.maps.Geocoder();
      const query = item.placeId ? { placeId: item.placeId } : { address: fullAddress };

      geocoder.geocode(query, (results: any, status: any) => {
        if (status === 'OK' && results?.[0]?.geometry?.location) {
          const loc = results[0].geometry.location;
          onSelectPlace({
            name: item.title,
            address: results[0].formatted_address || fullAddress,
            lat: typeof loc.lat === 'function' ? loc.lat() : loc.lat,
            lng: typeof loc.lng === 'function' ? loc.lng() : loc.lng,
            placeId: item.placeId,
          });
        } else {
          onSelectPlace({
            name: item.title,
            address: fullAddress,
            lat: 38.7223,
            lng: -9.1485,
            placeId: item.placeId,
          });
        }
      });
    } else {
      onSelectPlace({
        name: item.title,
        address: fullAddress,
        lat: 38.7223,
        lng: -9.1485,
        placeId: item.placeId,
      });
    }
  };

  const hasValue = value.length > 0;

  return (
    <div ref={containerRef} className={`relative flex flex-col w-full ${className}`}>
      <div
        className={`relative flex items-center min-h-[52px] px-3.5 pt-3 pb-1 rounded-xl bg-white dark:bg-[#131D2E] border transition-all duration-200 ${
          error
            ? 'border-rose-400 focus-within:ring-2 focus-within:ring-rose-200'
            : focused || showDropdown
            ? 'border-[#29B6F6] ring-3 ring-[#29B6F6]/20'
            : 'border-[#E1E6F0] dark:border-[#2A374A] hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        {icon && (
          <span className="text-slate-400 dark:text-slate-500 mr-2.5 shrink-0 self-center">
            {icon}
          </span>
        )}

        <div className="relative flex-1">
          <label
            className={`absolute left-0 pointer-events-none transition-all duration-150 origin-top-left ${
              focused || hasValue
                ? '-top-2 text-[10px] font-mono-telemetry font-semibold uppercase tracking-wider text-[#0284C7] dark:text-[#38BDF8]'
                : 'top-1 text-sm text-slate-400 dark:text-slate-500 font-body'
            }`}
          >
            {label}
          </label>

          <input
            type="text"
            value={value}
            onChange={(e) => {
              isSelectionActionRef.current = false;
              onChange(e.target.value);
            }}
            onFocus={() => {
              setFocused(true);
              if (suggestions.length > 0 && !isSelectionActionRef.current) {
                setShowDropdown(true);
              }
            }}
            onBlur={() => setFocused(false)}
            placeholder={focused ? placeholder : ''}
            className="w-full bg-transparent text-sm font-body text-[#0F172A] dark:text-white outline-none pt-2 pr-6"
            autoComplete="off"
          />
        </div>

        {/* Loading Spinner or Clear Button */}
        <div className="flex items-center gap-1 shrink-0 self-center">
          {isLoading && (
            <Loader2 size={14} className="animate-spin text-[#0284C7] dark:text-[#38BDF8]" />
          )}

          {hasValue && (
            <button
              type="button"
              onClick={() => {
                isSelectionActionRef.current = false;
                onChange('');
                setSuggestions([]);
                setShowDropdown(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full"
              aria-label={isEn ? 'Clear field' : 'Limpar campo'}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* RECOMENDAÇÕES GOOGLE MAPS PLACES DROPDOWN */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 overflow-hidden rounded-2xl bg-white dark:bg-[#10192A] border border-[#E1E6F0] dark:border-[#243248] shadow-2xl divide-y divide-slate-100 dark:divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 bg-slate-50 dark:bg-slate-900/80 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <span className="font-mono-telemetry text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <MapPin size={12} className="text-[#29B6F6]" />
              {isEn ? 'Google Maps Places Suggestions' : 'Sugestões Google Maps Places'}
            </span>
            <span className="text-[9px] font-mono-telemetry text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
              {isEn ? 'Direct GPS' : 'GPS Direto'}
            </span>
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {suggestions.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    // Prevent blur from closing before click fires
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  className="w-full px-3.5 py-2.5 text-left flex items-start gap-2.5 hover:bg-[#E1F5FE]/60 dark:hover:bg-[#003852]/50 active:bg-[#B3E5FC]/40 transition-colors group cursor-pointer"
                >
                  <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/80 text-[#0284C7] dark:text-[#38BDF8] group-hover:scale-110 transition-transform shrink-0 mt-0.5">
                    <Navigation size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#0F172A] dark:text-white truncate group-hover:text-[#0284C7] dark:group-hover:text-[#38BDF8]">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error ? (
        <span className="text-xs text-rose-500 mt-1 pl-1 flex items-center gap-1">
          {error}
        </span>
      ) : helperText ? (
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-1">
          {helperText}
        </span>
      ) : null}
    </div>
  );
};
