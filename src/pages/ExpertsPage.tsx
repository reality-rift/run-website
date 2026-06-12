import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Dumbbell,
  Lightbulb,
  Plus,
  X,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { supabase, type ExpertArticleRow } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { resolveImageUrl } from '../lib/imageUrl';

type Category = 'all' | 'plans' | 'workouts' | 'tips';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'plans', label: 'Running Plans' },
  { key: 'workouts', label: 'Workouts' },
  { key: 'tips', label: 'Tips' },
];

const CATEGORY_META: Record<
  string,
  { label: string; icon: typeof BookOpen; color: string }
> = {
  plans: { label: 'Running Plan', icon: BookOpen, color: '#FF3B10' },
  workouts: { label: 'Workout', icon: Dumbbell, color: '#10B981' },
  tips: { label: 'Tips', icon: Lightbulb, color: '#F59E0B' },
};

function excerpt(content: string, len = 120) {
  const clean = content.replace(/\s+/g, ' ').trim();
  return clean.length > len ? clean.slice(0, len).trimEnd() + '…' : clean;
}

export default function ExpertsPage() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [articles, setArticles] = useState<ExpertArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category>('all');

  // Admin create form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [formCategory, setFormCategory] = useState<'plans' | 'workouts' | 'tips'>('tips');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const isAdmin = !!user && role === 'admin';

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('expert_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        if (data) setArticles(data as ExpertArticleRow[]);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered =
    category === 'all' ? articles : articles.filter((a) => a.category === category);

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    const { data, error } = await supabase
      .from('expert_articles')
      .insert({
        title: title.trim(),
        content: content.trim(),
        category: formCategory,
        image_url: imageUrl.trim(),
        author_id: user?.id ?? null,
      })
      .select()
      .maybeSingle();
    setSaving(false);
    if (error || !data) {
      toast('Failed to publish article');
      return;
    }
    setArticles((prev) => [data as ExpertArticleRow, ...prev]);
    setTitle('');
    setContent('');
    setImageUrl('');
    setShowForm(false);
    toast('Article published! 🎉');
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-24">
      <div className="px-6 md:px-12 max-w-content mx-auto">
        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-[2px] bg-accent" />
            <span className="font-inter text-[11px] font-bold uppercase tracking-[0.3em] text-accent">
              Train Smarter
            </span>
          </div>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-syne font-bold text-4xl md:text-6xl text-[#F5F5F0] tracking-tight">
                EXPERTS <span className="text-accent">CORNER</span>
              </h1>
              <p className="font-inter text-white/40 text-sm md:text-base mt-4 max-w-xl leading-relaxed">
                Training plans, workouts and pro tips from running experts — everything
                you need to level up your race day.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setShowForm((s) => !s)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-black font-syne font-bold text-xs uppercase tracking-wider rounded-full hover:brightness-110 transition-all duration-300"
              >
                {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? 'Close' : 'New Article'}
              </button>
            )}
          </div>
        </div>

        {/* ── Admin create form ──────────────────────────────── */}
        {isAdmin && showForm && (
          <div className="mb-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 md:p-8 space-y-5">
            <h2 className="font-syne font-bold text-lg text-[#F5F5F0]">New Expert Article</h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title..."
              maxLength={150}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-inter text-white/90 outline-none focus:border-accent/40 transition-colors"
            />
            <div className="flex gap-2 flex-wrap">
              {(['plans', 'workouts', 'tips'] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormCategory(c)}
                  className={`px-4 py-2 rounded-full text-xs font-inter font-bold uppercase tracking-wider transition-all duration-300 ${
                    formCategory === c
                      ? 'bg-accent text-black'
                      : 'bg-white/[0.04] text-white/40 border border-white/[0.08] hover:text-white/70'
                  }`}
                >
                  {CATEGORY_META[c].label}
                </button>
              ))}
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Cover image URL (optional)..."
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-inter text-white/90 outline-none focus:border-accent/40 transition-colors"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article... (paragraph breaks are preserved)"
              rows={10}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm font-inter text-white/90 outline-none focus:border-accent/40 transition-colors resize-y"
            />
            <div className="flex justify-end">
              <button
                onClick={handleCreate}
                disabled={!title.trim() || !content.trim() || saving}
                className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-black font-syne font-bold text-xs uppercase tracking-wider rounded-full hover:brightness-110 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Publish
              </button>
            </div>
          </div>
        )}

        {/* ── Category tabs ──────────────────────────────────── */}
        <div className="flex gap-2 flex-wrap mb-10">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-5 py-2.5 rounded-full text-xs font-inter font-bold uppercase tracking-wider transition-all duration-300 ${
                category === c.key
                  ? 'bg-accent text-black'
                  : 'bg-white/[0.03] text-white/40 border border-white/[0.08] hover:text-white/70 hover:border-white/20'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* ── Articles grid ──────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06]">
                <div className="aspect-video bg-white/[0.04] animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-20 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-5 w-3/4 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-3 w-full bg-white/[0.03] rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="w-7 h-7 text-white/10" />
            </div>
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]/80 mb-2">
              No articles yet
            </h3>
            <p className="font-inter text-white/30 text-sm">
              Expert content is coming soon — check back here for training plans,
              workouts and tips.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((a) => {
              const meta = CATEGORY_META[a.category] ?? CATEGORY_META.tips;
              const Icon = meta.icon;
              return (
                <Link
                  key={a.id}
                  to={`/experts/${a.id}`}
                  className="group rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] hover:border-accent/25 hover:bg-white/[0.03] transition-all duration-500"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {a.image_url ? (
                      <img
                        src={resolveImageUrl(a.image_url)}
                        alt={a.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${meta.color}22 0%, var(--x1a1a1a) 70%)`,
                        }}
                      >
                        <Icon className="w-10 h-10" style={{ color: `${meta.color}66` }} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-inter font-bold uppercase tracking-wider backdrop-blur-xl border border-white/[0.08]"
                        style={{ background: 'rgba(0,0,0,0.6)', color: meta.color }}
                      >
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-syne font-bold text-lg text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 line-clamp-2 leading-snug">
                      {a.title}
                    </h3>
                    <p className="font-inter text-sm text-white/35 mt-2 leading-relaxed line-clamp-3">
                      {excerpt(a.content)}
                    </p>
                    <span className="block font-inter text-[11px] text-white/25 mt-4">
                      {new Date(a.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
