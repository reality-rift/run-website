import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Zap, PersonStanding, Bike, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
  {
    word: 'Run.',
    image:
      'https://images.pexels.com/photos/1571939/pexels-photo-1571939.jpeg?auto=compress&cs=tinysrgb&w=1920',
    position: 'center 20%',
  },
  {
    word: 'Cycle.',
    image:
      'https://images.pexels.com/photos/15289790/pexels-photo-15289790.jpeg?auto=compress&cs=tinysrgb&w=1920',
    position: 'center 40%',
  },
  {
    word: 'Thrill.',
    image:
      'https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1920',
    position: 'center 30%',
  },
];

const INTERVAL = 5000;

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Goa', 'Indore', 'Coimbatore',
  'Vadodara', 'Nagpur', 'Visakhapatnam', 'Bhopal', 'Thiruvananthapuram',
  'Dehradun', 'Mysuru', 'Guwahati', 'Leh',
];

const sportOptions = [
  { value: 'all', label: 'All Sports', Icon: Zap },
  { value: 'running', label: 'Running', Icon: PersonStanding },
  { value: 'cycling', label: 'Cycling', Icon: Bike },
];

export default function Hero() {
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const [sport, setSport] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const advance = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
      setAnimating(false);
    }, 700);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, INTERVAL);
    return () => clearInterval(id);
  }, [advance]);

  /* Close city dropdown on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCities = cityQuery.trim()
    ? INDIAN_CITIES.filter((c) => c.toLowerCase().includes(cityQuery.toLowerCase()))
    : INDIAN_CITIES;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (sport !== 'all') params.set('sport', sport);
    navigate(`/events${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.word}
          className="absolute inset-0 transition-opacity duration-[1400ms] ease-in-out"
          style={{ opacity: i === activeIndex ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={`Hero background - ${slide.word}`}
            className="w-full h-full object-cover editorial-img opacity-40 scale-105"
            style={{ objectPosition: slide.position }}
          />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/60 to-surface/30 z-[5]" />
      <div className="absolute inset-0 bg-gradient-to-r from-surface/40 to-transparent z-[5]" />

      {/* Slide progress indicators */}
      <div className="absolute bottom-0 left-0 right-0 z-[8] flex">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-[2px] bg-white/[0.06]">
            <div
              className="h-full bg-accent/60 transition-all duration-700"
              style={{ width: i === activeIndex ? '100%' : i < activeIndex ? '100%' : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative h-full flex flex-col justify-end pb-32 px-6 md:px-12 max-w-content mx-auto z-[9]">
        {/* Eyebrow label */}
        <div className="animate-fade-in-up mb-6">
          <span className="inline-flex items-center gap-3 text-[10px] font-inter font-bold uppercase tracking-[0.3em] text-white/30">
            <span className="w-8 h-px bg-accent/50" />
            India's Running & Cycling Hub
          </span>
        </div>

        {/* Main heading */}
        <h1 className="animate-fade-in-up font-playfair text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] xl:text-[8.5rem] text-[#F5F5F0] leading-[0.92] tracking-[-0.03em]">
          Discover Your
          <br />
          <span className="italic font-normal">
            Next{' '}
            <span className="relative inline-block overflow-hidden ml-1 md:ml-3 align-bottom min-w-[6ch] sm:min-w-[7ch]">
              {/* Invisible spacer to give container height */}
              <span className="invisible">Thrill.</span>
              {slides.map((slide, i) => (
                <span
                  key={slide.word}
                  className="absolute left-0 bottom-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap"
                  style={{
                    transform:
                      i === activeIndex
                        ? animating
                          ? 'translateY(-120%)'
                          : 'translateY(0%)'
                        : i === (activeIndex + 1) % slides.length && animating
                          ? 'translateY(0%)'
                          : 'translateY(120%)',
                    opacity:
                      i === activeIndex
                        ? animating
                          ? 0
                          : 1
                        : i === (activeIndex + 1) % slides.length && animating
                          ? 1
                          : 0,
                  }}
                >
                  <span className="text-accent">{slide.word}</span>
                </span>
              ))}
            </span>
          </span>
        </h1>

        {/* Search bar */}
        <div className="mt-12 animate-fade-in-up animation-delay-200 relative z-[20]">
          <div className="glass rounded-2xl md:rounded-full p-4 md:p-2 flex flex-col md:flex-row items-stretch gap-3 md:gap-0 max-w-3xl shadow-2xl shadow-black/20">
            {/* City search */}
            <div ref={cityRef} className="flex-1 px-5 flex flex-col justify-center h-14 group relative">
              <label className="text-[9px] font-inter font-bold uppercase tracking-[0.2em] text-white/25 group-focus-within:text-accent/60 transition-colors duration-300">
                City
              </label>
              <div className="relative flex items-center">
                <MapPin className="w-3.5 h-3.5 text-white/20 mr-1.5 shrink-0" />
                <input
                  type="text"
                  value={cityOpen ? cityQuery : city || 'All Cities'}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setCity(e.target.value);
                    if (!cityOpen) setCityOpen(true);
                  }}
                  onFocus={() => {
                    setCityOpen(true);
                    setCityQuery(city);
                  }}
                  placeholder="Search city..."
                  className="bg-transparent text-sm font-inter text-white/90 outline-none w-full"
                />
              </div>
              {cityOpen && (
                <div className="absolute bottom-full left-0 mb-3 w-full max-h-72 overflow-y-auto rounded-xl border border-white/[0.1] bg-[#1a1a1a]/95 backdrop-blur-xl shadow-2xl shadow-black/40 z-50">
                  {/* All Cities option */}
                  <button
                    type="button"
                    onClick={() => {
                      setCity('');
                      setCityQuery('');
                      setCityOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors duration-150 ${
                      !city ? 'bg-accent/10 text-accent' : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                    }`}
                  >
                    All Cities
                  </button>
                  {filteredCities.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCity(c);
                        setCityQuery(c);
                        setCityOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors duration-150 ${
                        city === c ? 'bg-accent/10 text-accent' : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <div className="px-4 py-3 text-xs font-inter text-white/30">
                      No match — your typed city will be used
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px bg-white/[0.08] my-3" />
            <div className="md:hidden h-px bg-white/[0.08] mx-4" />

            {/* Sport pill selector */}
            <div className="flex-1 px-5 flex flex-col justify-center h-14">
              <label className="text-[9px] font-inter font-bold uppercase tracking-[0.2em] text-white/25 mb-1">
                Sport
              </label>
              <div className="flex items-center gap-1.5">
                {sportOptions.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSport(s.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-inter font-medium transition-all duration-300 whitespace-nowrap ${
                      sport === s.value
                        ? 'bg-accent text-black'
                        : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70'
                    }`}
                  >
                    <s.Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="h-14 px-8 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-xl md:rounded-full flex items-center justify-center gap-2.5 transition-all duration-300 active:scale-[0.97] hover:shadow-lg hover:shadow-accent/20 shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[8] animate-fade-in-up animation-delay-300">
        <button
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          className="flex flex-col items-center gap-2 group"
        >
          <span className="text-[9px] font-inter font-bold uppercase tracking-[0.3em] text-white/20 group-hover:text-white/40 transition-colors duration-300">
            Scroll
          </span>
          <div className="w-5 h-8 rounded-full border border-white/15 flex items-start justify-center p-1.5 group-hover:border-white/30 transition-colors duration-300">
            <div className="w-0.5 h-2 bg-white/30 rounded-full animate-bounce" />
          </div>
        </button>
      </div>
    </section>
  );
}
