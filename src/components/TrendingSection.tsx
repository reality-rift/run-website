import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase, type EventRow } from '../lib/supabase';
import EventCard from './EventCard';

export default function TrendingSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('interested_count', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) setEvents(data);
      });
  }, []);

  const updateScrollState = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [events]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = direction === 'left' ? -420 : 420;
    scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  if (events.length === 0) return null;

  return (
    <section className="py-20 sm:py-28 px-6 md:px-12">
      <div className="max-w-content mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-[0.25em] text-accent/80 mb-5">
              <span className="w-8 h-px bg-accent/50" />
              Trending Now
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#F5F5F0] leading-[1.05]">
              Popular{' '}
              <span className="italic text-white/40">Events</span>
            </h2>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`w-11 h-11 rounded-full border flex items-center justify-center transition-all duration-300 ${
                canScrollLeft
                  ? 'border-white/20 text-white/60 hover:bg-white hover:text-black hover:border-white'
                  : 'border-white/[0.06] text-white/15 cursor-not-allowed'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollRight
                  ? 'bg-accent text-black hover:shadow-lg hover:shadow-accent/20'
                  : 'bg-white/[0.06] text-white/15 cursor-not-allowed'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable card row */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto hide-scrollbar px-6 md:px-12 scroll-smooth"
      >
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </section>
  );
}
