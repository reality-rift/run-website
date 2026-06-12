import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, X, Link2, Check } from 'lucide-react';

interface LocationPickerProps {
  address: string;
  lat: number | null;
  lng: number | null;
  mapUrl: string;
  onLocationChange: (address: string, lat: number | null, lng: number | null) => void;
  onMapUrlChange: (url: string) => void;
}

/**
 * Extract lat/lng from a Google Maps URL.
 * Supports:
 *  - https://www.google.com/maps/place/.../@17.385,78.4867,17z/...
 *  - https://www.google.com/maps?q=17.385,78.4867
 *  - URLs containing !3d17.385!4d78.4867
 */
function parseLatLngFromUrl(url: string): { lat: number; lng: number } | null {
  // @lat,lng pattern
  const atMatch = url.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
  }
  // !3dlat!4dlng pattern (place pin — most accurate)
  const bangMatch = url.match(/!3d(-?\d{1,3}\.\d+)!4d(-?\d{1,3}\.\d+)/);
  if (bangMatch) {
    return { lat: parseFloat(bangMatch[1]), lng: parseFloat(bangMatch[2]) };
  }
  // q=lat,lng pattern
  const qMatch = url.match(/[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (qMatch) {
    return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
  }
  return null;
}

function isGoogleMapsUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(google\.[a-z.]+\/maps|maps\.google\.[a-z.]+|maps\.app\.goo\.gl|goo\.gl\/maps)/i.test(
    url.trim(),
  );
}

export default function LocationPicker({
  address,
  lat,
  lng,
  mapUrl,
  onLocationChange,
  onMapUrlChange,
}: LocationPickerProps) {
  const [linkError, setLinkError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Parse coordinates whenever a maps link is pasted/typed
  useEffect(() => {
    if (!mapUrl.trim()) {
      setLinkError(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const valid = isGoogleMapsUrl(mapUrl);
      setLinkError(!valid);
      if (valid) {
        const coords = parseLatLngFromUrl(mapUrl);
        if (coords) {
          onLocationChange(address, coords.lat, coords.lng);
        }
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapUrl]);

  const handleClearLink = () => {
    onMapUrlChange('');
    onLocationChange(address, null, null);
    setLinkError(false);
  };

  const hasCoords = lat != null && lng != null;
  const hasValidLink = !!mapUrl.trim() && !linkError;

  return (
    <div className="space-y-4">
      {/* Venue address */}
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          type="text"
          value={address}
          onChange={(e) => onLocationChange(e.target.value, lat, lng)}
          placeholder="Venue name & address (e.g. Gachibowli Stadium, Hyderabad)"
          className="form-input pl-10"
        />
      </div>

      {/* Google Maps link */}
      <div className="relative">
        <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          type="url"
          value={mapUrl}
          onChange={(e) => onMapUrlChange(e.target.value)}
          placeholder="Paste Google Maps link (share → copy link)"
          className={`form-input pl-10 pr-10 ${linkError ? 'border-red-500/40' : hasValidLink ? 'border-emerald-500/30' : ''}`}
        />
        {mapUrl && (
          <button
            type="button"
            onClick={handleClearLink}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {linkError && (
        <p className="text-[10px] font-inter text-red-400/70 leading-relaxed">
          That doesn't look like a Google Maps link. Open Google Maps → find the venue →
          Share → Copy link.
        </p>
      )}

      {hasValidLink && !linkError && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
          <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-inter text-xs text-white/60 leading-relaxed">
              Google Maps link added — runners will see a "View on Google Maps" button.
            </p>
            {hasCoords && (
              <p className="font-inter text-[10px] text-white/25 mt-1 tabular-nums flex items-center gap-1.5">
                <Navigation className="w-3 h-3" />
                Pinned at {lat!.toFixed(5)}, {lng!.toFixed(5)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Free embed preview when we have coordinates (no API key needed) */}
      {hasCoords && (
        <div className="w-full h-48 rounded-xl overflow-hidden border border-white/[0.08]">
          <iframe
            title="Venue location preview"
            src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
            className="w-full h-full"
            style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
            loading="lazy"
          />
        </div>
      )}

      {!mapUrl && !hasCoords && (
        <p className="text-[10px] font-inter text-white/20 leading-relaxed flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          Tip: open Google Maps, find your venue, tap Share and paste the link here.
        </p>
      )}
    </div>
  );
}
