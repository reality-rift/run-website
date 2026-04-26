import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  List,
  CalendarDays,
  MapPin,
  Clock,
  Timer,
} from 'lucide-react';
import { type EventRow } from '../lib/supabase';
import { resolveImageUrl } from '../lib/imageUrl';

function useCountdown() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function getCountdown(eventDate: string, now: number): string | null {
  const target = new Date(eventDate + 'T00:00:00').getTime();
  const diff = target - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);

  if (days > 30) {
    const months = Math.floor(days / 30);
    return `${months}mo ${days % 30}d`;
  }
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

type ViewMode = 'timeline' | 'calendar';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RegisteredEventsView({ events }: { events: EventRow[] }) {
  const [view, setView] = useState<ViewMode>('timeline');
  const now = useCountdown();
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  /* -- Sort events by date for timeline ----------------------------- */
  const sorted = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ),
    [events],
  );

  /* -- Group by month label for timeline ---------------------------- */
  const grouped = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const ev of sorted) {
      const d = new Date(ev.date + 'T00:00:00');
      const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [sorted]);

  /* -- Calendar data ------------------------------------------------ */
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrev = new Date(calYear, calMonth, 0).getDate();

    const cells: { day: number; inMonth: boolean; date: Date }[] = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: daysInPrev - i,
        inMonth: false,
        date: new Date(calYear, calMonth - 1, daysInPrev - i),
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        day: d,
        inMonth: true,
        date: new Date(calYear, calMonth, d),
      });
    }
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) {
      for (let d = 1; d <= remaining; d++) {
        cells.push({
          day: d,
          inMonth: false,
          date: new Date(calYear, calMonth + 1, d),
        });
      }
    }
    return cells;
  }, [calMonth, calYear]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, EventRow[]>();
    for (const ev of events) {
      const key = ev.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); }
    else setCalMonth(calMonth - 1);
  };

  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); }
    else setCalMonth(calMonth + 1);
  };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  if (events.length === 0) return null;

  return (
    <div>
      {/* ── View Toggle ────────────────────────────────────────────── */}
      <div className="inline-flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-xl mb-8">
        <button
          onClick={() => setView('timeline')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-inter font-medium transition-all duration-300 ${
            view === 'timeline'
              ? 'bg-accent text-black shadow-sm'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Timeline
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-inter font-medium transition-all duration-300 ${
            view === 'calendar'
              ? 'bg-accent text-black shadow-sm'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          Calendar
        </button>
      </div>

      {/* ── TIMELINE VIEW ────────────────────────────────────────── */}
      {view === 'timeline' && (
        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gradient-to-b from-accent/20 via-white/[0.06] to-transparent" />

          {Array.from(grouped.entries()).map(([monthLabel, monthEvents]) => (
            <div key={monthLabel} className="mb-12 last:mb-0">
              {/* Month marker */}
              <div className="relative flex items-center gap-5 mb-7">
                <div className="relative z-10 w-[39px] h-[39px] rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-lg text-[#F5F5F0] tracking-tight">
                    {monthLabel}
                  </h3>
                  <span className="font-inter text-[10px] text-white/25 uppercase tracking-widest">
                    {monthEvents.length} event{monthEvents.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Events in this month */}
              <div className="space-y-3 pl-[55px]">
                {monthEvents.map((event) => {
                  const d = new Date(event.date + 'T00:00:00');
                  const dayNum = d.getDate().toString().padStart(2, '0');
                  const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
                  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const isPast = event.date < todayStr;

                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className={`group flex items-stretch gap-0 bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-accent/25 hover:bg-white/[0.03] transition-all duration-500 ${
                        isPast ? 'opacity-50' : ''
                      }`}
                    >
                      {/* Date badge */}
                      <div className="w-20 shrink-0 flex flex-col items-center justify-center bg-white/[0.02] border-r border-white/[0.04] py-4">
                        <span className="text-[9px] font-inter font-bold uppercase tracking-wider text-accent">
                          {month}
                        </span>
                        <span className="text-2xl font-syne font-bold leading-none text-[#F5F5F0] mt-0.5">
                          {dayNum}
                        </span>
                        <span className="text-[10px] font-inter text-white/25 mt-1">
                          {weekday}
                        </span>
                      </div>

                      {/* Event image */}
                      <div className="w-20 h-20 my-3 mx-3 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                        <img
                          src={resolveImageUrl(event.image_url)}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      </div>

                      {/* Event info */}
                      <div className="flex-1 py-4 pr-5 min-w-0">
                        <h4 className="font-syne font-bold text-[15px] text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 truncate">
                          {event.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-white/30 text-xs font-inter">
                            <MapPin className="w-3 h-3" />
                            {event.city}{event.state ? `, ${event.state}` : ''}
                          </span>
                          {isPast ? (
                            <span className="inline-flex items-center gap-1 text-white/20 text-[10px] font-inter uppercase tracking-wider">
                              <Clock className="w-3 h-3" />
                              Completed
                            </span>
                          ) : (
                            (() => {
                              const cd = getCountdown(event.date, now);
                              return cd ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-inter font-semibold bg-accent/10 text-accent border border-accent/[0.1]">
                                  <Timer className="w-3 h-3" />
                                  {cd}
                                </span>
                              ) : null;
                            })()
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2.5">
                          {event.distance_tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 rounded-lg text-[10px] font-inter font-semibold bg-accent/10 text-accent"
                            >
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs font-inter font-semibold text-white/40 ml-auto">
                            {'\u20B9'}{event.price}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CALENDAR VIEW ────────────────────────────────────────── */}
      {view === 'calendar' && (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          {/* Calendar header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <button
              onClick={prevMonth}
              className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-center">
              <h3 className="font-syne font-bold text-xl text-[#F5F5F0] tracking-tight">
                {MONTHS[calMonth]}
              </h3>
              <span className="font-inter text-[10px] text-white/25 uppercase tracking-widest">
                {calYear}
              </span>
            </div>
            <button
              onClick={nextMonth}
              className="w-9 h-9 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-white/[0.06] bg-white/[0.01]">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="py-3 text-center text-[10px] font-inter font-semibold uppercase tracking-widest text-white/25"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, idx) => {
              const dateStr = `${cell.date.getFullYear()}-${String(cell.date.getMonth() + 1).padStart(2, '0')}-${String(cell.date.getDate()).padStart(2, '0')}`;
              const dayEvents = eventsByDate.get(dateStr) || [];
              const isToday = dateStr === todayStr;
              const hasEvents = dayEvents.length > 0;

              return (
                <div
                  key={idx}
                  className={`relative min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border-b border-r border-white/[0.03] transition-colors duration-200 ${
                    !cell.inMonth ? 'bg-white/[0.005]' : ''
                  } ${hasEvents && cell.inMonth ? 'bg-accent/[0.02]' : ''}`}
                >
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-inter font-medium transition-colors ${
                      isToday
                        ? 'bg-accent text-black font-bold'
                        : cell.inMonth
                          ? 'text-white/45'
                          : 'text-white/12'
                    }`}
                  >
                    {cell.day}
                  </span>

                  {/* Event pills */}
                  {dayEvents.length > 0 && (
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((ev) => {
                        const cd = getCountdown(ev.date, now);
                        return (
                          <Link
                            key={ev.id}
                            to={`/events/${ev.id}`}
                            className="block px-1.5 py-[3px] rounded-md text-[9px] sm:text-[10px] font-inter font-semibold bg-accent/12 text-accent hover:bg-accent/20 transition-colors duration-200 truncate leading-tight border border-accent/[0.08]"
                            title={ev.title}
                          >
                            <span className="hidden sm:inline">{ev.title}</span>
                            <span className="sm:hidden">{ev.distance_tags[0] || ev.sport}</span>
                            {cd && (
                              <span className="block text-[8px] font-inter font-medium text-accent/60 leading-tight mt-px">
                                {cd} left
                              </span>
                            )}
                          </Link>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <span className="block text-[9px] font-inter text-white/25 pl-1.5 font-medium">
                          +{dayEvents.length - 2} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
