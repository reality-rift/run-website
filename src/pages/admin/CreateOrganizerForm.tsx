import { useState } from 'react';
import { UserPlus, Loader2, Eye, EyeOff, Copy, Check, Mail, Lock, User, Phone, Building2 } from 'lucide-react';
import { useToast } from '../../components/Toast';
import { supabase } from '../../lib/supabase';

interface CreatedCreds {
  email: string;
  password: string;
  displayName: string;
  phone: string;
  organization: string;
}

export default function CreateOrganizerForm({ onCreated }: { onCreated: () => void }) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [organization, setOrganization] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<CreatedCreds | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    let pwd = '';
    for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    setPassword(pwd);
    setShowPassword(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const res = await fetch(`${supabaseUrl}/functions/v1/create-organizer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
          display_name: displayName.trim(),
          phone: phone.trim(),
          organization: organization.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create organizer.');
      } else {
        setCreated({ email: email.trim(), password, displayName: displayName.trim(), phone: phone.trim(), organization: organization.trim() });
        toast('Organizer account created');
        onCreated();
        setEmail('');
        setPassword('');
        setDisplayName('');
        setPhone('');
        setOrganization('');
      }
    } catch {
      setError('Network error. Please try again.');
    }

    setSubmitting(false);
  };

  const copyCredentials = async () => {
    if (!created) return;
    const text = `SPORTARCH Organizer Credentials\n\nEmail: ${created.email}\nPassword: ${created.password}${created.displayName ? `\nName: ${created.displayName}` : ''}${created.phone ? `\nPhone: ${created.phone}` : ''}${created.organization ? `\nOrganization: ${created.organization}` : ''}\n\nLogin at: ${window.location.origin}/login`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      <div className="px-8 py-7 border-b border-white/[0.06]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-syne font-bold text-xl text-[#F5F5F0]">Create Organizer</h2>
            <p className="font-inter text-xs text-white/30 mt-0.5">Generate login credentials for a new organizer</p>
          </div>
        </div>
      </div>

      <div className="px-8 py-7">
        {error && (
          <div className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-red-500/8 border border-red-500/15">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
            <p className="text-red-400 text-sm font-inter leading-relaxed">{error}</p>
          </div>
        )}

        {created && (
          <div className="mb-7 rounded-xl border border-emerald-500/15 overflow-hidden">
            <div className="px-5 py-3.5 bg-emerald-500/8 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="font-inter text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Credentials Ready
                </p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between py-1">
                <span className="font-inter text-xs text-white/35 uppercase tracking-wider">Email</span>
                <span className="font-inter text-sm text-[#F5F5F0] font-medium">{created.email}</span>
              </div>
              <div className="h-px bg-white/[0.04]" />
              <div className="flex items-center justify-between py-1">
                <span className="font-inter text-xs text-white/35 uppercase tracking-wider">Password</span>
                <span className="font-mono text-sm text-[#F5F5F0]">{created.password}</span>
              </div>
              {created.displayName && (
                <>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-center justify-between py-1">
                    <span className="font-inter text-xs text-white/35 uppercase tracking-wider">Name</span>
                    <span className="font-inter text-sm text-[#F5F5F0]">{created.displayName}</span>
                  </div>
                </>
              )}
              {created.phone && (
                <>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-center justify-between py-1">
                    <span className="font-inter text-xs text-white/35 uppercase tracking-wider">Phone</span>
                    <span className="font-inter text-sm text-[#F5F5F0]">{created.phone}</span>
                  </div>
                </>
              )}
              {created.organization && (
                <>
                  <div className="h-px bg-white/[0.04]" />
                  <div className="flex items-center justify-between py-1">
                    <span className="font-inter text-xs text-white/35 uppercase tracking-wider">Organization</span>
                    <span className="font-inter text-sm text-[#F5F5F0]">{created.organization}</span>
                  </div>
                </>
              )}
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={copyCredentials}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-xs font-inter font-semibold hover:bg-emerald-500/15 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Credentials'}
              </button>
              <button
                onClick={() => setCreated(null)}
                className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-white/40 text-xs font-inter font-medium hover:text-white/60 hover:bg-white/[0.06] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-inter font-semibold uppercase tracking-widest text-white/35 mb-2">
              <User className="w-3 h-3" />
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Organizer name"
              className="form-input text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-inter font-semibold uppercase tracking-widest text-white/35 mb-2">
              <Building2 className="w-3 h-3" />
              Organization / Club
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="e.g. Mumbai Runners Club"
              className="form-input text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-inter font-semibold uppercase tracking-widest text-white/35 mb-2">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="organizer@example.com"
              className="form-input text-sm"
              required
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-inter font-semibold uppercase tracking-widest text-white/35 mb-2">
              <Phone className="w-3 h-3" />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="form-input text-sm"
            />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-inter font-semibold uppercase tracking-widest text-white/35 mb-2">
              <Lock className="w-3 h-3" />
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="form-input text-sm pr-24"
                required
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={generatePassword}
                  className="text-[11px] font-inter font-semibold text-accent/70 hover:text-accent transition-colors"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2.5 bg-accent text-black font-syne font-bold text-sm uppercase py-4 px-6 rounded-full transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Create Organizer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
