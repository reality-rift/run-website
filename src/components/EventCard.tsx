import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import type { EventRow } from '../lib/supabase';
import { resolveImageUrl } from '../lib/imageUrl';

interface EventCardProps {
  event: EventRow;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleString('en-US', { month: 'short', day: '2-digit' });
}

export default function EventCard({ event }: EventCardProps) {
  const isRunning = event.sport === 'running';

  return (
    <Link
      to={`/events/${event.id}`}
      className="group w-[280px] sm:w-[300px] md:w-[380px] flex-shrink-0 cursor-pointer block"
    >
      {/* Image container */}
      <div className="keep-dark relative aspect-[3/4] rounded-2xl overflow-hidden mb-5">
        <img
          src={resolveImageUrl(event.image_url)}
          alt={event.title}
          className="w-full h-full object-cover editorial-img opacity-80 group-hover:opacity-100 group-hover:scale-[1.04] transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
        {/* Dark gradient overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Date badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-white/90 bg-black/30 backdrop-blur-md border border-white/[0.08] rounded-lg">
            {formatShortDate(event.date)}
          </span>
        </div>

        {/* Sport badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.15em] backdrop-blur-md rounded-lg border ${
              isRunning
                ? 'text-accent/90 bg-accent/10 border-accent/20'
                : 'text-emerald-400/90 bg-emerald-500/10 border-emerald-500/20'
            }`}
          >
            {event.sport}
          </span>
        </div>

        {/* Hover arrow indicator */}
        <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-accent flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <ArrowUpRight className="w-4 h-4 text-black" />
        </div>
      </div>

      {/* Text content */}
      <div className="px-1">
        <h3 className="font-syne font-bold text-xl text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 leading-snug mb-2">
          {event.title}
        </h3>
        {event.city && (
          <p className="flex items-center gap-1.5 font-inter text-xs text-white/30 mb-1.5">
            <MapPin className="w-3 h-3" />
            {event.city}
          </p>
        )}
        <p className="font-inter text-[13px] text-white/30 leading-relaxed line-clamp-2">
          {event.description}
        </p>
      </div>
    </Link>
  );
}
