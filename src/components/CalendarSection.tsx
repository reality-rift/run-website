import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MapPin, ArrowUpRight, CalendarDays, Zap, PersonStanding, Bike } from 'lucide-react';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { resolveImageUrl } from '../lib/imageUrl';
import type { EventRow } from '../lib/supabase';

const FILTER_CITIES = [
  'All Cities',
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Goa', 'Indore', 'Coimbatore',
  'Vadodara', 'Nagpur', 'Visakhapatnam', 'Bhopal', 'Thiruvananthapuram',
  'Dehradun', 'Mysuru', 'Guwahati', 'Leh',
];
const FILTER_SPORTS = [
  { value: '', label: 'All Sports', Icon: Zap },
  { value: 'running', label: 'Running', Icon: PersonStanding },
  { value: 'cycling', label: 'Cycling', Icon: Bike },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function formatPrice(p: number) {
  return p === 0 ? 'Free' : `\u20B9${p.toLocaleString('en-IN')}`;
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function CalendarSection() {
  const today = new Date();
  const [cur, setCur] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState<string | null>(null);
  const [filterCity, setFilterCity] = useState('');
  const [filterSport, setFilterSport] = useState('');

  const year = cur.getFullYear();
  const month = cur.getMonth();
  const { eventsByDate, loading } = useCalendarEvents(year, month, filterCity || undefined, filterSport || undefined);

  const todayISO = iso(today.getFullYear(), today.getMonth(), today.getDate());
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prev = () => { setCur(new Date(year, month - 1, 1)); setSelected(null); };
  const next = () => { setCur(new Date(year, month + 1, 1)); setSelected(null); };

  const selectedEvents: EventRow[] = selected ? eventsByDate.get(selected) || [] : [];

  // Count total events this month
  let totalEvents = 0;
  eventsByDate.forEach((evts) => { totalEvents += evts.length; });

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Pad trailing to complete the grid row
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <section id="calendar" className="relative py-24 sm:py-32 px-6 md:px-12 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-content mx-auto relative">
        {/* Header row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-14">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-[0.25em] text-accent/80 mb-5">
              <span className="w-8 h-px bg-accent/50" />
              Event Calendar
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#F5F5F0] leading-[1.05]">
              Plan Your{' '}
              <span className="italic text-white/40">Month</span>
            </h2>
          </div>
          <p className="font-inter text-sm text-white/30 leading-relaxed max-w-sm lg:text-right">
            Browse upcoming races and events day by day. Click any highlighted date to see what's happening.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          {/* City filter */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/25" />
            <select
              value={filterCity}
              onChange={(e) => { setFilterCity(e.target.value); setSelected(null); }}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm font-inter text-white/70 outline-none cursor-pointer appearance-none hover:border-white/15 transition-colors duration-300"
            >
              {FILTER_CITIES.map((c) => (
                <option key={c} value={c === 'All Cities' ? '' : c} className="bg-[#1a1a1a] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sport filter pills */}
          <div className="flex items-center gap-1.5">
            {FILTER_SPORTS.map((s) => (
              <button
                key={s.value}
                onClick={() => { setFilterSport(s.value); setSelected(null); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-inter font-medium transition-all duration-300 ${
                  filterSport === s.value
                    ? 'bg-accent text-black'
                    : 'bg-white/[0.04] text-white/45 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/65'
                }`}
              >
                <s.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main layout: Calendar + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

          {/* ── Calendar Card ── */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: 'var(--x141414)' }}>
            {/* Month nav bar */}
            <div className="flex items-center justify-between px-6 sm:px-8 py-5">
              <button
                onClick={prev}
                className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center">
                <span className="font-syne font-bold text-xl sm:text-2xl text-[#F5F5F0] tracking-tight">
                  {MONTHS[month]}
                </span>
                <span className="font-inter text-sm text-white/25 ml-2">{year}</span>
              </div>
              <button
                onClick={next}
                className="w-10 h-10 rounded-xl border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 px-4 sm:px-6">
              {DAYS.map((d) => (
                <div key={d} className="text-center py-3">
                  <span className="font-inter text-[10px] font-bold uppercase tracking-[0.15em] text-white/20">
                    {d}
                  </span>
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-[1px] px-4 sm:px-6 pb-5">
              {cells.map((day, i) => {
                if (day === null) return <div key={`e-${i}`} className="aspect-square" />;

                const dateISO = iso(year, month, day);
                const has = eventsByDate.has(dateISO);
                const count = eventsByDate.get(dateISO)?.length || 0;
                const isToday = dateISO === todayISO;
                const isSel = dateISO === selected;

                return (
                  <button
                    key={dateISO}
                    disabled={!has}
                    onClick={() => setSelected(isSel ? null : dateISO)}
                    className="aspect-square relative flex flex-col items-center justify-center rounded-xl transition-all duration-200 group"
                    style={{
                      background: isSel ? '#FF3B10' : has ? 'var(--w003)' : 'transparent',
                      cursor: has ? 'pointer' : 'default',
                    }}
                  >
                    {/* Today ring */}
                    {isToday && !isSel && (
                      <div className="absolute inset-1 rounded-lg border-2 border-accent/40 pointer-events-none" />
                    )}

                    <span
                      className="font-inter text-sm sm:text-base font-semibold transition-colors duration-200"
                      style={{
                        color: isSel ? '#000' : has ? 'var(--xF5F5F0)' : 'var(--x333)',
                      }}
                    >
                      {day}
                    </span>

                    {/* Event count badge */}
                    {has && !isSel && (
                      <span className="absolute bottom-1 sm:bottom-1.5 text-[9px] font-bold font-inter bg-accent/15 text-accent px-1 rounded">
                        {count}
                      </span>
                    )}

                    {/* Hover glow for event days */}
                    {has && !isSel && (
                      <div className="absolute inset-1 rounded-lg bg-accent/0 group-hover:bg-accent/[0.08] transition-colors duration-300 pointer-events-none" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Loading */}
            {loading && (
              <div className="px-6 pb-5 flex items-center justify-center gap-2">
                <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                <span className="font-inter text-xs text-white/20">Loading events...</span>
              </div>
            )}
          </div>

          {/* ── Right Sidebar: Selected Day or Summary ── */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col" style={{ background: 'var(--x141414)' }}>
            {selected ? (
              <>
                {/* Selected date header */}
                <div className="px-6 py-5 border-b border-white/[0.06]">
                  <span className="font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-accent/70">
                    {formatDateLabel(selected)}
                  </span>
                  <p className="font-syne font-bold text-lg text-[#F5F5F0] mt-1">
                    {selectedEvents.length} Event{selectedEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Event cards */}
                <div className="flex-1 overflow-y-auto">
                  {selectedEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6">
                      <CalendarDays className="w-8 h-8 text-white/10 mb-3" />
                      <p className="font-inter text-sm text-white/25 text-center">No events scheduled</p>
                    </div>
                  ) : (
                    <div className="p-3 space-y-2">
                      {selectedEvents.map((event) => (
                        <Link
                          key={event.id}
                          to={`/events/${event.id}`}
                          className="group flex gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-all duration-300"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-white/[0.06]">
                            <img
                              src={resolveImageUrl(event.image_url)}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-syne font-bold text-[13px] text-[#F5F5F0] group-hover:text-accent transition-colors truncate leading-tight">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className="px-1.5 py-0.5 text-[9px] font-inter font-bold uppercase tracking-wider rounded"
                                style={{ background: 'rgba(255,59,16,0.12)', color: '#FF3B10' }}
                              >
                                {event.sport}
                              </span>
                              {event.city && (
                                <span className="flex items-center gap-0.5 font-inter text-[10px] text-white/25">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {event.city}
                                </span>
                              )}
                            </div>
                            <span className="font-inter text-xs font-medium text-white/35 mt-1 block">
                              {formatPrice(event.price)}
                            </span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-accent transition-colors mt-1 flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Summary when nothing selected */
              <div className="flex flex-col items-center justify-center flex-1 px-6 py-12">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                  <CalendarDays className="w-7 h-7 text-accent" />
                </div>
                <p className="font-syne font-bold text-lg text-[#F5F5F0] mb-2 text-center">
                  {MONTHS[month]} Overview
                </p>
                <p className="font-inter text-sm text-white/30 text-center leading-relaxed mb-6">
                  {totalEvents > 0
                    ? `${totalEvents} event${totalEvents !== 1 ? 's' : ''} this month. Tap a highlighted day to explore.`
                    : 'No events scheduled this month. Try navigating to another month.'}
                </p>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3 w-full">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 text-center">
                    <span className="block font-syne font-bold text-2xl text-accent">{totalEvents}</span>
                    <span className="block font-inter text-[10px] text-white/25 uppercase tracking-wider mt-1">Events</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.04] p-4 text-center">
                    <span className="block font-syne font-bold text-2xl text-accent">{eventsByDate.size}</span>
                    <span className="block font-inter text-[10px] text-white/25 uppercase tracking-wider mt-1">Active Days</span>
                  </div>
                </div>

                {/* Browse all link */}
                <Link
                  to="/events"
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-sm font-inter text-white/40 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all duration-300"
                >
                  Browse All Events
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
