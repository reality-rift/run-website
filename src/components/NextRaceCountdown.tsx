import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Timer, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface NextRace {
  id: string;
  title: string;
  date: string;
  city: string;
  state: string | null;
}

function getCountdown(dateStr: string) {
  const target = new Date(dateStr + 'T00:00:00').getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function NextRaceCountdown() {
  const { user } = useAuth();
  const [race, setRace] = useState<NextRace | null>(null);
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Fetch the next registered race
  useEffect(() => {
    if (!user) return;

    const today = getTodayStr();

    supabase
      .from('registrations')
      .select('event_id, events(id, title, date, city, state)')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!data || data.length === 0) return;

        // Filter to upcoming events and sort by date ascending
        const upcoming = data
          .map((r: Record<string, unknown>) => r.events as NextRace | null)
          .filter((e): e is NextRace => e !== null && e.date >= today)
          .sort((a, b) => a.date.localeCompare(b.date));

        if (upcoming.length > 0) {
          setRace(upcoming[0]);
        }
      });
  }, [user]);

  // Update countdown every minute
  useEffect(() => {
    if (!race) return;

    const update = () => {
      setCountdown(getCountdown(race.date));
    };

    update();
    const interval = setInterval(update, 60_000);
    return () => clearInterval(interval);
  }, [race]);

  if (!user || !race || !countdown || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <div className="relative max-w-3xl w-full pointer-events-auto">
        <Link
          to={`/events/${race.id}`}
          className="block bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl border border-white/[0.08] hover:border-accent/30 hover:bg-[#1a1a1a] transition-all duration-500 group shadow-2xl shadow-black/40"
        >
          <div className="flex items-center gap-4 px-6 py-4 sm:px-8 sm:py-5">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
              <Timer className="w-5 h-5 text-accent" />
            </div>

            {/* Race info */}
            <div className="flex-1 min-w-0">
              <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-accent mb-0.5">
                Your Next Race
              </span>
              <span className="block font-syne font-bold text-sm sm:text-base text-[#F5F5F0] truncate group-hover:text-accent transition-colors duration-300">
                {race.title}
              </span>
            </div>

            {/* Countdown */}
            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
              <div className="text-center">
                <span className="block font-syne font-bold text-xl sm:text-2xl text-[#F5F5F0] tabular-nums leading-none">
                  {countdown.days}
                </span>
                <span className="block text-[9px] font-inter font-medium uppercase tracking-wider text-white/30 mt-1">
                  days
                </span>
              </div>
              <span className="text-white/15 font-inter text-lg">:</span>
              <div className="text-center">
                <span className="block font-syne font-bold text-xl sm:text-2xl text-[#F5F5F0] tabular-nums leading-none">
                  {String(countdown.hours).padStart(2, '0')}
                </span>
                <span className="block text-[9px] font-inter font-medium uppercase tracking-wider text-white/30 mt-1">
                  hrs
                </span>
              </div>
              <span className="text-white/15 font-inter text-lg">:</span>
              <div className="text-center">
                <span className="block font-syne font-bold text-xl sm:text-2xl text-[#F5F5F0] tabular-nums leading-none">
                  {String(countdown.minutes).padStart(2, '0')}
                </span>
                <span className="block text-[9px] font-inter font-medium uppercase tracking-wider text-white/30 mt-1">
                  min
                </span>
              </div>
            </div>
          </div>
        </Link>

        {/* Dismiss button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
          }}
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#2a2a2a] border border-white/[0.1] flex items-center justify-center text-white/40 hover:text-white hover:bg-[#333] transition-all duration-300 shadow-lg"
          aria-label="Dismiss countdown"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
