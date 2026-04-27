import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Search, Navigation, X } from 'lucide-react';

interface LocationPickerProps {
  address: string;
  lat: number | null;
  lng: number | null;
  onLocationChange: (address: string, lat: number | null, lng: number | null) => void;
}

/* Loads the Google Maps JS SDK once */
let loadPromise: Promise<void> | null = null;

function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY not set'));
  }
  loadPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.places) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export default function LocationPicker({
  address,
  lat,
  lng,
  onLocationChange,
}: LocationPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  const [mapsReady, setMapsReady] = useState(false);
  const [mapsError, setMapsError] = useState(false);
  const [query, setQuery] = useState(address);

  useEffect(() => {
    loadGoogleMaps()
      .then(() => setMapsReady(true))
      .catch(() => setMapsError(true));
  }, []);

  /* Initialize autocomplete once Maps is ready */
  useEffect(() => {
    if (!mapsReady || !inputRef.current || autocompleteRef.current) return;

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: 'in' },
      fields: ['formatted_address', 'geometry', 'name'],
    });

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry?.location) return;

      const newLat = place.geometry.location.lat();
      const newLng = place.geometry.location.lng();
      const newAddress = place.formatted_address || place.name || '';

      setQuery(newAddress);
      onLocationChange(newAddress, newLat, newLng);
    });

    autocompleteRef.current = ac;
  }, [mapsReady, onLocationChange]);

  /* Initialize / update map preview */
  const updateMap = useCallback(
    (mapLat: number, mapLng: number) => {
      if (!mapsReady || !mapRef.current) return;

      const pos = { lat: mapLat, lng: mapLng };

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: pos,
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a1a' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#666666' }] },
            { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a2a' }] },
            { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#111111' }] },
            { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          ],
        });

        markerRef.current = new google.maps.Marker({
          position: pos,
          map: mapInstanceRef.current,
          animation: google.maps.Animation.DROP,
        });
      } else {
        mapInstanceRef.current.panTo(pos);
        markerRef.current?.setPosition(pos);
      }
    },
    [mapsReady],
  );

  useEffect(() => {
    if (lat != null && lng != null) {
      updateMap(lat, lng);
    }
  }, [lat, lng, updateMap]);

  const handleClear = () => {
    setQuery('');
    onLocationChange('', null, null);
    if (inputRef.current) inputRef.current.value = '';
  };

  /* Fallback: manual address input when Google Maps key isn't available */
  if (mapsError) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            value={address}
            onChange={(e) => onLocationChange(e.target.value, null, null)}
            placeholder="Enter venue address manually..."
            className="form-input pl-10"
          />
        </div>
        <p className="text-[10px] font-inter text-yellow-400/60 leading-relaxed">
          Google Maps autocomplete unavailable. Add <code className="bg-white/[0.06] px-1.5 py-0.5 rounded">VITE_GOOGLE_MAPS_API_KEY</code> to your .env for location search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none z-10" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={mapsReady ? 'Search for a venue or address...' : 'Loading Google Maps...'}
          disabled={!mapsReady}
          className="form-input pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Selected location info */}
      {address && lat != null && lng != null && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-accent/5 border border-accent/15">
          <Navigation className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-inter text-xs text-white/60 leading-relaxed truncate">
              {address}
            </p>
            <p className="font-inter text-[10px] text-white/25 mt-1 tabular-nums">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Map preview */}
      {lat != null && lng != null && (
        <div
          ref={mapRef}
          className="w-full h-48 rounded-xl overflow-hidden border border-white/[0.08]"
        />
      )}

      {/* Google Maps attribution */}
      {!lat && (
        <p className="text-[10px] font-inter text-white/20 leading-relaxed flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          Start typing to search for venues, parks, or addresses in India
        </p>
      )}
    </div>
  );
}
