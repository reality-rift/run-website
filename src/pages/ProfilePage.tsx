import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  LogOut,
  MapPin,
  Plus,
  Megaphone,
  Pencil,
  Check,
  X,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Camera,
  Phone,
  Award,
  Trophy,
} from 'lucide-react';

type RunnerLevel = 'beginner' | 'amateur' | 'pro';

const RUNNER_LEVELS: { key: RunnerLevel; label: string }[] = [
  { key: 'beginner', label: 'Beginner' },
  { key: 'amateur', label: 'Amateur' },
  { key: 'pro', label: 'Pro' },
];

const LEVEL_BADGE: Record<RunnerLevel, string> = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amateur: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  pro: 'bg-accent/10 text-accent border-accent/20',
};
import { useAuth } from '../contexts/AuthContext';
import { supabase, type EventRow } from '../lib/supabase';
import { resolveImageUrl } from '../lib/imageUrl';
import { useToast } from '../components/Toast';
import RegisteredEventsView from '../components/RegisteredEventsView';


type Tab = 'saved' | 'registered' | 'myevents';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>('registered');
  const [savedEvents, setSavedEvents] = useState<EventRow[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<EventRow[]>([]);
  const [myEvents, setMyEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Enhanced profile fields
  const [profileBio, setProfileBio] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileLevel, setProfileLevel] = useState<RunnerLevel>('beginner');
  const [profileAchievements, setProfileAchievements] = useState<string[]>([]);
  const [editBio, setEditBio] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editLevel, setEditLevel] = useState<RunnerLevel>('beginner');
  const [editAchievements, setEditAchievements] = useState<string[]>([]);
  const [achievementInput, setAchievementInput] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    Promise.all([
      supabase
        .from('saved_events')
        .select('event_id, events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('registrations')
        .select('event_id, events(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('events')
        .select('*')
        .eq('organizer_id', user.id)
        .order('created_at', { ascending: false }),
    ]).then(([savedRes, regRes, myRes]) => {
      if (savedRes.data) {
        setSavedEvents(
          savedRes.data
            .map((r: Record<string, unknown>) => r.events as EventRow)
            .filter(Boolean),
        );
      }
      if (regRes.data) {
        setRegisteredEvents(
          regRes.data
            .map((r: Record<string, unknown>) => r.events as EventRow)
            .filter(Boolean),
        );
      }
      if (myRes.data) {
        setMyEvents(myRes.data);
      }
      setLoading(false);
    });
  }, [user]);

  // Fetch profile fields from profiles table
  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('avatar_url, bio, phone, runner_level, achievements')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        if (data.avatar_url) setProfileAvatarUrl(data.avatar_url);
        setProfileBio(data.bio || '');
        setProfilePhone(data.phone || '');
        setProfileLevel((data.runner_level as RunnerLevel) || 'beginner');
        setProfileAchievements(data.achievements || []);
      });
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast('Image must be under 2MB');
      return;
    }

    setUploadingAvatar(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      toast('Upload failed');
      setUploadingAvatar(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    // Update profiles table
    await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', user.id);

    // Also update auth user_metadata so Navbar picks it up
    await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    setProfileAvatarUrl(publicUrl);
    toast('Profile photo updated');
    setUploadingAvatar(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name || user.email?.split('@')[0] || 'Athlete';
  const avatarUrl = profileAvatarUrl || user.user_metadata?.avatar_url;
  const currentEvents =
    tab === 'saved' ? savedEvents : tab === 'registered' ? registeredEvents : myEvents;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleStartEdit = () => {
    setEditName(displayName);
    setEditBio(profileBio);
    setEditPhone(profilePhone);
    setEditLevel(profileLevel);
    setEditAchievements(profileAchievements);
    setAchievementInput('');
    setEditing(true);
  };

  const addAchievement = () => {
    const a = achievementInput.trim();
    if (!a || editAchievements.includes(a) || editAchievements.length >= 12) return;
    setEditAchievements((prev) => [...prev, a]);
    setAchievementInput('');
  };

  const removeAchievement = (idx: number) => {
    setEditAchievements((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveProfile = async () => {
    const trimmed = editName.trim();
    if (!trimmed) return;

    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: trimmed },
    });

    if (!error) {
      await supabase
        .from('profiles')
        .update({
          display_name: trimmed,
          bio: editBio.trim(),
          phone: editPhone.trim(),
          runner_level: editLevel,
          achievements: editAchievements,
        })
        .eq('id', user.id);
      setProfileBio(editBio.trim());
      setProfilePhone(editPhone.trim());
      setProfileLevel(editLevel);
      setProfileAchievements(editAchievements);
      toast('Profile updated');
    } else {
      toast('Failed to update profile');
    }

    setSaving(false);
    setEditing(false);
  };

  const tabs: { key: Tab; label: string; icon: typeof Heart; count: number; show: boolean }[] = [
    { key: 'registered', label: 'Registered', icon: Calendar, count: registeredEvents.length, show: true },
    { key: 'saved', label: 'Shortlisted', icon: Heart, count: savedEvents.length, show: true },
    { key: 'myevents', label: 'My Events', icon: Megaphone, count: myEvents.length, show: !!isOrganizer },
  ];

  return (
    <div className="min-h-screen bg-surface pt-24">
      {/* ── Profile Header ─────────────────────────────────────────── */}
      <div className="px-6 md:px-12 mb-14">
        <div className="max-w-content mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Avatar */}
            <div className="relative group/avatar">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a] ring-2 ring-white/[0.06] ring-offset-4 ring-offset-[#111111] shrink-0">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                    <span className="font-syne font-bold text-3xl text-accent">
                      {displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {/* Upload button overlay */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-8 h-8 rounded-full bg-accent border-2 border-[#111111] flex items-center justify-center text-black hover:brightness-110 transition-all cursor-pointer"
                  title="Upload photo"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Name & email */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="space-y-4 max-w-xl">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setEditing(false);
                    }}
                    placeholder="Display name"
                    className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3 text-xl font-syne font-bold text-[#F5F5F0] outline-none focus:border-accent/40 focus:bg-white/[0.06] transition-all w-full"
                    autoFocus
                  />
                  <textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Bio — tell the community about yourself..."
                    rows={3}
                    maxLength={300}
                    className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3 text-sm font-inter text-white/80 outline-none focus:border-accent/40 transition-all w-full resize-none"
                  />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Mobile number"
                    maxLength={15}
                    className="bg-white/[0.04] border border-white/10 rounded-xl px-5 py-3 text-sm font-inter text-white/80 outline-none focus:border-accent/40 transition-all w-full"
                  />
                  {/* Runner level */}
                  <div>
                    <span className="block font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
                      Runner Level
                    </span>
                    <div className="flex gap-2">
                      {RUNNER_LEVELS.map((l) => (
                        <button
                          key={l.key}
                          type="button"
                          onClick={() => setEditLevel(l.key)}
                          className={`px-5 py-2 rounded-full text-xs font-inter font-bold uppercase tracking-wider transition-all duration-300 border ${
                            editLevel === l.key
                              ? LEVEL_BADGE[l.key]
                              : 'bg-white/[0.03] text-white/35 border-white/[0.08] hover:text-white/60'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Achievements */}
                  <div>
                    <span className="block font-inter text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2">
                      Achievements
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addAchievement();
                          }
                        }}
                        placeholder="e.g. Finished Mumbai Half Marathon 2025"
                        maxLength={80}
                        className="bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-inter text-white/80 outline-none focus:border-accent/40 transition-all flex-1"
                      />
                      <button
                        type="button"
                        onClick={addAchievement}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white/60 text-sm font-inter hover:border-accent/40 hover:text-accent transition-all"
                      >
                        Add
                      </button>
                    </div>
                    {editAchievements.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {editAchievements.map((a, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-inter font-semibold bg-accent/10 text-accent border border-accent/15"
                          >
                            <Trophy className="w-3 h-3" />
                            {a}
                            <button
                              type="button"
                              onClick={() => removeAchievement(i)}
                              className="hover:text-red-400 transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Save / Cancel */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving || !editName.trim()}
                      className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-black font-syne font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 rounded-xl border border-white/10 text-white/40 font-inter text-sm hover:text-white/70 hover:border-white/20 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 flex-wrap">
                    <h1 className="font-syne font-bold text-4xl text-[#F5F5F0] tracking-tight">
                      {displayName}
                    </h1>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-inter font-bold border ${LEVEL_BADGE[profileLevel]}`}
                    >
                      <Award className="w-3 h-3" />
                      {RUNNER_LEVELS.find((l) => l.key === profileLevel)?.label}
                    </span>
                    <button
                      onClick={handleStartEdit}
                      className="w-9 h-9 rounded-xl border border-white/[0.06] flex items-center justify-center text-white/20 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-inter text-sm text-white/35 mt-2 tracking-wide">{user.email}</p>
                  {profilePhone && (
                    <p className="flex items-center gap-1.5 font-inter text-sm text-white/35 mt-1">
                      <Phone className="w-3.5 h-3.5" />
                      {profilePhone}
                    </p>
                  )}
                  {profileBio && (
                    <p className="font-inter text-sm text-white/50 mt-3 max-w-xl leading-relaxed">
                      {profileBio}
                    </p>
                  )}
                  {profileAchievements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {profileAchievements.map((a, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-inter font-semibold bg-accent/10 text-accent border border-accent/15"
                        >
                          <Trophy className="w-3 h-3" />
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="group flex items-center gap-2.5 px-6 py-3 border border-white/[0.06] rounded-xl text-sm font-inter text-white/40 hover:text-red-400 hover:border-red-400/20 hover:bg-red-400/5 transition-all duration-300"
            >
              <LogOut className="w-4 h-4 group-hover:translate-x-[-2px] transition-transform duration-300" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ─────────────────────────────────────────── */}
      <div className="px-6 md:px-12 mb-10">
        <div className="max-w-content mx-auto">
          <div className="relative flex gap-8 border-b border-white/[0.06]">
            {tabs.filter(t => t.show).map((t) => {
              const Icon = t.icon;
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-2.5 pb-4 font-inter text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-[#F5F5F0]'
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors duration-300 ${isActive ? 'text-accent' : ''}`} />
                  <span className="font-medium">{t.label}</span>
                  <span className={`ml-0.5 text-xs tabular-nums transition-colors duration-300 ${
                    isActive ? 'text-accent' : 'text-white/20'
                  }`}>
                    {t.count}
                  </span>
                  {/* Active indicator */}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-accent opacity-100'
                        : 'bg-transparent opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Tab Content ────────────────────────────────────────────── */}
      <div className="px-6 md:px-12 pb-24">
        <div className="max-w-content mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((n) => (
                <div key={n} className="rounded-2xl overflow-hidden">
                  <div className="aspect-[16/10] bg-white/[0.03] animate-pulse" />
                  <div className="p-5 space-y-3 bg-white/[0.02]">
                    <div className="h-5 bg-white/[0.04] rounded-lg w-3/4 animate-pulse" />
                    <div className="h-3 bg-white/[0.03] rounded-lg w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : tab === 'registered' && registeredEvents.length > 0 ? (
            <RegisteredEventsView events={registeredEvents} />
          ) : currentEvents.length === 0 ? (
            /* ── Empty State ─────────────────────────────────────── */
            <div className="text-center py-24">
              <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-8 rotate-3">
                {tab === 'saved' ? (
                  <Heart className="w-8 h-8 text-white/15" />
                ) : tab === 'registered' ? (
                  <Calendar className="w-8 h-8 text-white/15" />
                ) : (
                  <Megaphone className="w-8 h-8 text-white/15" />
                )}
              </div>
              <h3 className="font-syne font-bold text-xl text-[#F5F5F0]/80 mb-3">
                {tab === 'saved'
                  ? 'No shortlisted events'
                  : tab === 'registered'
                    ? 'No registrations yet'
                    : 'No events created yet'}
              </h3>
              <p className="font-inter text-white/30 text-sm max-w-sm mx-auto mb-10 leading-relaxed">
                {tab === 'saved'
                  ? 'Events you shortlist will appear here so you can easily find them later.'
                  : tab === 'registered'
                    ? 'Your upcoming races and events will be listed here after registration.'
                    : 'Create your first event and start building your community.'}
              </p>
              <Link
                to={tab === 'myevents' ? '/create-event' : '/events'}
                className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-xl hover:brightness-110 hover:shadow-lg hover:shadow-accent/20 transition-all duration-300"
              >
                {tab === 'myevents' ? (
                  <>
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    Create Event
                  </>
                ) : (
                  'Browse Events'
                )}
              </Link>
            </div>
          ) : (
            /* ── Event Cards Grid ────────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {currentEvents.map((event) => {
                const d = new Date(event.date + 'T00:00:00');
                const month = d
                  .toLocaleString('en-US', { month: 'short' })
                  .toUpperCase();
                const day = d.getDate().toString().padStart(2, '0');
                const showStatus = tab === 'myevents' && event.status;
                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group relative bg-white/[0.02] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-accent/25 hover:bg-white/[0.03] transition-all duration-500"
                  >
                    {/* Image */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={resolveImageUrl(event.image_url)}
                        alt={event.title}
                        className="w-full h-full object-cover editorial-img group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                      {/* Date chip */}
                      <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-center border border-white/[0.08]">
                        <span className="block text-[9px] font-inter font-bold uppercase tracking-wider text-accent">
                          {month}
                        </span>
                        <span className="block text-lg font-inter font-bold leading-none text-[#F5F5F0]">
                          {day}
                        </span>
                      </div>

                      {/* Status badge */}
                      {showStatus && (
                        <div className="absolute top-3 right-3">
                          {event.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-inter font-bold bg-amber-500/90 text-white backdrop-blur-sm">
                              <Clock className="w-3 h-3" />
                              Pending Review
                            </span>
                          )}
                          {event.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-inter font-bold bg-emerald-500/90 text-white backdrop-blur-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          )}
                          {event.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-inter font-bold bg-red-500/90 text-white backdrop-blur-sm">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="font-syne font-bold text-lg text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 truncate">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2 text-white/35">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-sm font-inter truncate">
                          {event.city}
                          {event.state ? `, ${event.state}` : ''}
                        </span>
                      </div>
                      {showStatus && event.status === 'rejected' && event.rejection_reason && (
                        <p className="mt-3 text-xs font-inter text-red-400/80 bg-red-500/[0.06] border border-red-500/10 px-3 py-2 rounded-lg line-clamp-2">
                          {event.rejection_reason}
                        </p>
                      )}
                      {showStatus && event.status === 'rejected' && (
                        <Link
                          to="/create-event"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-inter font-medium text-accent hover:text-accent/80 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Plus className="w-3 h-3" />
                          Re-submit Event
                        </Link>
                      )}
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
                        <div className="flex flex-wrap gap-1.5">
                          {event.distance_tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-inter font-semibold bg-accent/10 text-accent"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="font-inter font-semibold text-sm text-[#F5F5F0]/80">
                          {'\u20B9'}{event.price}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
