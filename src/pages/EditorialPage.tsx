import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Route,
  Compass,
  Footprints,
  Clock,
  BookOpen,
  TrendingUp,
  Mountain,
} from 'lucide-react';
import { supabase, type EventRow } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { articles } from '../data/articles';

const features = articles.slice(0, 3).map(a => ({
  tag: a.tag,
  title: a.title,
  excerpt: a.excerpt,
  image: a.heroImage,
  icon: a.tag === 'Training' ? Route : a.tag === 'Destinations' ? Compass : Footprints,
  readTime: a.readTime,
  slug: a.slug,
}));

const guides = articles.slice(3).map((a, i) => ({
  title: a.title,
  excerpt: a.excerpt,
  category: a.tag,
  icon: [BookOpen, TrendingUp, Mountain, Clock][i] || BookOpen,
  readTime: a.readTime,
  slug: a.slug,
}));

export default function EditorialPage() {
  const [featuredEvents, setFeaturedEvents] = useState<EventRow[]>([]);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .order('interested_count', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setFeaturedEvents(data);
      });
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: subscribeEmail.trim().toLowerCase() });

    if (error?.code === '23505') {
      toast('You are already subscribed!');
    } else if (error) {
      toast('Something went wrong. Please try again.');
    } else {
      toast('Subscribed! Check your inbox for updates.');
    }
    setSubscribeEmail('');
  };

  return (
    <div className="min-h-screen bg-surface pt-24">
      {/* --- Editorial Header --- */}
      <div className="px-6 md:px-12 mb-24">
        <div className="max-w-content mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-accent" />
            <span className="text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-accent">
              Editorial
            </span>
          </div>
          <h1 className="font-playfair text-5xl md:text-7xl lg:text-[6.5rem] text-[#F5F5F0] leading-[0.92] tracking-[-0.03em] max-w-5xl">
            Stories From
            <br />
            <span className="italic font-normal text-white/40">the Starting Line</span>
          </h1>
          <div className="mt-8 flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-12">
            <p className="font-inter text-base md:text-lg text-white/40 max-w-lg leading-relaxed">
              Deep dives, athlete profiles, and destination guides for the endurance community.
            </p>
            <span className="hidden sm:block h-px flex-1 bg-white/[0.06]" />
            <span className="text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/20 shrink-0">
              Vol. 01 / 2025
            </span>
          </div>
        </div>
      </div>

      {/* --- Feature Article Grid --- */}
      <div className="px-6 md:px-12 mb-28">
        <div className="max-w-content mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Hero Feature */}
            <Link to={`/editorial/${features[0].slug}`} className="lg:col-span-7 group relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer block">
              <img
                src={features[0].image}
                alt={features[0].title}
                className="w-full h-full object-cover editorial-img group-hover:scale-105 transition-transform duration-[800ms] ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
              <div className="absolute top-6 left-6 flex items-center gap-2">
                <span className="px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-widest text-accent bg-accent/10 backdrop-blur-md border border-accent/20 rounded-full">
                  {features[0].tag}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-inter font-bold text-white/60 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                  <Clock className="w-3 h-3" />
                  {features[0].readTime}
                </span>
              </div>
              <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                <ArrowUpRight className="w-4 h-4 text-accent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <span className="block w-10 h-[2px] bg-accent mb-5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <h2 className="font-playfair text-3xl md:text-5xl text-white leading-[1.05] mb-4 group-hover:text-accent transition-colors duration-500">
                  {features[0].title}
                </h2>
                <p className="font-inter text-sm text-white/50 max-w-md leading-relaxed line-clamp-3">
                  {features[0].excerpt}
                </p>
              </div>
            </Link>

            {/* Side Features */}
            <div className="lg:col-span-5 flex flex-col gap-5">
              {features.slice(1).map((feature) => {
                const Icon = feature.icon;
                return (
                  <Link
                    to={`/editorial/${feature.slug}`}
                    key={feature.title}
                    className="group relative flex-1 rounded-2xl overflow-hidden cursor-pointer min-h-[260px] block"
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover editorial-img group-hover:scale-105 transition-transform duration-[800ms] ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                    <div className="absolute top-5 left-5 flex items-center gap-2">
                      <span className="px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-widest text-accent bg-accent/10 backdrop-blur-md border border-accent/20 rounded-full">
                        {feature.tag}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-inter font-bold text-white/60 bg-white/5 backdrop-blur-md border border-white/10 rounded-full">
                        <Clock className="w-3 h-3" />
                        {feature.readTime}
                      </span>
                    </div>
                    <div className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      <Icon className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <h3 className="font-playfair text-xl md:text-2xl text-white leading-tight mb-2 group-hover:text-accent transition-colors duration-500">
                        {feature.title}
                      </h3>
                      <p className="font-inter text-sm text-white/40 max-w-sm leading-relaxed line-clamp-2">
                        {feature.excerpt}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- Guides & Resources --- */}
      <div className="px-6 md:px-12 mb-28">
        <div className="max-w-content mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-white/25 mb-3">
                Learn
              </span>
              <h2 className="font-playfair text-3xl md:text-5xl text-[#F5F5F0]">
                Guides &{' '}
                <span className="italic text-white/40">Resources</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {guides.map((guide, idx) => {
              const Icon = guide.icon;
              return (
                <Link
                  to={`/editorial/${guide.slug}`}
                  key={guide.title}
                  className="group glass glass-hover rounded-2xl p-8 md:p-10 cursor-pointer relative overflow-hidden block"
                >
                  {/* Subtle index number */}
                  <span className="absolute top-6 right-6 font-playfair text-6xl font-bold text-white/[0.03] leading-none select-none pointer-events-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="flex items-center justify-between mb-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 text-[10px] font-inter font-bold uppercase tracking-widest text-white/50 bg-white/[0.04] border border-white/[0.06] rounded-full">
                      <Icon className="w-3 h-3" />
                      {guide.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-inter text-white/25">
                      <Clock className="w-3 h-3" />
                      {guide.readTime}
                    </span>
                  </div>
                  <h3 className="font-syne font-bold text-lg md:text-xl text-[#F5F5F0] mb-3 group-hover:text-accent transition-colors duration-300">
                    {guide.title}
                  </h3>
                  <p className="font-inter text-sm text-white/35 leading-relaxed line-clamp-2">
                    {guide.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-accent text-sm font-inter font-medium translate-x-0 group-hover:translate-x-1 opacity-0 group-hover:opacity-100 transition-all duration-400">
                    Read article
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- Editor's Picks --- */}
      {featuredEvents.length > 0 && (
        <div className="px-6 md:px-12 mb-28">
          <div className="max-w-content mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-white/25 mb-3">
                  Curated
                </span>
                <h2 className="font-playfair text-3xl md:text-5xl text-[#F5F5F0]">
                  Editor's{' '}
                  <span className="italic text-white/40">Picks</span>
                </h2>
              </div>
              <Link
                to="/events"
                className="flex items-center gap-1.5 text-sm font-inter font-medium text-accent hover:text-accent/80 transition-colors group/link"
              >
                View all
                <ArrowUpRight className="w-4 h-4 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform duration-300" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredEvents.map((event) => {
                const d = new Date(event.date + 'T00:00:00');
                const month = d
                  .toLocaleString('en-US', { month: 'short' })
                  .toUpperCase();
                const day = d.getDate().toString().padStart(2, '0');
                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group glass glass-hover card-shine rounded-2xl overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover editorial-img group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-center shadow-lg shadow-black/20">
                        <span className="block text-[9px] font-inter font-bold uppercase text-accent leading-tight">
                          {month}
                        </span>
                        <span className="block text-sm font-inter font-bold leading-none text-gray-900">
                          {day}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 pb-5">
                      <h3 className="font-syne font-bold text-sm text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 truncate">
                        {event.title}
                      </h3>
                      <p className="font-inter text-xs text-white/35 mt-1.5 truncate">
                        {event.city}
                        {event.state ? `, ${event.state}` : ''} &middot; ₹{event.price}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* --- Newsletter Signup --- */}
      <div className="px-6 md:px-12 mb-28">
        <div className="max-w-content mx-auto">
          <div className="relative glass rounded-2xl p-12 md:p-20 text-center overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/[0.04] rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/[0.03] rounded-full blur-[80px] pointer-events-none" />

            <span className="inline-block text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-accent/60 mb-6">
              Newsletter
            </span>
            <h2 className="font-playfair text-3xl md:text-5xl lg:text-6xl text-[#F5F5F0] mb-5 leading-[1.05]">
              Stay in the <span className="italic font-normal text-white/40">Loop</span>
            </h2>
            <p className="font-inter text-white/35 max-w-md mx-auto mb-10 leading-relaxed">
              Get weekly editorial picks, training tips, and event recommendations
              delivered to your inbox.
            </p>
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row items-stretch gap-3 max-w-lg mx-auto"
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={subscribeEmail}
                onChange={(e) => setSubscribeEmail(e.target.value)}
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-6 py-3.5 text-sm font-inter text-white/90 placeholder:text-white/25 outline-none focus:border-accent/40 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(255,59,16,0.08)] transition-all duration-300"
                required
              />
              <button
                type="submit"
                className="px-10 py-3.5 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-full hover:brightness-110 hover:shadow-[0_4px_20px_rgba(255,59,16,0.3)] transition-all duration-300 active:scale-95 shrink-0"
              >
                Subscribe
              </button>
            </form>
            <p className="font-inter text-[11px] text-white/20 mt-5">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
