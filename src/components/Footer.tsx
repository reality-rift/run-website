import { Link } from 'react-router-dom';

const platformLinks = [
  { label: 'Search Events', to: '/events' },
  { label: 'Editorial', to: '/editorial' },
];

const legalLinks = [
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

export default function Footer() {
  return (
    <footer className="relative px-6 md:px-12 pt-20 sm:pt-28 pb-8 overflow-x-clip">
      <div className="max-w-content mx-auto">
        {/* Top border */}
        <div className="h-px bg-white/[0.06] mb-12 sm:mb-16" />

        {/* Main footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          {/* Brand column */}
          <div className="md:col-span-5">
            <Link
              to="/"
              className="inline-block font-syne font-extrabold text-lg tracking-[-0.04em] text-[#F5F5F0] mb-4"
            >
              SPORTARCH
            </Link>
            <p className="font-inter text-[13px] text-white/30 leading-[1.7] max-w-sm">
              India's platform for discovering running and cycling events.
              Find your next race, track what matters, and join a community of athletes.
            </p>
          </div>

          {/* Spacer */}
          <div className="hidden md:block md:col-span-3" />

          {/* Platform links */}
          <div className="md:col-span-2">
            <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/15 mb-5">
              Platform
            </span>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-inter text-[13px] text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="md:col-span-2">
            <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.2em] text-white/15 mb-5">
              Legal
            </span>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="font-inter text-[13px] text-white/40 hover:text-white transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-inter text-[11px] text-white/15">
            &copy; {new Date().getFullYear()} SPORTARCH. All rights reserved.
          </span>
          <span className="font-inter text-[11px] text-white/10">
            Made in India
          </span>
        </div>
      </div>

      {/* Large brand watermark — outside max-w-content so it spans full width */}
      <div className="pt-4">
        <div className="h-px bg-white/[0.04] mb-8 max-w-content mx-auto px-6 md:px-12" />
        <div className="overflow-hidden px-4">
          <span
            className="font-syne font-extrabold uppercase text-white/[0.03] select-none block text-center"
            style={{
              fontSize: 'clamp(2rem, 8vw, 10rem)',
              lineHeight: '1.15',
              letterSpacing: '-0.03em',
              paddingRight: '0.05em',
            }}
          >
            SPORTARCH
          </span>
        </div>
      </div>
    </footer>
  );
}
