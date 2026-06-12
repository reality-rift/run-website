import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, CalendarPlus, ArrowUpRight } from 'lucide-react';
import type { EventRow } from '../../lib/supabase';
import { resolveImageUrl } from '../../lib/imageUrl';
import { useAuth } from '../../contexts/AuthContext';
import { buildGoogleCalendarUrl } from '../../lib/googleCalendar';

interface EventListCardProps {
  event: EventRow;
  saved: boolean;
  registered: boolean;
  onToggleSave: (eventId: string) => void;
  onToggleRegister: (eventId: string) => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate().toString().padStart(2, '0');
  const weekday = d.toLocaleString('en-US', { weekday: 'short' });
  return { month, day, weekday };
}

function daysUntil(dateStr: string) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T00:00:00');
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function EventListCard({
  event,
  saved,
  registered,
  onToggleSave,
  onToggleRegister,
}: EventListCardProps) {
  const { month, day, weekday } = formatDate(event.date);
  const { user } = useAuth();
  const navigate = useNavigate();
  const days = daysUntil(event.date);
  const isPast = days < 0;
  const isSoon = days >= 0 && days <= 7;

  const handleRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    // Open external registration portal when provided (only when registering)
    const portalUrl = event.registration_url || event.website_url;
    if (!registered && portalUrl) {
      window.open(portalUrl, '_blank', 'noopener');
    }
    onToggleRegister(event.id);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    onToggleSave(event.id);
  };

  const isCycling = event.sport === 'cycling';

  return (
    <Link to={`/events/${event.id}`} className="block group">
      <article
        className={`relative flex rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] ${
          isPast ? 'opacity-50 grayscale-[30%]' : ''
        }`}
        style={{ background: '#222' }}
      >
        {/* ── Image ──────────────────────────────────────── */}
        <div className="w-[320px] shrink-0 relative overflow-hidden hidden sm:block">
          <img
            src={resolveImageUrl(event.image_url)}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-[1s] ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#222]/70" />

          {/* Date Badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-black/70 backdrop-blur-xl px-4 py-3 rounded-2xl text-center border border-white/10">
              <span className="block text-[9px] font-inter font-extrabold uppercase tracking-[0.15em] text-accent leading-none">
                {month}
              </span>
              <span className="block text-[28px] font-syne font-bold leading-none text-white mt-0.5">
                {day}
              </span>
              <span className="block text-[9px] font-inter text-white/50 mt-0.5 tracking-wider">
                {weekday}
              </span>
            </div>
          </div>

          {/* Countdown */}
          {!isPast && (
            <div className="absolute bottom-4 left-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-inter font-bold backdrop-blur-xl border ${
                  isSoon
                    ? 'bg-accent/25 text-accent border-accent/30'
                    : 'bg-black/50 text-white/70 border-white/10'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSoon ? 'bg-accent animate-pulse' : 'bg-white/40'}`} />
                {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`}
              </span>
            </div>
          )}
        </div>

        {/* ── Content ────────────────────────────────────── */}
        <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between min-w-0">
          <div>
            {/* Sport + Location */}
            <div className="flex items-center gap-3 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-inter font-bold uppercase tracking-[0.15em] ${
                  isCycling ? 'text-emerald-400' : 'text-accent'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCycling ? 'bg-emerald-400' : 'bg-accent'}`} />
                {event.sport}
              </span>
              <span className="w-px h-3" style={{ background: '#555' }} />
              <span className="inline-flex items-center gap-1 text-[11px] font-inter" style={{ color: '#aaa' }}>
                <MapPin className="w-3 h-3" />
                {event.city}{event.state ? `, ${event.state}` : ''}
              </span>
            </div>

            {/* Title */}
            <div className="flex items-start justify-between gap-4">
              <h2
                className="font-syne font-bold leading-tight group-hover:text-accent transition-colors duration-300 line-clamp-2"
                style={{ color: '#ffffff', fontSize: '22px' }}
              >
                {event.title}
              </h2>
              <div className="shrink-0 text-right">
                <span className="block font-inter font-semibold uppercase tracking-wider mb-0.5" style={{ color: '#999', fontSize: '9px' }}>
                  Starts from
                </span>
                <span className="font-syne font-bold tabular-nums leading-none" style={{ color: '#ffffff', fontSize: '24px' }}>
                  {'\u20B9'}{event.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {event.distance_tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-inter font-bold tracking-wide"
                  style={{ background: 'rgba(255,59,16,0.15)', color: '#FF3B10', border: '1px solid rgba(255,59,16,0.25)' }}
                >
                  {tag}
                </span>
              ))}
              {event.category_tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-inter font-medium"
                  style={{ background: '#333', color: '#ccc', border: '1px solid #444' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: '1px solid #333' }}>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="w-7 h-7 rounded-full border-2 border-[#222]"
                    style={{
                      backgroundImage: `url(https://i.pravatar.cc/48?img=${n + (event.interested_count % 10)})`,
                      backgroundSize: 'cover',
                    }}
                  />
                ))}
              </div>
              <span className="text-[11px] font-inter font-medium" style={{ color: '#bbb' }}>
                {event.interested_count > 100
                  ? `${Math.floor(event.interested_count / 100) * 100}+`
                  : event.interested_count}{' '}
                interested
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={
                  saved
                    ? { background: 'rgba(255,59,16,0.15)', color: '#FF3B10', border: '1px solid rgba(255,59,16,0.3)' }
                    : { color: '#888', border: '1px solid #444' }
                }
                aria-label={saved ? 'Remove from shortlist' : 'Shortlist event'}
              >
                <Heart className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
              </button>

              {registered && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const url = buildGoogleCalendarUrl({
                      title: event.title,
                      description: event.description,
                      date: event.date,
                      city: event.city,
                      state: event.state,
                    });
                    window.open(url, '_blank', 'noopener');
                  }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 hover:text-accent"
                  style={{ color: '#888', border: '1px solid #444' }}
                  title="Add to Google Calendar"
                  aria-label="Add to Google Calendar"
                >
                  <CalendarPlus className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleRegister}
                className={`group/btn inline-flex items-center gap-2 px-5 py-2.5 font-syne font-bold text-[11px] uppercase tracking-[0.1em] rounded-xl transition-all duration-300 active:scale-[0.97] ${
                  registered
                    ? ''
                    : 'bg-accent text-black hover:shadow-[0_4px_24px_rgba(255,59,16,0.4)] hover:brightness-110'
                }`}
                style={registered ? { background: 'rgba(255,59,16,0.12)', color: '#FF3B10', border: '1px solid rgba(255,59,16,0.3)' } : undefined}
              >
                {registered ? 'Registered' : 'Register'}
                {!registered && (
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-300" />
                )}
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default React.memo(EventListCard);
