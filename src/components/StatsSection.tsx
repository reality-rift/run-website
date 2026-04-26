import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface StatItem {
  label: string;
  value: number;
  suffix: string;
}

function useCountUp(target: number, duration: number, inView: boolean) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView || target === 0) return;
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, inView]);

  return count;
}

export default function StatsSection() {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState<StatItem[]>([
    { label: `Events in ${currentYear}`, value: 0, suffix: '+' },
    { label: 'Cities Covered', value: 0, suffix: '' },
    { label: 'Athletes Interested', value: 0, suffix: '+' },
    { label: 'Total Organisers', value: 0, suffix: '' },
  ]);
  const [inView, setInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.3 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    Promise.all([
      supabase.from('events').select('interested_count, organizer_id').eq('status', 'approved'),
      supabase.from('cities').select('id'),
    ]).then(([eventsRes, citiesRes]) => {
      const eventCount = eventsRes.data?.length ?? 0;
      const cityCount = citiesRes.data?.length ?? 0;
      const totalInterested =
        eventsRes.data?.reduce(
          (sum, e) => sum + ((e as { interested_count: number }).interested_count || 0),
          0,
        ) ?? 0;

      // Count distinct organizers from approved events
      const organizerSet = new Set(
        eventsRes.data?.map((e) => (e as { organizer_id: string }).organizer_id).filter(Boolean),
      );

      setStats([
        { label: `Events in ${currentYear}`, value: eventCount, suffix: '+' },
        { label: 'Cities Covered', value: cityCount, suffix: '' },
        { label: 'Athletes Interested', value: totalInterested, suffix: '+' },
        { label: 'Total Organisers', value: organizerSet.size, suffix: '' },
      ]);
    });
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6 md:px-12">
      <div className="max-w-content mx-auto">
        {/* Decorative top line */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-px flex-1 bg-white/[0.06]" />
          <span className="text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-white/15">
            By the Numbers
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} stat={stat} inView={inView} isLast={i === stats.length - 1} />
          ))}
        </div>

        {/* Decorative bottom line */}
        <div className="h-px bg-white/[0.06] mt-16" />
      </div>
    </section>
  );
}

function StatCard({ stat, inView, isLast }: { stat: StatItem; inView: boolean; isLast: boolean }) {
  const count = useCountUp(stat.value, 1500, inView);

  return (
    <div className={`relative text-center py-8 md:py-0 ${!isLast ? 'md:border-r md:border-white/[0.06]' : ''}`}>
      <span className="block font-playfair text-4xl md:text-5xl lg:text-6xl text-[#F5F5F0] tracking-[-0.02em] leading-none">
        {count.toLocaleString()}
        <span className="text-accent">{stat.suffix}</span>
      </span>
      <span className="block font-inter text-[11px] uppercase tracking-[0.2em] text-white/25 mt-4">
        {stat.label}
      </span>
    </div>
  );
}
