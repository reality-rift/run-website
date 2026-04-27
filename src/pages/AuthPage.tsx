import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Loader2, User, Phone, MapPin } from 'lucide-react';

type Mode = 'login' | 'signup';

export default function AuthPage() {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validateFields = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email';
    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateFields()) return;

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (!phone.trim()) {
        setError('Please enter your phone number.');
        return;
      }
      if (!location.trim()) {
        setError('Please enter your location.');
        return;
      }
      if (!privacyAccepted) {
        setError('You must accept the Privacy Policy to create an account.');
        return;
      }
    }

    setSubmitting(true);

    if (mode === 'signup') {
      const { error: err } = await signUp(email.trim(), password, {
        fullName: fullName.trim(),
        phone: phone.trim(),
        location: location.trim(),
        privacyAccepted,
      });
      if (err) {
        setError(err);
      } else {
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setPassword('');
        setFullName('');
        setPhone('');
        setLocation('');
        setPrivacyAccepted(false);
      }
    } else {
      const { error: err } = await signIn(email.trim(), password);
      if (err) {
        setError(err);
      }
    }

    setSubmitting(false);
  };

  const inputClasses =
    'w-full bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-3.5 text-sm font-inter text-[#F5F5F0] placeholder:text-white/25 outline-none focus:border-accent/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-accent/10 transition-all duration-300';

  const inputWithIconClasses =
    'w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-11 pr-4 py-3.5 text-sm font-inter text-[#F5F5F0] placeholder:text-white/25 outline-none focus:border-accent/40 focus:bg-white/[0.05] focus:ring-1 focus:ring-accent/10 transition-all duration-300';

  return (
    <div className="min-h-screen flex bg-surface">
      {/* ── Left Cinematic Panel ─────────────────────────────────── */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2526878/pexels-photo-2526878.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Athletes running"
          className="w-full h-full object-cover editorial-img scale-105"
          style={{ objectPosition: 'center 30%' }}
        />
        {/* Cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-[#111111]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/30 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/60 via-transparent to-transparent h-1/3" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-between p-16">
          {/* Top logo */}
          <div>
            <Link to="/" className="font-syne font-bold text-xl text-white/90 tracking-wider">
              SPORTSARCH
            </Link>
          </div>

          {/* Bottom editorial text */}
          <div className="max-w-lg">
            <div className="w-12 h-[2px] bg-accent mb-8" />
            <h2 className="font-playfair text-5xl text-white leading-[1.15] mb-6">
              Your Next Race
              <br />
              <span className="italic font-normal text-white/50">Starts Here</span>
            </h2>
            <p className="font-inter text-white/35 text-sm leading-relaxed max-w-md">
              Join thousands of athletes who use SPORTSARCH to discover events,
              track registrations, and connect with the endurance community across India.
            </p>
            {/* Stats row */}
            <div className="flex items-center gap-10 mt-10 pt-8 border-t border-white/[0.08]">
              <div>
                <span className="block font-syne font-bold text-2xl text-white/90">500+</span>
                <span className="block font-inter text-[10px] uppercase tracking-widest text-white/30 mt-1">Events</span>
              </div>
              <div>
                <span className="block font-syne font-bold text-2xl text-white/90">50K+</span>
                <span className="block font-inter text-[10px] uppercase tracking-widest text-white/30 mt-1">Athletes</span>
              </div>
              <div>
                <span className="block font-syne font-bold text-2xl text-white/90">100+</span>
                <span className="block font-inter text-[10px] uppercase tracking-widest text-white/30 mt-1">Cities</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ─────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center px-8 py-24">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-12">
            <Link to="/" className="font-syne font-bold text-xl text-accent tracking-wider">
              SPORTSARCH
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h1 className="font-syne font-bold text-4xl tracking-tight text-[#F5F5F0] mb-3">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="font-inter text-sm text-white/40 leading-relaxed">
              {mode === 'login'
                ? 'Sign in to access your saved events and registrations.'
                : 'Join SPORTSARCH to discover and register for events across India.'}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/[0.06] border border-red-500/15">
              <div className="w-1 h-full min-h-[20px] rounded-full bg-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400/90 text-sm font-inter leading-relaxed">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/15">
              <div className="w-1 h-full min-h-[20px] rounded-full bg-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-400/90 text-sm font-inter leading-relaxed">{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-white/35 mb-2.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className={inputWithIconClasses}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-white/35 mb-2.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                className={inputClasses}
                autoComplete="email"
              />
              {fieldErrors.email && <p className="mt-1.5 text-xs font-inter text-red-400">{fieldErrors.email}</p>}
            </div>

            <div>
              <label className="block text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-white/35 mb-2.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Min. 6 characters"
                  className={`${inputClasses} pr-12`}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1.5 text-xs font-inter text-red-400">{fieldErrors.password}</p>}
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-white/35 mb-2.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className={inputWithIconClasses}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-inter font-semibold uppercase tracking-[0.15em] text-white/35 mb-2.5">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, State or Country"
                      className={inputWithIconClasses}
                      autoComplete="address-level2"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setPrivacyAccepted(!privacyAccepted)}
                    className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                      privacyAccepted
                        ? 'bg-accent border-accent'
                        : 'border-white/15 hover:border-white/30'
                    }`}
                  >
                    {privacyAccepted && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <p className="font-inter text-xs text-white/40 leading-relaxed">
                    I have read and agree to the{' '}
                    <Link to="/privacy" target="_blank" className="text-accent hover:underline underline-offset-2">
                      Privacy Policy
                    </Link>
                    . I consent to the collection and use of my personal information as described.
                  </p>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide py-4 px-6 rounded-xl transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mt-3"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Google Sign-In */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="font-inter text-xs text-white/25 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
            <button
              type="button"
              disabled={googleLoading || submitting}
              onClick={async () => {
                setGoogleLoading(true);
                setError('');
                const { error: err } = await signInWithGoogle();
                if (err) {
                  setError(err);
                  setGoogleLoading(false);
                }
              }}
              className="w-full flex items-center justify-center gap-3 bg-white/[0.04] border border-white/[0.08] text-[#F5F5F0] font-inter font-medium text-sm py-3.5 px-6 rounded-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              Continue with Google
            </button>
          </div>

          {/* Toggle mode */}
          <div className="mt-8 text-center">
            <p className="font-inter text-sm text-white/35">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setSuccess('');
                }}
                className="text-accent font-semibold hover:underline underline-offset-2 transition-colors"
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <p className="font-inter text-[11px] text-white/20 mt-8 text-center leading-relaxed">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-white/35 hover:text-accent transition-colors duration-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-white/35 hover:text-accent transition-colors duration-200">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
