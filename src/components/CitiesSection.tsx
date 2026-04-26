import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase, type CityRow } from '../lib/supabase';
import CityCard from './CityCard';

export default function CitiesSection() {
  const [cities, setCities] = useState<CityRow[]>([]);

  useEffect(() => {
    supabase
      .from('cities')
      .select('*')
      .order('event_count', { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) setCities(data);
      });
  }, []);

  if (cities.length === 0) return null;

  return (
    <section className="py-28 px-6 md:px-12">
      <div className="max-w-content mx-auto">
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          <div className="md:col-span-3 flex flex-col justify-center">
            <span className="inline-flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-[0.25em] text-accent/80 mb-5">
              <span className="w-8 h-px bg-accent/50" />
              Explore
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl text-[#F5F5F0] leading-[1.05] mb-4">
              Curated
              <br />
              <span className="italic text-white/40">Cities</span>
            </h2>
            <p className="font-inter text-[13px] text-white/30 max-w-[220px] mb-8 leading-[1.7]">
              Explore the sports culture in India's metropolitan hubs. Routes, clubs, and
              major events.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center gap-2 text-[11px] font-inter font-semibold uppercase tracking-[0.15em] text-accent hover:text-accent/80 transition-colors duration-300 w-fit group"
            >
              View All Cities
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>

          {/* City cards */}
          {cities.map((city) => (
            <div key={city.id} className="md:col-span-3">
              <CityCard city={city} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
