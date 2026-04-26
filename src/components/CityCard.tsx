import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { CityRow } from '../lib/supabase';

interface CityCardProps {
  city: CityRow;
}

export default function CityCard({ city }: CityCardProps) {
  return (
    <Link
      to={`/events?city=${encodeURIComponent(city.name)}`}
      className="group block cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden mb-4">
        <img
          src={city.image_url}
          alt={city.name}
          className="w-full h-full object-cover editorial-img grayscale group-hover:grayscale-0 scale-[1.02] group-hover:scale-[1.06] transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Hover arrow */}
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500">
          <ArrowUpRight className="w-3.5 h-3.5 text-white" />
        </div>

        {/* Event count badge at bottom */}
        <div className="absolute bottom-4 left-4">
          <span className="text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-white/60">
            {city.event_count} Upcoming
          </span>
        </div>
      </div>

      {/* City name */}
      <div className="px-1 flex items-center justify-between">
        <h3 className="font-syne font-bold text-lg text-[#F5F5F0] group-hover:text-accent transition-colors duration-300">
          {city.name}
        </h3>
        <span className="w-1.5 h-1.5 rounded-full bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </Link>
  );
}
