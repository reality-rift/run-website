import { useSearchParams } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal, X, Search, Flame, History } from 'lucide-react';
import { useCallback, useState, useMemo, useEffect } from 'react';
import { useEvents } from '../hooks/useEvents';
import { useSavedEvents } from '../hooks/useSavedEvents';
import { useRegistrations } from '../hooks/useRegistrations';
import { useToast } from '../components/Toast';
import EventsSidebar from '../components/events/EventsSidebar';
import EventListCard from '../components/events/EventListCard';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EventsPage() {
  const [searchParams] = useSearchParams();
  const initialCity = searchParams.get('city') ?? '';
  const initialSport = searchParams.get('sport') ?? '';
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);

  const PAGE_SIZE = 12;
  const [page, setPage] = useState(1);

  const { events, loading, error, filters, setFilters } = useEvents({
    city: initialCity,
    sport: initialSport,
  });

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  const todayStr = getTodayStr();
  const upcomingEvents = useMemo(() => events.filter((e) => e.date >= todayStr), [events, todayStr]);
  const pastEvents = useMemo(() => events.filter((e) => e.date < todayStr), [events, todayStr]);
  const allDisplayEvents = showPast ? pastEvents : upcomingEvents;
  const displayEvents = allDisplayEvents.slice(0, page * PAGE_SIZE);

  const { isSaved, toggleSave } = useSavedEvents();
  const { isRegistered, toggleRegistration } = useRegistrations();
  const { toast } = useToast();

  const handleToggleSave = useCallback(
    async (eventId: string) => {
      const wasSaved = isSaved(eventId);
      await toggleSave(eventId);
      toast(wasSaved ? 'Removed from shortlist' : 'Added to shortlist');
    },
    [isSaved, toggleSave, toast],
  );

  const handleToggleRegister = useCallback(
    async (eventId: string) => {
      const wasRegistered = isRegistered(eventId);
      await toggleRegistration(eventId);
      toast(wasRegistered ? 'Registration cancelled' : 'Registered successfully');
    },
    [isRegistered, toggleRegistration, toast],
  );

  const activeFilterCount = useMemo(
    () =>
      (filters.city ? 1 : 0) +
      (filters.sport ? 1 : 0) +
      filters.distanceTags.length +
      (filters.priceMax < 10000 ? 1 : 0) +
      (filters.month !== null ? 1 : 0) +
      (filters.year !== null ? 1 : 0),
    [filters],
  );

  return (
    <div className="min-h-screen bg-surface pt-20">
      <div className="flex max-w-[1400px] mx-auto">
        {/* Desktop Sidebar */}
        <EventsSidebar filters={filters} onFiltersChange={setFilters} />

        {/* Mobile Filters Overlay */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-surface/98 backdrop-blur-2xl lg:hidden overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <h3 className="font-syne font-bold text-lg text-[#F5F5F0] tracking-tight">
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-[10px] font-inter font-bold text-black">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <EventsSidebar
                filters={filters}
                onFiltersChange={(f) => setFilters(f)}
                mobile
              />
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full mt-8 py-4 bg-accent text-black font-syne font-bold text-sm uppercase tracking-[0.1em] rounded-2xl hover:brightness-110 transition-all duration-300 active:scale-[0.98] shadow-[0_8px_30px_-5px_rgba(255,59,16,0.3)]"
              >
                Show {allDisplayEvents.length} Result{allDisplayEvents.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-6 lg:p-10">
          {/* ── Page Header ──────────────────────────────────────── */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
              <div>
                <span className="inline-flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-accent mb-4">
                  <Flame className="w-3.5 h-3.5" />
                  Discover
                </span>
                <h1 className="font-playfair text-4xl md:text-5xl text-[#F5F5F0] leading-[1] tracking-[-0.02em]">
                  Upcoming Events
                </h1>
                <p className="text-sm font-inter mt-3 leading-relaxed max-w-md" style={{ color: '#999' }}>
                  {loading
                    ? 'Searching for races across India...'
                    : `${allDisplayEvents.length} ${showPast ? 'past' : 'upcoming'} race${allDisplayEvents.length !== 1 ? 's' : ''}`}
                  {filters.city && !loading ? ` in "${filters.city}"` : !loading ? ' across India' : ''}
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2.5">
                {/* Mobile Filters Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="lg:hidden relative flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] border border-[#333] rounded-xl text-sm font-inter text-white/80 hover:border-white/30 hover:text-white transition-all duration-300"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-accent text-[9px] font-inter font-bold text-black flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        sortBy: e.target.value as 'date' | 'price' | 'popularity',
                      })
                    }
                    className="appearance-none bg-[#1a1a1a] border border-[#333] rounded-xl px-5 py-2.5 pr-9 text-sm font-inter text-white/90 outline-none cursor-pointer hover:border-white/30 hover:text-white transition-all duration-300"
                  >
                    <option value="date">Date</option>
                    <option value="price">Price</option>
                    <option value="popularity">Popular</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Active Filter Pills */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6">
                {filters.city && (
                  <FilterPill
                    label={`Location: ${filters.city}`}
                    onRemove={() => setFilters({ ...filters, city: '' })}
                  />
                )}
                {filters.sport && (
                  <FilterPill
                    label={`Sport: ${filters.sport}`}
                    onRemove={() => setFilters({ ...filters, sport: '' })}
                  />
                )}
                {filters.distanceTags.map((tag) => (
                  <FilterPill
                    key={tag}
                    label={tag}
                    onRemove={() =>
                      setFilters({
                        ...filters,
                        distanceTags: filters.distanceTags.filter((t) => t !== tag),
                      })
                    }
                  />
                ))}
                {filters.priceMax < 10000 && (
                  <FilterPill
                    label={`Under \u20B9${filters.priceMax.toLocaleString('en-IN')}`}
                    onRemove={() => setFilters({ ...filters, priceMax: 10000 })}
                  />
                )}
                {filters.year !== null && (
                  <FilterPill
                    label={`Year: ${filters.year}`}
                    onRemove={() => setFilters({ ...filters, year: null, month: null })}
                  />
                )}
                {filters.month !== null && (
                  <FilterPill
                    label={`Month: ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][filters.month]}`}
                    onRemove={() => setFilters({ ...filters, month: null })}
                  />
                )}
                <button
                  onClick={() =>
                    setFilters({
                      city: '',
                      sport: '',
                      distanceTags: [],
                      sortBy: 'date',
                      priceMin: 0,
                      priceMax: 10000,
                      month: null,
                      year: null,
                    })
                  }
                  className="text-[11px] font-inter font-medium text-white/45 hover:text-accent transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Separator */}
            <div className="mt-8 h-px bg-gradient-to-r from-[#333] via-[#222] to-transparent" />
          </div>

          {/* ── Error Banner ──────────────────────────────────────── */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
              Failed to load events. Please try again.
            </div>
          )}

          {/* ── Content ──────────────────────────────────────────── */}
          {loading ? (
            <div className="flex flex-col gap-5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="relative flex rounded-2xl overflow-hidden border border-white/[0.04] h-[200px]"
                  style={{ animationDelay: `${n * 100}ms` }}
                >
                  {/* Skeleton image */}
                  <div className="w-[320px] shrink-0 hidden sm:block bg-white/[0.02]">
                    <div className="w-full h-full bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] animate-pulse" />
                  </div>
                  {/* Skeleton content */}
                  <div className="flex-1 p-7 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-2 w-12 bg-white/[0.05] rounded-full" />
                        <div className="h-2 w-20 bg-white/[0.03] rounded-full" />
                      </div>
                      <div className="h-5 w-64 bg-white/[0.06] rounded-lg mb-3" />
                      <div className="flex gap-2">
                        <div className="h-6 w-12 bg-white/[0.04] rounded-lg" />
                        <div className="h-6 w-20 bg-white/[0.04] rounded-lg" />
                        <div className="h-6 w-16 bg-white/[0.04] rounded-lg" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/[0.03]">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="w-7 h-7 rounded-full bg-white/[0.04]" />
                        ))}
                      </div>
                      <div className="h-9 w-28 bg-white/[0.04] rounded-xl" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : allDisplayEvents.length === 0 && !showPast && pastEvents.length === 0 ? (
            /* ── Empty State ─────────────────────────────────── */
            <div className="flex flex-col items-center justify-center py-32">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center">
                  <Search className="w-10 h-10 text-white/10" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-accent/10 border border-accent/15 flex items-center justify-center">
                  <X className="w-4 h-4 text-accent/50" />
                </div>
              </div>
              <h3 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-2">
                No events found
              </h3>
              <p className="font-inter text-white/30 text-sm max-w-sm text-center leading-relaxed mb-8">
                Try adjusting your filters or search criteria to discover more races across India.
              </p>
              <button
                onClick={() =>
                  setFilters({
                    city: '',
                    sport: '',
                    distanceTags: [],
                    sortBy: 'date',
                    priceMin: 0,
                    priceMax: 10000,
                    month: null,
                    year: null,
                  })
                }
                className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl border border-accent/25 text-accent font-syne font-bold text-sm uppercase tracking-[0.08em] hover:bg-accent/[0.05] transition-all duration-400"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            /* ── Event List ──────────────────────────────────── */
            <div>
              {/* Upcoming / Past toggle */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  onClick={() => { setShowPast(false); setPage(1); }}
                  className={`px-5 py-2 rounded-xl text-sm font-syne font-bold transition-all duration-300 ${
                    !showPast
                      ? 'bg-accent text-black'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                  style={!showPast ? undefined : { border: '1px solid #333' }}
                >
                  Upcoming ({upcomingEvents.length})
                </button>
                <button
                  onClick={() => { setShowPast(true); setPage(1); }}
                  className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-syne font-bold transition-all duration-300 ${
                    showPast
                      ? 'bg-accent text-black'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                  style={showPast ? undefined : { border: '1px solid #333' }}
                >
                  <History className="w-3.5 h-3.5" />
                  Past Events ({pastEvents.length})
                </button>
              </div>

              {displayEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <History className="w-10 h-10 mb-4" style={{ color: '#555' }} />
                  <h3 className="font-syne font-bold text-xl mb-2" style={{ color: '#ccc' }}>
                    {showPast ? 'No past events' : 'No upcoming events'}
                  </h3>
                  <p className="font-inter text-sm text-center max-w-sm" style={{ color: '#777' }}>
                    {showPast
                      ? 'There are no past events matching your filters.'
                      : 'Check back soon for upcoming races, or view past events.'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {displayEvents.map((event) => (
                    <EventListCard
                      key={event.id}
                      event={event}
                      saved={isSaved(event.id)}
                      registered={isRegistered(event.id)}
                      onToggleSave={handleToggleSave}
                      onToggleRegister={handleToggleRegister}
                    />
                  ))}
                </div>
              )}

              {/* Load More */}
              {displayEvents.length < allDisplayEvents.length && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setPage(p => p + 1)}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
                  >
                    Load More Events
                  </button>
                </div>
              )}

              {/* Results footer */}
              <div className="text-center py-12">
                <p className="text-[11px] font-inter uppercase tracking-[0.2em]" style={{ color: '#444' }}>
                  Showing {displayEvents.length} of {allDisplayEvents.length} {showPast ? 'past' : 'upcoming'} event{allDisplayEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ── Filter Pill Component ─────────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[11px] font-inter font-medium text-white/70">
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 rounded-full bg-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.15] transition-all"
      >
        <X className="w-2 h-2" />
      </button>
    </span>
  );
}
