import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-28 px-6 md:px-12">
      <div className="max-w-content mx-auto">
        <div className="relative rounded-3xl overflow-hidden min-h-[560px]">
          {/* Background image */}
          <img
            src="https://images.pexels.com/photos/2524739/pexels-photo-2524739.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Athletes running"
            className="absolute inset-0 w-full h-full object-cover editorial-img opacity-30"
          />

          {/* Multi-layer gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/70 to-surface/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/60 via-transparent to-surface/30" />

          {/* Accent glow */}
          <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-accent/[0.04] rounded-full blur-[100px] pointer-events-none" />

          {/* Content */}
          <div className="relative h-full flex items-center px-8 md:px-16 py-20">
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-2 text-[10px] font-inter font-bold uppercase tracking-[0.25em] text-accent/80 mb-6">
                <span className="w-8 h-px bg-accent/50" />
                Join the Community
              </span>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl text-white leading-[0.95] tracking-[-0.02em] mb-6">
                Your Next Race
                <br />
                <span className="italic font-normal text-white/40">Starts Here</span>
              </h2>
              <p className="font-inter text-white/35 text-base md:text-lg leading-[1.7] mb-10 max-w-md">
                Whether you are a weekend jogger or an ultra-marathon veteran, SPORTSARCH
                connects you with the events that matter.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/events"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-full transition-all duration-300 hover:shadow-xl hover:shadow-accent/25 active:scale-[0.97]"
                >
                  Explore Events
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 text-white/70 font-syne font-bold text-sm uppercase tracking-wide rounded-full transition-all duration-300 hover:border-white/30 hover:text-white hover:bg-white/[0.03]"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
