import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Dumbbell,
  Lightbulb,
  Trash2,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { supabase, type ExpertArticleRow } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import { resolveImageUrl } from '../lib/imageUrl';

const CATEGORY_META: Record<
  string,
  { label: string; icon: typeof BookOpen; color: string }
> = {
  plans: { label: 'Running Plan', icon: BookOpen, color: '#FF3B10' },
  workouts: { label: 'Workout', icon: Dumbbell, color: '#10B981' },
  tips: { label: 'Tips', icon: Lightbulb, color: '#F59E0B' },
};

export default function ExpertArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<ExpertArticleRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const isAdmin = !!user && role === 'admin';

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from('expert_articles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setArticle((data as ExpertArticleRow) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!isAdmin || !article || deleting) return;
    if (!window.confirm('Delete this article? This cannot be undone.')) return;
    setDeleting(true);
    const { error } = await supabase
      .from('expert_articles')
      .delete()
      .eq('id', article.id);
    setDeleting(false);
    if (error) {
      toast('Failed to delete article');
      return;
    }
    toast('Article deleted');
    navigate('/experts');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface pt-24">
        <div className="px-6 md:px-12 max-w-3xl mx-auto">
          <div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse mb-10" />
          <div className="aspect-video bg-white/[0.04] rounded-2xl animate-pulse mb-8" />
          <div className="h-8 w-3/4 bg-white/[0.06] rounded animate-pulse mb-6" />
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-3 w-full bg-white/[0.03] rounded animate-pulse mb-3" />
          ))}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-8">
          <GraduationCap className="w-8 h-8 text-white/15" />
        </div>
        <h2 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-3">Article not found</h2>
        <p className="font-inter text-white/30 text-sm mb-8">
          This article may have been removed.
        </p>
        <Link
          to="/experts"
          className="px-6 py-3 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-xl hover:brightness-110 transition-all"
        >
          Back to Experts Corner
        </Link>
      </div>
    );
  }

  const meta = CATEGORY_META[article.category] ?? CATEGORY_META.tips;
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-24">
      <div className="px-6 md:px-12 max-w-3xl mx-auto">
        {/* Back + admin actions */}
        <div className="flex items-center justify-between mb-10">
          <Link
            to="/experts"
            className="inline-flex items-center gap-2 font-inter text-sm text-white/40 hover:text-accent transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Experts Corner
          </Link>
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 font-inter text-xs transition-all duration-300"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete
            </button>
          )}
        </div>

        {/* Hero image */}
        {article.image_url && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 border border-white/[0.06]">
            <img
              src={resolveImageUrl(article.image_url)}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Category + date */}
        <div className="flex items-center gap-4 mb-5">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-inter font-bold uppercase tracking-wider border border-white/[0.08]"
            style={{ background: `${meta.color}15`, color: meta.color }}
          >
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
          <span className="font-inter text-xs text-white/30">
            {new Date(article.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-syne font-bold text-3xl md:text-4xl text-[#F5F5F0] tracking-tight leading-tight mb-8">
          {article.title}
        </h1>

        {/* Content */}
        <div className="font-inter text-[15px] md:text-base text-white/60 leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>
      </div>
    </div>
  );
}
