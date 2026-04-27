import { Search, X, ChevronDown } from 'lucide-react';
import type { EventFilters } from '../../hooks/useEvents';

interface EventsSidebarProps {
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  mobile?: boolean;
}

const SPORT_OPTIONS = [
  { value: '', label: 'All Sports', dot: '#888' },
  { value: 'running', label: 'Running', dot: '#FF3B10' },
  { value: 'cycling', label: 'Cycling', dot: '#34d399' },
];

const DISTANCE_GROUPS = [
  { label: 'Short', options: ['5K', '10K', '12K'] },
  { label: 'Mid', options: ['Half Marathon', 'Full Marathon'] },
  { label: 'Ultra / Long', options: ['50 km', '100 km', '200 km'] },
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

export default function EventsSidebar({ filters, onFiltersChange, mobile }: EventsSidebarProps) {
  const toggleDistanceTag = (tag: string) => {
    const current = filters.distanceTags;
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    onFiltersChange({ ...filters, distanceTags: next });
  };

  const handleReset = () => {
    onFiltersChange({
      city: '',
      sport: '',
      distanceTags: [],
      sortBy: 'date',
      priceMin: 0,
      priceMax: 10000,
      month: null,
      year: null,
    });
  };

  const activeFilterCount =
    (filters.city ? 1 : 0) +
    (filters.sport ? 1 : 0) +
    filters.distanceTags.length +
    (filters.priceMax < 10000 ? 1 : 0) +
    (filters.month !== null ? 1 : 0) +
    (filters.year !== null ? 1 : 0);

  return (
    <aside
      className={
        mobile
          ? 'w-full'
          : 'w-[300px] shrink-0 sticky top-0 h-screen overflow-y-auto hidden lg:block custom-scrollbar'
      }
    >
      <div className={mobile ? '' : 'p-8 pr-6'}>
        {/* Header */}
        {!mobile && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-syne font-bold text-lg tracking-tight" style={{ color: '#fff' }}>
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-[10px] font-inter font-bold text-black">
                    {activeFilterCount}
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleReset}
                  className="text-[11px] font-inter font-medium text-accent hover:text-accent/80 transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="mt-4 h-px" style={{ background: '#333' }} />
          </div>
        )}

        {/* ── City ──────────────────────────────────── */}
        <FilterSection label="Location">
          <div className="relative group/input">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: '#666' }} />
            <input
              type="text"
              placeholder="Mumbai, Bengaluru..."
              value={filters.city}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
              aria-label="Search by city"
              className="w-full rounded-xl pl-10 pr-9 py-3 text-sm font-inter outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(255,59,16,0.1)]"
              style={{ background: '#1e1e1e', border: '1px solid #333', color: '#eee' }}
            />
            {filters.city && (
              <button
                onClick={() => onFiltersChange({ ...filters, city: '' })}
                aria-label="Clear city search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-all"
                style={{ background: '#333', color: '#aaa' }}
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </FilterSection>

        {/* ── Sport ─────────────────────────────────── */}
        <FilterSection label="Sport">
          <div className="flex flex-col gap-1" role="group" aria-label="Sport filter">
            {SPORT_OPTIONS.map((opt) => {
              const active = filters.sport === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => onFiltersChange({ ...filters, sport: opt.value })}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-left transition-all duration-300"
                  style={
                    active
                      ? { background: '#2a2a2a', border: '1px solid #444' }
                      : { border: '1px solid transparent' }
                  }
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: active ? opt.dot : '#555' }} />
                  <span
                    className="text-sm font-inter transition-colors"
                    style={{ color: active ? '#fff' : '#aaa', fontWeight: active ? 600 : 400 }}
                  >
                    {opt.label}
                  </span>
                  {active && opt.value && (
                    <span className="ml-auto w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,59,16,0.2)' }}>
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="#FF3B10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </FilterSection>

        {/* ── Month & Year ───────────────────────────── */}
        <FilterSection label="Month & Year">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <select
                value={filters.year === null ? '' : String(filters.year)}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    year: e.target.value === '' ? null : Number(e.target.value),
                    month: e.target.value === '' ? null : filters.month,
                  })
                }
                aria-label="Filter by year"
                className="w-full appearance-none rounded-xl px-4 py-3 pr-9 text-sm font-inter outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(255,59,16,0.1)] cursor-pointer"
                style={{ background: '#1e1e1e', border: '1px solid #333', color: '#eee' }}
              >
                <option value="">All Years</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#666' }} />
            </div>
            <div className="relative">
              <select
                value={filters.month === null ? '' : String(filters.month)}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    month: e.target.value === '' ? null : Number(e.target.value),
                  })
                }
                disabled={filters.year === null}
                aria-label="Filter by month"
                className="w-full appearance-none rounded-xl px-4 py-3 pr-9 text-sm font-inter outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_rgba(255,59,16,0.1)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#1e1e1e', border: '1px solid #333', color: '#eee' }}
              >
                <option value="">All Months</option>
                {MONTH_NAMES.map((name, i) => (
                  <option key={name} value={String(i)}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#666' }} />
            </div>
          </div>
        </FilterSection>

        {/* ── Distance ──────────────────────────────── */}
        <FilterSection label="Distance">
          {DISTANCE_GROUPS.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <span className="block text-[9px] font-inter font-semibold uppercase tracking-[0.2em] mb-2 pl-1" style={{ color: '#777' }}>
                {group.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {group.options.map((tag) => {
                  const active = filters.distanceTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleDistanceTag(tag)}
                      className="px-3 py-1.5 rounded-lg text-xs font-inter font-medium transition-all duration-300"
                      style={
                        active
                          ? { background: 'rgba(255,59,16,0.2)', color: '#FF3B10', border: '1px solid rgba(255,59,16,0.35)' }
                          : { background: '#1e1e1e', color: '#bbb', border: '1px solid #333' }
                      }
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </FilterSection>

        {/* ── Budget ────────────────────────────────── */}
        <FilterSection label="Budget">
          <div className="px-1 pt-1">
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={filters.priceMax}
              onChange={(e) =>
                onFiltersChange({ ...filters, priceMax: parseInt(e.target.value) })
              }
              aria-label="Maximum price range"
              className="w-full accent-accent h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,59,16,0.3)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#111111] [&::-webkit-slider-thumb]:cursor-pointer"
              style={{ background: '#333' }}
            />
            <div className="flex justify-between mt-3">
              <span className="text-[11px] font-inter tabular-nums" style={{ color: '#777' }}>
                {'\u20B9'}0
              </span>
              <span
                className="px-3 py-1 rounded-lg text-xs font-inter font-medium tabular-nums"
                style={{ background: '#2a2a2a', border: '1px solid #444', color: '#ddd' }}
              >
                up to {'\u20B9'}{filters.priceMax.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#888' }}>
        {label}
      </span>
      {children}
    </div>
  );
}
