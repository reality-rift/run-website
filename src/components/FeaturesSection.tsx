interface Feature {
  icon: React.FC<{ className?: string }>;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
}

/* ── Custom polished SVG icons ────────────────────────────────────── */

function DiscoverIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.5 4h11a1 1 0 011 1v15.5a.5.5 0 01-.8.4L12 16.5l-5.7 4.4a.5.5 0 01-.8-.4V5a1 1 0 011-1z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path d="M10 10l1.5 1.5L14.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarSyncIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.2" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M14.5 14.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M14.5 12v2.5h2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PulseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 12h3.5l2-5 3 10 3-7 2 2H21"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1" opacity="0.1" strokeDasharray="2 2" />
    </svg>
  );
}

function GlobeMapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1" />
      <path d="M3.5 9h17M3.5 15h17" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <circle cx="16" cy="8" r="2" fill="currentColor" opacity="0.25" />
      <circle cx="16" cy="8" r="0.8" fill="currentColor" />
    </svg>
  );
}

/* ── Feature data ─────────────────────────────────────────────────── */

const features: Feature[] = [
  {
    icon: DiscoverIcon,
    title: 'Smart Discovery',
    description:
      'Filter by sport, distance, city, and price to find the perfect event for your level and goals.',
    stat: '49+',
    statLabel: 'Events listed',
  },
  {
    icon: BookmarkIcon,
    title: 'Save & Track',
    description:
      'Bookmark events you love and build your personal events list. Never lose track of a race you care about.',
    stat: '1-tap',
    statLabel: 'To save any event',
  },
  {
    icon: CalendarSyncIcon,
    title: 'Google Calendar Sync',
    description:
      'Add events directly to your Google Calendar with one click. Get reminders so you never miss race day.',
    stat: 'Instant',
    statLabel: 'Calendar sync',
  },
  {
    icon: PulseIcon,
    title: 'Real-Time Updates',
    description:
      'Stay informed with live interest counts, availability alerts, and trending event signals.',
    stat: 'Live',
    statLabel: 'Trending data',
  },
  {
    icon: GlobeMapIcon,
    title: 'Multi-City Coverage',
    description:
      'From Mumbai to Bengaluru, discover events across every major running and cycling city in India.',
    stat: '4+',
    statLabel: 'Cities covered',
  },
];

/* ── Component ────────────────────────────────────────────────────── */

export default function FeaturesSection() {
  return (
    <section className="relative py-32 px-6 md:px-12 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-content mx-auto relative">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-20">
          <div>
            <span className="inline-flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-[0.25em] text-accent/80 mb-5">
              <span className="w-8 h-px bg-accent/50" />
              Why SPORTARCH
            </span>
            <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-[#F5F5F0] leading-[1.1] max-w-xl">
              Built for runners,{' '}
              <span className="italic text-white/40">by runners.</span>
            </h2>
          </div>
          <p className="font-inter text-sm text-white/35 leading-relaxed max-w-sm lg:text-right">
            Every feature is designed around how runners and cyclists actually discover, plan, and show up for events.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/[0.06] rounded-3xl overflow-hidden">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            const isLast = i === features.length - 1;
            return (
              <div
                key={feature.title}
                className={`group relative bg-surface p-10 transition-all duration-500 hover:bg-white/[0.03] ${
                  isLast ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Number index */}
                <span className="absolute top-8 right-8 font-inter text-[11px] font-medium text-white/[0.08] tabular-nums">
                  0{i + 1}
                </span>

                {/* Icon */}
                <div className="relative w-11 h-11 mb-8">
                  <div className="absolute inset-0 bg-accent/10 rounded-xl group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-500" />
                  <div className="relative w-full h-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-syne font-bold text-[15px] tracking-tight text-[#F5F5F0] mb-3">
                  {feature.title}
                </h3>
                <p className="font-inter text-[13px] text-white/30 leading-[1.7] mb-8">
                  {feature.description}
                </p>

                {/* Stat */}
                <div className="pt-6 border-t border-white/[0.05]">
                  <span className="block font-syne font-bold text-2xl text-accent/90 leading-none mb-1">
                    {feature.stat}
                  </span>
                  <span className="font-inter text-[11px] text-white/25 uppercase tracking-wider">
                    {feature.statLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
