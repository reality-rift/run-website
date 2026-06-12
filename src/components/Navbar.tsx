import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, User, Plus, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const baseLinks = [
  { label: 'Calendar', to: '/#calendar' },
  { label: 'Events', to: '/events' },
  { label: 'Community', to: '/community' },
  { label: 'Experts', to: '/experts' },
  { label: 'Editorial', to: '/editorial' },
];

export default function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { user, loading, signOut, isOrganizer, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (to: string) => {
    if (to.startsWith('/#')) {
      const id = to.slice(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 80 && y > lastScrollY.current);
      setScrolled(y > 20);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
      >
        {/* Background - transitions from transparent gradient to solid glass */}
        <div
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            scrolled
              ? 'bg-surface/80 backdrop-blur-xl border-b border-white/[0.06]'
              : 'bg-gradient-to-b from-black/60 via-black/20 to-transparent'
          }`}
        />

        <div className="relative flex items-center justify-between px-6 md:px-12 py-5 max-w-content mx-auto">
          {/* Logo */}
          <Link
            to="/"
            className="pointer-events-auto flex items-center gap-2 group"
            onClick={() => setMobileOpen(false)}
          >
            <span className="font-syne font-extrabold text-xl tracking-[-0.04em] text-[#F5F5F0] group-hover:text-accent transition-colors duration-300">
              SPORTS<span className="text-accent">ARCH</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1 pointer-events-auto">
            {baseLinks.map((link) =>
              link.to.startsWith('/#') ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.to)}
                  className="relative font-inter text-[15px] text-white/60 px-5 py-2.5 rounded-full transition-all duration-300 hover:text-white hover:bg-white/[0.04]"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  className="relative font-inter text-[15px] text-white/60 px-5 py-2.5 rounded-full transition-all duration-300 hover:text-white hover:bg-white/[0.04]"
                >
                  {link.label}
                </Link>
              )
            )}

            {!loading && (
              user ? (
                <div className="flex items-center gap-1 ml-2 pl-3 border-l border-white/[0.08]">
                  {isOrganizer && (
                    <Link
                      to="/create-event"
                      className="flex items-center gap-1.5 font-inter text-[15px] text-white/60 px-3 py-2 rounded-full transition-all duration-300 hover:text-accent hover:bg-accent/5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Create</span>
                    </Link>
                  )}
                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-1.5 font-inter text-[15px] text-white/60 px-3 py-2 rounded-full transition-all duration-300 hover:text-accent hover:bg-accent/5"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 font-inter text-[15px] text-white/60 px-3 py-2 rounded-full transition-all duration-300 hover:text-white hover:bg-white/[0.04]"
                  >
                    {user.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-white/10"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center text-white/40 px-2 py-2 rounded-full transition-all duration-300 hover:text-white/70 hover:bg-white/[0.04]"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-3 font-inter text-[15px] font-medium text-black bg-accent px-6 py-2.5 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.97]"
                >
                  Login
                </Link>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden pointer-events-auto w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/[0.05] transition-colors duration-300 text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-surface transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className={`flex flex-col justify-center items-start px-8 h-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${mobileOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Nav links */}
          <div className="space-y-1 mb-8">
            {baseLinks.map((link, i) =>
              link.to.startsWith('/#') ? (
                <button
                  key={link.label}
                  onClick={() => {
                    setMobileOpen(false);
                    handleNavClick(link.to);
                  }}
                  className="block font-syne font-bold text-[3rem] leading-tight text-[#F5F5F0] hover:text-accent transition-colors duration-300 text-left"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="block font-syne font-bold text-[3rem] leading-tight text-[#F5F5F0] hover:text-accent transition-colors duration-300"
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-white/10 mb-8" />

          {/* Auth section */}
          {!loading && (
            user ? (
              <div className="space-y-4">
                {isOrganizer && (
                  <Link
                    to="/create-event"
                    onClick={() => setMobileOpen(false)}
                    className="block font-syne font-bold text-2xl text-accent transition-colors duration-300 hover:text-accent/80"
                  >
                    Create Event
                  </Link>
                )}
                {role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="block font-syne font-bold text-2xl text-white/40 transition-colors duration-300 hover:text-white"
                  >
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="block font-syne font-bold text-2xl text-white/40 transition-colors duration-300 hover:text-white"
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  className="block font-syne font-bold text-2xl text-white/40 transition-colors duration-300 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center gap-2 font-syne font-bold text-2xl text-accent"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </>
  );
}
