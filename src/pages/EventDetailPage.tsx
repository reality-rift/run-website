import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  CalendarPlus,
  UsersRound,
  Heart,
  Share2,
  Timer,
  Ticket,
  Globe,
  Phone,
  ExternalLink,
  HeartHandshake,
} from 'lucide-react';
import { useEvent } from '../hooks/useEvent';
import { useSavedEvents } from '../hooks/useSavedEvents';
import { useRegistrations } from '../hooks/useRegistrations';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { useEffect, useState } from 'react';
import { supabase, type EventRow } from '../lib/supabase';
import { resolveImageUrl } from '../lib/imageUrl';
import { buildGoogleCalendarUrl } from '../lib/googleCalendar';

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = d.getDate().toString().padStart(2, '0');
  return { month, day };
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr + 'T00:00:00');
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff;
}

function formatRegistrationClose(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 2); // 2 days before event
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { event, loading } = useEvent(id);
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedEvents();
  const { isRegistered, toggleRegistration } = useRegistrations();
  const { toast } = useToast();
  const [relatedEvents, setRelatedEvents] = useState<EventRow[]>([]);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [isVolunteering, setIsVolunteering] = useState(false);
  const [volunteerBusy, setVolunteerBusy] = useState(false);

  // Load volunteer info
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    supabase
      .from('event_volunteers')
      .select('user_id')
      .eq('event_id', id)
      .then(({ data }) => {
        if (cancelled || !data) return;
        setVolunteerCount(data.length);
        setIsVolunteering(!!user && data.some((v) => v.user_id === user.id));
      });
    return () => {
      cancelled = true;
    };
  }, [id, user]);

  const handleVolunteer = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!id || volunteerBusy) return;
    setVolunteerBusy(true);
    try {
      if (isVolunteering) {
        // Optimistic withdraw
        setIsVolunteering(false);
        setVolunteerCount((c) => Math.max(0, c - 1));
        const { error } = await supabase
          .from('event_volunteers')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);
        if (error) {
          setIsVolunteering(true);
          setVolunteerCount((c) => c + 1);
        } else {
          toast('Volunteer signup withdrawn');
        }
      } else {
        // Optimistic signup
        setIsVolunteering(true);
        setVolunteerCount((c) => c + 1);
        const { error } = await supabase
          .from('event_volunteers')
          .insert({ event_id: id, user_id: user.id });
        if (error) {
          setIsVolunteering(false);
          setVolunteerCount((c) => Math.max(0, c - 1));
        } else {
          toast("You're signed up to volunteer! 🙌");
        }
      }
    } finally {
      setVolunteerBusy(false);
    }
  };

  useEffect(() => {
    if (!event) return;
    supabase
      .from('events')
      .select('*')
      .eq('sport', event.sport)
      .eq('status', 'approved')
      .neq('id', event.id)
      .order('date', { ascending: true })
      .limit(3)
      .then(({ data }) => {
        if (data) setRelatedEvents(data);
      });
  }, [event]);

  const handleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      const wasSaved = isSaved(id);
      await toggleSave(id);
      toast(wasSaved ? 'Removed from shortlist' : 'Added to shortlist');
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id && event) {
      const wasRegistered = isRegistered(id);
      await toggleRegistration(id);
      if (!wasRegistered) {
        const portalUrl = event.registration_url || event.website_url;
        if (portalUrl) {
          // Redirect to the organizer's registration portal
          window.open(portalUrl, '_blank', 'noopener');
          toast('Opening registration portal...');
        } else {
          const calUrl = buildGoogleCalendarUrl({
            title: event.title,
            description: event.description,
            date: event.date,
            city: event.city,
            state: event.state,
          });
          window.open(calUrl, '_blank', 'noopener');
          toast('Registered! Opening Google Calendar...');
        }
      } else {
        toast('Registration cancelled');
      }
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && event) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast('Link copied to clipboard');
      }
    } catch {
      // user cancelled share dialog
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <div className="relative h-[65vh] min-h-[450px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-surface animate-pulse" />
        </div>
        <div className="px-6 md:px-12 -mt-20 relative z-10">
          <div className="max-w-content mx-auto">
            <div className="h-8 w-96 bg-white/[0.04] rounded-full mb-4" />
            <div className="h-5 w-64 bg-white/[0.03] rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-playfair text-5xl text-[#F5F5F0] mb-4">Event Not Found</h1>
          <p className="font-inter text-white/35 mb-10 max-w-md mx-auto leading-relaxed">
            This event may have been removed or the link might be incorrect.
          </p>
          <Link
            to="/events"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wider rounded-full hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,59,16,0.25)] transition-all duration-300"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  const { month, day } = formatShortDate(event.date);
  const days = daysUntil(event.date);
  const sportColor = event.sport === 'running' ? '#FF3B10' : '#10B981';
  const saved = id ? isSaved(id) : false;
  const registered = id ? isRegistered(id) : false;

  return (
    <div className="min-h-screen bg-surface">
      {/* Cinematic Hero */}
      <div className="relative h-[60vh] sm:h-[65vh] min-h-[400px] sm:min-h-[450px] overflow-hidden">
        <img
          src={resolveImageUrl(event.image_url)}
          alt={event.title}
          className="w-full h-full object-cover editorial-img scale-[1.02]"
        />
        {/* Multi-layer gradient for cinematic depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-surface/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 md:left-12 z-10 w-12 h-12 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center text-white/80 hover:bg-white/[0.1] hover:text-white transition-all duration-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-12 pb-14 z-10">
          <div className="max-w-content mx-auto">
            {/* Sport & Countdown Badges */}
            <div className="flex items-center gap-3 mb-5">
              <span
                className="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-white/90 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-full"
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: sportColor }}
                />
                {event.sport}
              </span>
              {days > 0 && (
                <span className="px-4 py-2 text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-white/90 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-full">
                  {days} days away
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-playfair text-3xl sm:text-4xl md:text-6xl lg:text-[5rem] text-[#F5F5F0] leading-[0.92] tracking-[-0.025em] max-w-4xl">
              {event.title}
            </h1>

            {/* Location under title */}
            <div className="flex items-center gap-2 mt-5 text-white/40">
              <MapPin className="w-4 h-4" />
              <span className="font-inter text-sm">
                {event.city}{event.state ? `, ${event.state}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 md:px-12 py-10 sm:py-16">
        <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-10 lg:space-y-14">
            {/* About */}
            <div>
              <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-accent mb-3">
                About
              </span>
              <h2 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-5">About This Event</h2>
              <p className="font-inter text-white/55 leading-[1.8] text-[17px]">
                {event.description}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-400">
                <CalendarDays className="w-5 h-5 text-accent mb-4" />
                <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/25 mb-1.5">
                  Date
                </span>
                <span className="font-inter text-sm text-white/80 leading-snug">
                  {formatFullDate(event.date)}
                </span>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-400">
                <MapPin className="w-5 h-5 text-accent mb-4" />
                <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/25 mb-1.5">
                  Location
                </span>
                <span className="font-inter text-sm text-white/80 leading-snug">
                  {event.city}
                  {event.state ? `, ${event.state}` : ''}
                </span>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-400">
                <Ticket className="w-5 h-5 text-accent mb-4" />
                <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/25 mb-1.5">
                  Entry Fee
                </span>
                <span className="font-inter text-sm text-white/80 tabular-nums">
                  {'\u20B9'}{event.price}
                </span>
              </div>
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-400">
                <UsersRound className="w-5 h-5 text-accent mb-4" />
                <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/25 mb-1.5">
                  Interested
                </span>
                <span className="font-inter text-sm text-white/80">
                  {event.interested_count}+ athletes
                </span>
              </div>
            </div>

            {/* Distances */}
            <div>
              <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-accent mb-3">
                Race Categories
              </span>
              <h2 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-5">Distances</h2>
              <div className="flex flex-wrap gap-3">
                {event.distance_tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-6 py-3 rounded-full bg-accent/8 text-accent font-inter font-semibold text-sm border border-accent/15 hover:border-accent/30 transition-all duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Categories */}
            {event.category_tags.length > 0 && (
              <div>
                <h2 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-5">Categories</h2>
                <div className="flex flex-wrap gap-3">
                  {event.category_tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-6 py-3 rounded-full bg-white/[0.04] text-white/55 font-inter font-semibold text-sm border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Registration Card */}
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-7">
                  <div className="bg-[#F5F5F0] px-4 py-2.5 rounded-xl text-center shadow-lg shadow-black/10">
                    <span className="block text-[9px] font-inter font-extrabold uppercase tracking-wider text-accent leading-none">
                      {month}
                    </span>
                    <span className="block text-2xl font-inter font-bold leading-none text-[#111111] mt-0.5">
                      {day}
                    </span>
                  </div>
                  <div>
                    <span className="block font-inter text-sm text-white/55">
                      {formatFullDate(event.date)}
                    </span>
                    <div className="flex items-center gap-1.5 mt-1.5 text-white/35">
                      <Timer className="w-3.5 h-3.5" />
                      <span className="text-xs font-inter font-medium">
                        {days > 0 ? `${days} days to go` : 'Event day'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1.5 mb-7">
                  <span className="font-syne font-bold text-4xl text-[#F5F5F0] tabular-nums">
                    {'\u20B9'}{event.price}
                  </span>
                  <span className="font-inter text-sm text-white/35">/ entry</span>
                </div>

                {/* Registration Close Date */}
                <div className="flex items-center justify-between text-xs font-inter text-white/35 mb-4 pb-4 border-b border-white/[0.06]">
                  <span>Registration closes</span>
                  <span className="text-white/55 font-medium">
                    {formatRegistrationClose(event.date)}
                  </span>
                </div>

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  className={`w-full py-4 rounded-full font-syne font-bold text-sm uppercase tracking-wider transition-all duration-300 active:scale-[0.97] mb-3 flex items-center justify-center gap-2 ${
                    registered
                      ? 'bg-accent/8 text-accent border border-accent/25'
                      : 'bg-accent text-black hover:brightness-110 hover:shadow-[0_6px_24px_rgba(255,59,16,0.3)]'
                  }`}
                >
                  {registered ? 'Registered' : 'Register Now'}
                  {!registered && (event.registration_url || event.website_url) && (
                    <ExternalLink className="w-4 h-4" />
                  )}
                </button>

                {/* Google Calendar Button */}
                {registered && (
                  <button
                    onClick={() => {
                      const url = buildGoogleCalendarUrl({
                        title: event.title,
                        description: event.description,
                        date: event.date,
                        city: event.city,
                        state: event.state,
                      });
                      window.open(url, '_blank', 'noopener');
                    }}
                    className="w-full py-3.5 rounded-full font-inter text-sm flex items-center justify-center gap-2.5 border border-white/[0.08] text-white/55 hover:border-accent/30 hover:text-accent hover:bg-accent/5 transition-all duration-300 mb-3"
                  >
                    <CalendarPlus className="w-4 h-4" />
                    Add to Google Calendar
                  </button>
                )}

                {/* Save & Share */}
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full border font-inter text-sm transition-all duration-300 ${
                      saved
                        ? 'border-accent/30 text-accent bg-accent/8 shadow-[0_0_12px_rgba(255,59,16,0.08)]'
                        : 'border-white/[0.08] text-white/55 hover:border-white/20 hover:text-white/75 hover:bg-white/[0.03]'
                    }`}
                  >
                    <Heart
                      className="w-4 h-4"
                      fill={saved ? 'currentColor' : 'none'}
                    />
                    {saved ? 'Shortlisted' : 'Shortlist'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2.5 py-3.5 rounded-full border border-white/[0.08] text-white/55 font-inter text-sm hover:border-white/20 hover:text-white/75 hover:bg-white/[0.03] transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                {/* Volunteer */}
                <div className="mt-3 pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={handleVolunteer}
                    disabled={volunteerBusy}
                    className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-full border font-inter text-sm transition-all duration-300 ${
                      isVolunteering
                        ? 'border-accent/30 text-accent bg-accent/8'
                        : 'border-white/[0.12] text-white/55 hover:border-accent/40 hover:text-accent hover:bg-accent/5'
                    }`}
                  >
                    <HeartHandshake className="w-4 h-4" />
                    {isVolunteering ? "You're volunteering ✓" : 'Volunteer for this event'}
                  </button>
                  <p className="text-center text-[11px] font-inter text-white/30 mt-2">
                    {volunteerCount === 0
                      ? 'Be the first to volunteer'
                      : `${volunteerCount} ${volunteerCount === 1 ? 'volunteer' : 'volunteers'} signed up`}
                  </p>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.1] transition-all duration-400">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="font-syne font-bold text-sm text-[#F5F5F0]">
                    {event.city}
                    {event.state ? `, ${event.state}` : ''}
                  </span>
                </div>
                <Link
                  to={`/events?city=${encodeURIComponent(event.city)}`}
                  className="text-xs font-inter text-accent/80 hover:text-accent transition-colors duration-300"
                >
                  View all events in {event.city} &rarr;
                </Link>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.city + (event.state ? ', ' + event.state : '') + ', India')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-inter text-accent/80 hover:text-accent transition-colors duration-300 mt-2"
                >
                  <MapPin className="w-3 h-3" />
                  View on Google Maps
                </a>
              </div>

              {/* Event Info Card */}
              {(event.website_url || event.contact_info) && (
                <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 space-y-4 hover:border-white/[0.1] transition-all duration-400">
                  <h3 className="font-syne font-bold text-sm text-[#F5F5F0]">Event Info</h3>
                  {event.website_url && (() => {
                    let domain = '';
                    try {
                      domain = new URL(event.website_url).hostname.replace('www.', '');
                    } catch {
                      domain = 'Official Website';
                    }
                    return (
                      <a
                        href={event.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm font-inter text-white/50 hover:text-accent transition-colors duration-300 group"
                      >
                        <Globe className="w-4 h-4 text-accent shrink-0 group-hover:scale-110 transition-transform duration-300" />
                        <span className="truncate">{domain}</span>
                      </a>
                    );
                  })()}
                  {event.contact_info && (
                    <div className="flex items-start gap-3 text-sm font-inter text-white/50">
                      <Phone className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <span className="text-xs leading-relaxed whitespace-pre-line">{event.contact_info}</span>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp Reminders via HelloAria */}
              <HelloAriaReminder eventTitle={event.title} eventDate={event.date} />
            </div>
          </div>
        </div>

        {/* Related Events — full width below the grid */}
        {relatedEvents.length > 0 && (
          <div className="max-w-content mx-auto mt-16">
            <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-accent mb-3">
              Explore More
            </span>
            <h2 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-8">
              More {event.sport === 'running' ? 'Running' : 'Cycling'} Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedEvents.map((re) => {
                const rd = formatShortDate(re.date);
                return (
                  <Link
                    key={re.id}
                    to={`/events/${re.id}`}
                    className="group bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-accent/25 hover:bg-white/[0.035] transition-all duration-500"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={re.image_url}
                        alt={re.title}
                        className="w-full h-full object-cover editorial-img group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <div className="bg-[#F5F5F0] backdrop-blur-sm px-2.5 py-1.5 rounded-xl text-center shadow-lg shadow-black/20">
                          <span className="block text-[8px] font-inter font-extrabold uppercase tracking-wider text-accent leading-none">
                            {rd.month}
                          </span>
                          <span className="block text-sm font-inter font-bold leading-none text-[#111111] mt-0.5">
                            {rd.day}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-syne font-bold text-sm text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 truncate">
                        {re.title}
                      </h3>
                      <p className="font-inter text-xs text-white/35 mt-1.5">
                        {re.city}
                        {re.state ? `, ${re.state}` : ''}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── HelloAria Reminder Widget ── */
const REMINDER_OPTIONS = [
  { label: '1 day before', value: 1 },
  { label: '3 days before', value: 3 },
  { label: '1 week before', value: 7 },
  { label: 'Morning of event', value: 0 },
];

function HelloAriaReminder({ eventTitle, eventDate }: { eventTitle: string; eventDate: string }) {
  const [selectedReminder, setSelectedReminder] = useState(1);

  const buildWhatsAppUrl = () => {
    const eventDateObj = new Date(eventDate + 'T00:00:00');
    const formattedDate = eventDateObj.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let reminderText: string;
    if (selectedReminder === 0) {
      reminderText = `on the morning of ${formattedDate}`;
    } else if (selectedReminder === 1) {
      const reminderDate = new Date(eventDateObj);
      reminderDate.setDate(reminderDate.getDate() - 1);
      const reminderFormatted = reminderDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      reminderText = `on ${reminderFormatted} (1 day before)`;
    } else {
      const reminderDate = new Date(eventDateObj);
      reminderDate.setDate(reminderDate.getDate() - selectedReminder);
      const reminderFormatted = reminderDate.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
      reminderText = `on ${reminderFormatted} (${selectedReminder} days before)`;
    }

    const message = `Hi Aria, please remind me about "${eventTitle}" happening on ${formattedDate}. Set my reminder ${reminderText} at 8:00 AM. Thanks!`;
    return `https://wa.me/917075471676?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-all duration-400">
      <div className="flex items-center gap-4 mb-4">
        <img
          src="/helloaria-logo.png"
          alt="HelloAria"
          className="w-12 h-12 rounded-xl object-contain invert"
        />
        <div>
          <h3 className="font-syne font-bold text-base text-[#F5F5F0]">{eventTitle}</h3>
          <p className="font-inter text-[11px] text-white/30">
            Reminders powered by{' '}
            <a href="https://helloaria.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">HelloAria</a>
          </p>
        </div>
      </div>

      <p className="font-inter text-xs text-white/35 leading-relaxed mb-4">
        Set a race-day reminder on WhatsApp so you never miss this event. Powered by{' '}
        <a href="https://helloaria.io" target="_blank" rel="noopener noreferrer" className="text-emerald-400/80 hover:text-emerald-400 hover:underline">HelloAria</a>
        , an AI productivity assistant.
      </p>

      {/* Reminder time selector */}
      <div className="mb-4">
        <label className="block text-[9px] font-inter font-bold uppercase tracking-[0.15em] text-white/25 mb-2.5">
          Remind me
        </label>
        <div className="flex flex-wrap gap-2">
          {REMINDER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSelectedReminder(opt.value)}
              className={`px-3.5 py-2 rounded-lg text-xs font-inter font-medium transition-all duration-300 ${
                selectedReminder === opt.value
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.08] hover:border-white/15 hover:text-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <a
        href={buildWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-inter text-sm font-medium hover:bg-emerald-500/15 hover:border-emerald-500/30 transition-all duration-300"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Get Reminders on WhatsApp
      </a>

      {/* New user disclaimer */}
      <p className="font-inter text-[10px] text-white/20 leading-relaxed mt-3">
        First time using Aria? You'll receive a short onboarding message. Simply re-send your reminder message after onboarding to set it up.
      </p>
    </div>
  );
}
