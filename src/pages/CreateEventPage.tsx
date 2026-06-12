import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/Toast';
import { isValidUrl } from '../lib/validation';
import ImagePicker from '../components/ImagePicker';
import LocationPicker from '../components/LocationPicker';
import {
  ArrowLeft,
  Loader2,
  Plus,
  X,
  ImageIcon,
  CalendarDays,
  MapPin,
  ChevronDown,
} from 'lucide-react';

const SPORT_OPTIONS = ['running', 'cycling'] as const;

const COMMON_DISTANCES: Record<string, string[]> = {
  running: ['5K', '10K', 'Half Marathon', 'Full Marathon', '12K'],
  cycling: ['50 km', '100 km', '200 km'],
};

const COMMON_CATEGORIES: Record<string, string[]> = {
  running: ['Road Run', 'Fun Run', 'Night Run', 'Altitude'],
  cycling: ['Cycling', 'Gran Fondo', 'Multi-Stage', 'Time Trial'],
};

const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Goa', 'Indore', 'Coimbatore',
  'Vadodara', 'Nagpur', 'Visakhapatnam', 'Bhopal', 'Thiruvananthapuram',
  'Dehradun', 'Mysuru', 'Guwahati', 'Leh',
];

const INDIAN_STATES = [
  'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Delhi',
  'West Bengal', 'Rajasthan', 'Gujarat', 'Kerala', 'Uttar Pradesh',
  'Madhya Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Goa', 'Punjab',
  'Assam', 'Andhra Pradesh', 'Bihar', 'Odisha', 'Jharkhand',
  'Chhattisgarh', 'Haryana',
];

interface FormData {
  title: string;
  description: string;
  date: string;
  sport: string;
  distanceTags: string[];
  categoryTags: string[];
  city: string;
  state: string;
  area: string;
  locationAddress: string;
  locationLat: number | null;
  locationLng: number | null;
  imageUrl: string;
  websiteUrl: string;
  contactInfo: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    whatsapp: string;
  };
  acceptVolunteers: boolean;
  entryCategories: Array<{ name: string; price: string; description: string }>;
}

const INITIAL_FORM: FormData = {
  title: '',
  description: '',
  date: '',
  sport: 'running',
  distanceTags: [],
  categoryTags: [],
  city: '',
  state: '',
  area: '',
  locationAddress: '',
  locationLat: null,
  locationLng: null,
  imageUrl: '',
  websiteUrl: '',
  contactInfo: '',
  socialLinks: { instagram: '', facebook: '', twitter: '', whatsapp: '' },
  acceptVolunteers: false,
  entryCategories: [{ name: '', price: '', description: '' }],
};

export default function CreateEventPage() {
  const { user, loading: authLoading, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [customDistance, setCustomDistance] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  /* City dropdown state */
  const [cityQuery, setCityQuery] = useState('');
  const [cityOpen, setCityOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  /* State dropdown state */
  const [stateOpen, setStateOpen] = useState(false);
  const stateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  /* Close dropdowns on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
        setStateOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const updateSocialLink = (key: keyof FormData['socialLinks'], value: string) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  const updateEntryCategory = (
    index: number,
    field: keyof FormData['entryCategories'][number],
    value: string,
  ) => {
    setForm((prev) => {
      const updated = [...prev.entryCategories];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, entryCategories: updated };
    });
  };

  const addEntryCategory = () => {
    setForm((prev) => ({
      ...prev,
      entryCategories: [...prev.entryCategories, { name: '', price: '', description: '' }],
    }));
  };

  const removeEntryCategory = (index: number) => {
    if (form.entryCategories.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      entryCategories: prev.entryCategories.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (key: 'distanceTags' | 'categoryTags', tag: string) => {
    setForm((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag],
      };
    });
  };

  const addCustomTag = (key: 'distanceTags' | 'categoryTags', value: string) => {
    const trimmed = value.trim();
    if (!trimmed || form[key].includes(trimmed)) return;
    setForm((prev) => ({
      ...prev,
      [key]: [...prev[key], trimmed],
    }));
    if (key === 'distanceTags') setCustomDistance('');
    else setCustomCategory('');
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (form.distanceTags.length === 0) {
      e.distanceTags = 'Add at least one distance';
    }
    if (form.websiteUrl.trim() && !isValidUrl(form.websiteUrl.trim())) {
      e.websiteUrl = 'Enter a valid URL (must start with http:// or https://)';
    }
    /* Validate social link URLs */
    const socialUrlKeys = ['instagram', 'facebook', 'twitter'] as const;
    for (const key of socialUrlKeys) {
      const val = form.socialLinks[key].trim();
      if (val && !/^https?:\/\//.test(val)) {
        e.socialLinks = `${key.charAt(0).toUpperCase() + key.slice(1)} URL must start with http:// or https://`;
        break;
      }
    }
    /* Validate WhatsApp number */
    if (form.socialLinks.whatsapp.trim() && !/^[\d+\s]+$/.test(form.socialLinks.whatsapp.trim())) {
      e.socialLinks = e.socialLinks || 'WhatsApp number can only contain digits, +, and spaces';
    }
    /* Validate date is in the future */
    if (form.date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const eventDate = new Date(form.date + 'T00:00:00');
      if (eventDate < today) {
        e.date = 'Event date must be in the future';
      }
    }
    /* Validate entry categories */
    const hasValidCategory = form.entryCategories.some(
      (c) => c.name.trim() && c.price.trim() && !isNaN(Number(c.price)) && Number(c.price) >= 0,
    );
    if (!hasValidCategory) {
      e.entryCategories = 'Add at least one category with a name and valid price';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate() || !user) return;

    setSubmitting(true);

    const validCategories = form.entryCategories.filter(
      (c) => c.name.trim() && c.price.trim(),
    );
    const minPrice = Math.min(
      ...validCategories.map((c) => Number(c.price) || 0),
    );

    const { error } = await supabase
      .from('events')
      .insert({
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        sport: form.sport,
        distance_tags: form.distanceTags,
        category_tags: form.categoryTags,
        price: Math.round(minPrice),
        city: form.city.trim(),
        state: form.state.trim(),
        area: form.area.trim(),
        location_address: form.locationAddress.trim(),
        location_lat: form.locationLat,
        location_lng: form.locationLng,
        image_url: form.imageUrl.trim(),
        website_url: form.websiteUrl.trim(),
        registration_url: form.websiteUrl.trim(),
        contact_info: form.contactInfo.trim(),
        social_links: form.socialLinks,
        accept_volunteers: form.acceptVolunteers,
        entry_categories: form.entryCategories,
        organizer_id: user.id,
        status: 'pending',
      })
      .select('id')
      .maybeSingle();

    setSubmitting(false);

    if (error) {
      toast(error.message);
      return;
    }

    toast('Event submitted for review. Track its status in your profile.');
    navigate('/profile');
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="min-h-screen bg-surface pt-24 pb-24 flex items-center justify-center">
        <div className="max-w-md text-center px-6">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto mb-6">
            <Plus className="w-7 h-7 text-white/20" />
          </div>
          <h1 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-3">
            Organizer Access Required
          </h1>
          <p className="font-inter text-sm text-white/40 mb-8 leading-relaxed">
            Only approved organizers can create events on SPORTSARCH. If you'd like to list your event, contact our team to get organizer access.
          </p>
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-syne font-bold text-sm uppercase rounded-full hover:brightness-110 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const sportDistances = COMMON_DISTANCES[form.sport] || COMMON_DISTANCES.running;
  const sportCategories = COMMON_CATEGORIES[form.sport] || COMMON_CATEGORIES.running;
  const today = new Date().toISOString().split('T')[0];

  const filteredCities = cityQuery.trim()
    ? INDIAN_CITIES.filter((c) =>
        c.toLowerCase().includes(cityQuery.toLowerCase()),
      )
    : INDIAN_CITIES;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-24">
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Back navigation */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-inter text-sm text-white/30 hover:text-white/60 transition-colors duration-300 mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          {/* Editorial page header */}
          <div className="mb-14">
            <p className="font-inter text-[10px] font-bold uppercase tracking-[0.25em] text-accent mb-4">
              New Listing
            </p>
            <h1 className="font-playfair text-4xl md:text-5xl text-[#F5F5F0] tracking-tight leading-[1.1]">
              Create Your Event
            </h1>
            <div className="w-12 h-[1px] bg-gradient-to-r from-accent/60 to-transparent mt-6 mb-4" />
            <p className="font-inter text-sm text-white/35 max-w-lg leading-relaxed">
              Fill in the details below. Your event will be reviewed by our team before it goes live on the platform.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">
                  Basic Info
                </h2>
              </div>

              <FieldGroup label="Event Title" error={errors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Mumbai Half Marathon 2026"
                  className="form-input"
                  maxLength={120}
                />
                <span className="block text-right text-[10px] font-inter text-white/20 mt-1.5">
                  {form.title.length}/120
                </span>
              </FieldGroup>

              <FieldGroup label="Description" error={errors.description}>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe your event, the course, what makes it special..."
                  rows={4}
                  className="form-input resize-none"
                  maxLength={1000}
                />
                <span className="block text-right text-[10px] font-inter text-white/20 mt-1.5">
                  {form.description.length}/1000
                </span>
              </FieldGroup>

              <FieldGroup label="Event Date" error={errors.date}>
                <input
                  type="date"
                  value={form.date}
                  min={today}
                  onChange={(e) => updateField('date', e.target.value)}
                  className="form-input"
                />
              </FieldGroup>

              <FieldGroup label="Sport">
                <div className="flex flex-wrap gap-2.5">
                  {SPORT_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        updateField('sport', s);
                        updateField('distanceTags', []);
                        updateField('categoryTags', []);
                      }}
                      className={`px-5 py-2.5 rounded-full font-inter text-sm font-medium capitalize transition-all duration-300 ${
                        form.sport === s
                          ? 'bg-accent text-black shadow-[0_0_20px_rgba(255,59,16,0.15)]'
                          : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/20 hover:text-white/70'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </FieldGroup>

              <div className="flex items-center justify-between py-3 px-1">
                <div>
                  <span className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-white/35">
                    Accept Volunteers
                  </span>
                  <span className="block text-[11px] font-inter text-white/20 mt-0.5">
                    Allow runners to sign up as event volunteers
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('acceptVolunteers', !form.acceptVolunteers)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                    form.acceptVolunteers ? 'bg-accent' : 'bg-white/[0.08]'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                      form.acceptVolunteers ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </section>

            {/* Location */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">
                  Location
                </h2>
              </div>

              {/* Google Location Search */}
              <FieldGroup label="Venue Location">
                <LocationPicker
                  address={form.locationAddress}
                  lat={form.locationLat}
                  lng={form.locationLng}
                  onLocationChange={(addr, lat, lng) => {
                    setForm((prev) => ({
                      ...prev,
                      locationAddress: addr,
                      locationLat: lat,
                      locationLng: lng,
                    }));
                  }}
                />
              </FieldGroup>

              <FieldGroup label="Area / Locality">
                <input
                  type="text"
                  value={form.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  placeholder="e.g. Marine Drive, Cubbon Park"
                  className="form-input"
                  maxLength={100}
                />
              </FieldGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="City" error={errors.city}>
                  <div ref={cityRef} className="relative">
                    <div className="relative">
                      <input
                        type="text"
                        value={cityOpen ? cityQuery : form.city}
                        onChange={(e) => {
                          setCityQuery(e.target.value);
                          updateField('city', e.target.value);
                          if (!cityOpen) setCityOpen(true);
                        }}
                        onFocus={() => {
                          setCityOpen(true);
                          setCityQuery(form.city);
                        }}
                        placeholder="Search or type a city..."
                        className="form-input pr-10"
                      />
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
                    </div>
                    {cityOpen && (
                      <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1a1a1a] shadow-2xl">
                        {filteredCities.length > 0 ? (
                          filteredCities.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => {
                                updateField('city', c);
                                setCityQuery(c);
                                setCityOpen(false);
                              }}
                              className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors duration-150 ${
                                form.city === c
                                  ? 'bg-accent/10 text-accent'
                                  : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                              }`}
                            >
                              {c}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-xs font-inter text-white/30">
                            No match — your typed value will be used
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </FieldGroup>

                <FieldGroup label="State">
                  <div ref={stateRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setStateOpen((prev) => !prev)}
                      className="form-input w-full text-left flex items-center justify-between"
                    >
                      <span className={form.state ? 'text-white/80' : 'text-white/30'}>
                        {form.state || 'Select state...'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-white/25" />
                    </button>
                    {stateOpen && (
                      <div className="absolute z-50 mt-1 w-full max-h-52 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#1a1a1a] shadow-2xl">
                        {INDIAN_STATES.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              updateField('state', s);
                              setStateOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm font-inter transition-colors duration-150 ${
                              form.state === s
                                ? 'bg-accent/10 text-accent'
                                : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </FieldGroup>
              </div>
            </section>

            {/* Distances */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">Distances</h2>
                {form.distanceTags.length > 0 && (
                  <span className="text-[10px] font-inter font-semibold text-accent/70 bg-accent/10 px-2.5 py-1 rounded-full">
                    {form.distanceTags.length} selected
                  </span>
                )}
              </div>
              {errors.distanceTags && (
                <p className="text-red-400 text-xs font-inter">{errors.distanceTags}</p>
              )}
              <div className="flex flex-wrap gap-2.5">
                {sportDistances.map((d) => {
                  const active = form.distanceTags.includes(d);
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleTag('distanceTags', d)}
                      className={`px-4 py-2.5 rounded-full text-sm font-inter font-medium transition-all duration-300 ${
                        active
                          ? 'bg-accent/15 text-accent border border-accent/30 shadow-[0_0_12px_rgba(255,59,16,0.08)]'
                          : 'bg-white/[0.04] text-white/45 border border-white/[0.08] hover:border-white/20 hover:text-white/65'
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={customDistance}
                  onChange={(e) => setCustomDistance(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag('distanceTags', customDistance);
                    }
                  }}
                  placeholder="Custom distance..."
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => addCustomTag('distanceTags', customDistance)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.distanceTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.distanceTags.map((tag) => (
                    <span
                      key={tag}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/15 text-accent text-xs font-inter font-semibold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag('distanceTags', tag)}
                        className="opacity-50 hover:opacity-100 transition-opacity duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Categories */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">Categories</h2>
                {form.categoryTags.length > 0 && (
                  <span className="text-[10px] font-inter font-semibold text-white/50 bg-white/[0.06] px-2.5 py-1 rounded-full">
                    {form.categoryTags.length} selected
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2.5">
                {sportCategories.map((c) => {
                  const active = form.categoryTags.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleTag('categoryTags', c)}
                      className={`px-4 py-2.5 rounded-full text-sm font-inter font-medium transition-all duration-300 ${
                        active
                          ? 'bg-white/15 text-white border border-white/25'
                          : 'bg-white/[0.04] text-white/45 border border-white/[0.08] hover:border-white/20 hover:text-white/65'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2.5">
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomTag('categoryTags', customCategory);
                    }
                  }}
                  placeholder="Custom category..."
                  className="form-input flex-1"
                />
                <button
                  type="button"
                  onClick={() => addCustomTag('categoryTags', customCategory)}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/15 transition-all duration-300"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {form.categoryTags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {form.categoryTags.map((tag) => (
                    <span
                      key={tag}
                      className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.08] border border-white/[0.1] text-white/65 text-xs font-inter font-semibold"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag('categoryTags', tag)}
                        className="opacity-50 hover:opacity-100 hover:text-accent transition-all duration-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* Entry Categories */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">Entry Categories</h2>
                <button
                  type="button"
                  onClick={addEntryCategory}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-inter font-semibold hover:bg-accent/15 transition-all duration-300"
                >
                  <Plus className="w-3 h-3" />
                  Add Category
                </button>
              </div>
              {errors.entryCategories && (
                <p className="text-red-400 text-xs font-inter">{errors.entryCategories}</p>
              )}
              <p className="text-[11px] font-inter text-white/25 leading-relaxed">
                Define different entry slots with separate pricing. The lowest price will be shown as the listing price.
              </p>
              <div className="space-y-4">
                {form.entryCategories.map((cat, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-[1fr_120px_1fr_40px] gap-3 items-start rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                  >
                    <div>
                      <label className="block text-[9px] font-inter font-bold uppercase tracking-[0.12em] text-white/30 mb-1.5">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={cat.name}
                        onChange={(e) => updateEntryCategory(idx, 'name', e.target.value)}
                        placeholder="e.g. 5K Fun Run"
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-inter font-bold uppercase tracking-[0.12em] text-white/30 mb-1.5">
                        Price (Rs.)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-inter font-medium text-white/30">Rs.</span>
                        <input
                          type="number"
                          value={cat.price}
                          onChange={(e) => updateEntryCategory(idx, 'price', e.target.value)}
                          placeholder="500"
                          min="0"
                          className="form-input pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[9px] font-inter font-bold uppercase tracking-[0.12em] text-white/30 mb-1.5">
                        Description (optional)
                      </label>
                      <input
                        type="text"
                        value={cat.description}
                        onChange={(e) => updateEntryCategory(idx, 'description', e.target.value)}
                        placeholder="Open to all ages"
                        className="form-input"
                      />
                    </div>
                    <div className="flex items-end pb-0.5">
                      <button
                        type="button"
                        onClick={() => removeEntryCategory(idx)}
                        disabled={form.entryCategories.length <= 1}
                        className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/25 hover:text-red-400 hover:border-red-400/30 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200 mt-5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Registration & Contact */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
              <div className="pb-4 border-b border-white/[0.06]">
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">Registration & Contact</h2>
                <p className="text-[11px] font-inter text-white/25 mt-2 leading-relaxed">
                  Provide either a registration link OR contact info for manual registration.
                </p>
              </div>

              <FieldGroup label="Registration Link" error={errors.websiteUrl}>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => updateField('websiteUrl', e.target.value)}
                  placeholder="https://townscript.com/your-event"
                  className="form-input"
                />
              </FieldGroup>

              <FieldGroup label="Contact Info">
                <textarea
                  value={form.contactInfo}
                  onChange={(e) => updateField('contactInfo', e.target.value)}
                  placeholder="Email, phone, or other contact details for registration..."
                  rows={2}
                  className="form-input resize-none"
                  maxLength={300}
                />
              </FieldGroup>
            </section>

            {/* Social Media */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
              <div className="pb-4 border-b border-white/[0.06]">
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">Social Media</h2>
              </div>
              {errors.socialLinks && (
                <p className="text-red-400 text-xs font-inter">{errors.socialLinks}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FieldGroup label="Instagram URL">
                  <input
                    type="url"
                    value={form.socialLinks.instagram}
                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                    placeholder="https://instagram.com/yourevent"
                    className="form-input"
                  />
                </FieldGroup>
                <FieldGroup label="Facebook URL">
                  <input
                    type="url"
                    value={form.socialLinks.facebook}
                    onChange={(e) => updateSocialLink('facebook', e.target.value)}
                    placeholder="https://facebook.com/yourevent"
                    className="form-input"
                  />
                </FieldGroup>
                <FieldGroup label="Twitter / X URL">
                  <input
                    type="url"
                    value={form.socialLinks.twitter}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    placeholder="https://x.com/yourevent"
                    className="form-input"
                  />
                </FieldGroup>
                <FieldGroup label="WhatsApp Number">
                  <input
                    type="text"
                    value={form.socialLinks.whatsapp}
                    onChange={(e) => updateSocialLink('whatsapp', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="form-input"
                  />
                </FieldGroup>
              </div>
            </section>

            {/* Cover Image */}
            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
              <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-accent" />
                </div>
                <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">
                  Cover Image
                </h2>
              </div>

              <ImagePicker
                value={form.imageUrl}
                onChange={(url) => updateField('imageUrl', url)}
              />
              <p className="text-[11px] font-inter text-white/25 mt-3 leading-relaxed">
                Recommended: 1920x1080px (16:9 ratio), JPEG or PNG, max 5MB.
                <br />
                The image will be used as the event cover on listing and detail pages.
              </p>
            </section>

            {/* Submit / Cancel */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2.5 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide py-4 px-8 rounded-full transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_30px_rgba(255,59,16,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit for Review
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-8 py-4 rounded-full border border-white/[0.08] text-white/40 font-syne font-bold text-sm uppercase tracking-wide hover:border-white/20 hover:text-white/65 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] font-inter font-bold uppercase tracking-[0.15em] text-white/35 mb-2.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-2 text-xs font-inter text-red-400/90">{error}</p>
      )}
    </div>
  );
}
