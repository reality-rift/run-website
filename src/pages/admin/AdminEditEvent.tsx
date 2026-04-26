import { useState } from 'react';
import {
  Loader2,
  Plus,
  X,
  ImageIcon,
  CalendarDays,
  MapPin,
  ArrowLeft,
  Globe,
} from 'lucide-react';
import { supabase, type EventRow } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import ImagePicker from '../../components/ImagePicker';

const SPORT_OPTIONS = ['running', 'cycling', 'trail'] as const;

const COMMON_DISTANCES: Record<string, string[]> = {
  running: ['5K', '10K', 'Half Marathon', 'Full Marathon', '12K'],
  cycling: ['50 km', '100 km', '60 mi', '100 mi', '200 km'],
  trail: ['10K', '25K', '50K', '50 mi', '100 mi'],
};

const COMMON_CATEGORIES: Record<string, string[]> = {
  running: ['Road Run', 'Fun Run', 'Night Run', 'Altitude'],
  cycling: ['Cycling', 'Gran Fondo', 'Multi-Stage', 'Time Trial'],
  trail: ['Trail Run', 'Ultra', 'Elevation', 'Mountain'],
};

interface FormData {
  title: string;
  description: string;
  date: string;
  sport: string;
  distanceTags: string[];
  categoryTags: string[];
  price: string;
  city: string;
  state: string;
  imageUrl: string;
  websiteUrl: string;
  contactInfo: string;
}

interface AdminEditEventProps {
  event: EventRow;
  onSaved: () => void;
  onCancel: () => void;
}

export default function AdminEditEvent({ event, onSaved, onCancel }: AdminEditEventProps) {
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>({
    title: event.title,
    description: event.description,
    date: event.date,
    sport: event.sport,
    distanceTags: [...event.distance_tags],
    categoryTags: [...event.category_tags],
    price: String(event.price),
    city: event.city,
    state: event.state,
    imageUrl: event.image_url,
    websiteUrl: event.website_url || '',
    contactInfo: event.contact_info || '',
  });
  const [customDistance, setCustomDistance] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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

  const toggleTag = (key: 'distanceTags' | 'categoryTags', tag: string) => {
    setForm((prev) => {
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
      };
    });
  };

  const addCustomTag = (key: 'distanceTags' | 'categoryTags', value: string) => {
    const trimmed = value.trim();
    if (!trimmed || form[key].includes(trimmed)) return;
    setForm((prev) => ({ ...prev, [key]: [...prev[key], trimmed] }));
    if (key === 'distanceTags') setCustomDistance('');
    else setCustomCategory('');
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.date) e.date = 'Date is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      e.price = 'Enter a valid price';
    }
    if (form.distanceTags.length === 0) {
      e.distanceTags = 'Add at least one distance';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const { error } = await supabase
      .from('events')
      .update({
        title: form.title.trim(),
        description: form.description.trim(),
        date: form.date,
        sport: form.sport,
        distance_tags: form.distanceTags,
        category_tags: form.categoryTags,
        price: Math.round(Number(form.price)),
        city: form.city.trim(),
        state: form.state.trim(),
        image_url: form.imageUrl.trim(),
        website_url: form.websiteUrl.trim(),
        contact_info: form.contactInfo.trim(),
      })
      .eq('id', event.id);

    setSubmitting(false);

    if (error) {
      toast(error.message);
      return;
    }

    toast('Event updated');
    onSaved();
  };

  const sportDistances = COMMON_DISTANCES[form.sport] || COMMON_DISTANCES.running;
  const sportCategories = COMMON_CATEGORIES[form.sport] || COMMON_CATEGORIES.running;

  return (
    <div className="max-w-3xl">
      {/* Back navigation */}
      <button
        onClick={onCancel}
        className="flex items-center gap-2 text-white/30 hover:text-white/60 font-inter text-sm mb-8 transition-colors duration-300"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Event Management
      </button>

      {/* Header with status badge */}
      <div className="flex items-center gap-4 mb-10">
        <h2 className="font-syne font-bold text-2xl text-[#F5F5F0]">Edit Event</h2>
        <span className={`px-3 py-1 rounded-full text-[10px] font-inter font-semibold uppercase tracking-wider border ${
          event.status === 'approved'
            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
            : event.status === 'pending'
            ? 'bg-amber-400/10 text-amber-400 border-amber-400/20'
            : 'bg-red-400/10 text-red-400 border-red-400/20'
        }`}>
          {event.status}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">
              Basic Info
            </h3>
          </div>

          <FieldGroup label="Event Title" error={errors.title}>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="form-input"
              maxLength={120}
            />
          </FieldGroup>

          <FieldGroup label="Description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="form-input resize-none"
              maxLength={1000}
            />
            <span className="block text-right text-[10px] font-inter text-white/20 mt-1.5">
              {form.description.length}/1000
            </span>
          </FieldGroup>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup label="Event Date" error={errors.date}>
              <input
                type="date"
                value={form.date}
                onChange={(e) => updateField('date', e.target.value)}
                className="form-input"
              />
            </FieldGroup>

            <FieldGroup label="Entry Price (₹)" error={errors.price}>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-inter font-medium text-white/30">₹</span>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateField('price', e.target.value)}
                  min="0"
                  className="form-input pl-10"
                />
              </div>
            </FieldGroup>
          </div>

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
        </section>

        {/* Location */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">
              Location
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FieldGroup label="City" error={errors.city}>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="form-input"
              />
            </FieldGroup>
            <FieldGroup label="State / Country Code">
              <input
                type="text"
                value={form.state}
                onChange={(e) => updateField('state', e.target.value)}
                className="form-input"
                maxLength={10}
              />
            </FieldGroup>
          </div>
        </section>

        {/* Distances */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">Distances</h3>
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
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">Categories</h3>
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

        {/* Contact & Website */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">
              Contact & Website
            </h3>
          </div>

          <FieldGroup label="Official Website URL">
            <input
              type="url"
              value={form.websiteUrl}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="form-input"
            />
          </FieldGroup>

          <FieldGroup label="Contact Information">
            <textarea
              value={form.contactInfo}
              onChange={(e) => updateField('contactInfo', e.target.value)}
              placeholder="Email, phone, or other contact details..."
              rows={2}
              className="form-input resize-none"
              maxLength={500}
            />
          </FieldGroup>
        </section>

        {/* Cover Image */}
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-8 md:p-10 space-y-7">
          <div className="flex items-center gap-3 pb-4 border-b border-white/[0.06]">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-accent" />
            </div>
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">
              Cover Image
            </h3>
          </div>
          <ImagePicker
            value={form.imageUrl}
            onChange={(url) => updateField('imageUrl', url)}
          />
        </section>

        {/* Save / Cancel */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2.5 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide py-4 px-8 rounded-full transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_30px_rgba(255,59,16,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-4 rounded-full border border-white/[0.08] text-white/40 font-syne font-bold text-sm uppercase tracking-wide hover:border-white/20 hover:text-white/65 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
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
