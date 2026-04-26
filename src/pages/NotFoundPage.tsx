import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        {/* Large ghosted "404" as texture */}
        <span
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-syne font-extrabold text-white/[0.015] select-none"
          style={{ fontSize: 'clamp(20rem, 50vw, 50rem)', lineHeight: '0.8' }}
        >
          404
        </span>
        {/* Accent glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/[0.04] rounded-full blur-[120px]" />
        {/* Secondary glow */}
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent/[0.02] rounded-full blur-[100px]" />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />
      </div>

      <div className="text-center max-w-xl relative z-10">
        {/* 404 Number */}
        <div className="relative mb-8">
          <span
            className="font-syne font-extrabold text-gradient block leading-none tracking-tighter"
            style={{ fontSize: 'clamp(7rem, 18vw, 14rem)', lineHeight: '0.85' }}
          >
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-16 bg-accent/60" />
        </div>

        {/* Messaging */}
        <span className="inline-block text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-accent/60 mb-4">
          Off Course
        </span>
        <h1 className="font-playfair text-3xl md:text-5xl text-[#F5F5F0] mb-5 leading-[1.1]">
          You've Taken a{' '}
          <span className="italic font-normal text-white/40">Wrong Turn</span>
        </h1>
        <p className="font-inter text-base text-white/35 mb-10 leading-relaxed max-w-md mx-auto">
          This page doesn't exist on the course map. Let's get you back to the route and find what you're looking for.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 px-8 py-4 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-full hover:brightness-110 hover:shadow-[0_4px_24px_rgba(255,59,16,0.3)] transition-all duration-300 active:scale-[0.97]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back Home
          </Link>
          <Link
            to="/events"
            className="inline-flex items-center gap-2.5 px-8 py-4 border border-white/[0.08] text-[#F5F5F0] font-syne font-bold text-sm uppercase tracking-wide rounded-full hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300"
          >
            <Search className="w-4 h-4 text-white/40" />
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
