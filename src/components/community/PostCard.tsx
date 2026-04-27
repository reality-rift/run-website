import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Flag, MoreHorizontal, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import CommentSection from './CommentSection';
import type { PostWithAuthor } from '../../hooks/usePosts';

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const REACTIONS = [
  { emoji: '\u2764\uFE0F', label: 'Love' },
  { emoji: '\uD83D\uDD25', label: 'Fire' },
  { emoji: '\uD83D\uDCAA', label: 'Strong' },
  { emoji: '\uD83C\uDFC6', label: 'Champion' },
  { emoji: '\uD83D\uDC4F', label: 'Clap' },
] as const;

interface PostCardProps {
  post: PostWithAuthor;
  liked: boolean;
  onToggleLike: (postId: string) => Promise<boolean>;
  onDelete: (postId: string) => Promise<boolean>;
  onLikeCountChange: (postId: string, delta: number) => void;
}

function PostCard({
  post,
  liked,
  onToggleLike,
  onDelete,
  onLikeCountChange,
}: PostCardProps) {
  const { user, role } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [activeReaction, setActiveReaction] = useState<number | null>(liked ? 0 : null);
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null);
  const [showBurst, setShowBurst] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Sync activeReaction when liked prop changes externally
  useEffect(() => {
    if (!liked) setActiveReaction(null);
    else if (activeReaction === null) setActiveReaction(0);
  }, [liked]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [menuOpen]);

  const canDelete = user && (user.id === post.author_id || role === 'admin');

  const handleReaction = async (index: number) => {
    if (!user) return;

    // Trigger bounce animation
    setAnimatingIdx(index);
    setTimeout(() => setAnimatingIdx(null), 500);

    if (liked) {
      if (activeReaction === index) {
        // Unlike
        setActiveReaction(null);
        onLikeCountChange(post.id, -1);
        await onToggleLike(post.id);
      } else {
        // Switch reaction (visual only, already liked)
        setActiveReaction(index);
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 600);
      }
    } else {
      // Like with chosen reaction
      setActiveReaction(index);
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 600);
      onLikeCountChange(post.id, 1);
      await onToggleLike(post.id);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || deleting) return;
    setDeleting(true);
    const success = await onDelete(post.id);
    if (!success) setDeleting(false);
  };

  const handleReport = async () => {
    if (!user) return;
    try {

      await supabase.from('post_reports').insert({
        post_id: post.id,
        reporter_id: user.id,
        reason: 'Reported by user',
      });
      setReported(true);
    } catch {
      // Silently handle — table might not exist yet
      setReported(true);
    }
  };

  const displayName = post.author_name.trim() || 'Anonymous';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300"
      style={{ background: '#222', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="p-6">
        {/* Author row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to={`/user/${post.author_id}`} className="shrink-0">
              {post.author_avatar_url ? (
                <img
                  src={post.author_avatar_url}
                  alt={displayName || 'User avatar'}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-white/[0.06] hover:ring-accent/30 transition-all duration-300"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-syne font-bold text-sm ring-1 ring-white/[0.06] hover:ring-accent/30 transition-all duration-300"
                  style={{ background: '#2a2a2a', color: '#FF3B10' }}
                >
                  {initial}
                </div>
              )}
            </Link>
            <div>
              <Link
                to={`/user/${post.author_id}`}
                className="font-syne font-bold text-sm block hover:text-accent transition-colors duration-300"
                style={{ color: '#F5F5F0' }}
              >
                {displayName}
              </Link>
              <span className="font-inter text-[11px]" style={{ color: '#555' }}>
                {relativeTime(post.created_at)}
              </span>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/[0.06]"
              style={{ color: '#555' }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-xl shadow-black/30 py-1 z-20">
                {user && !reported && (
                  <button
                    onClick={() => { handleReport(); setMenuOpen(false); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-inter text-white/50 hover:text-amber-400 hover:bg-white/[0.03] transition-colors"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Report Post
                  </button>
                )}
                {reported && (
                  <div className="px-4 py-2.5 text-sm font-inter text-amber-400/70">
                    &#10003; Reported
                  </div>
                )}
                {canDelete && (
                  <button
                    onClick={() => { handleDelete(); setMenuOpen(false); }}
                    disabled={deleting}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-inter text-white/50 hover:text-red-400 hover:bg-white/[0.03] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <p
          className="font-inter text-[15px] leading-relaxed whitespace-pre-wrap mb-4"
          style={{ color: '#bbb' }}
        >
          {post.content}
        </p>

        {/* Image */}
        {post.image_url && (
          <div className="mb-5 rounded-xl overflow-hidden">
            <img
              src={post.image_url}
              alt="Post image"
              className="w-full max-h-[400px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* ── Reactions ── */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
          {/* Reaction buttons */}
          <div className="flex items-center gap-0.5 relative">
            {REACTIONS.map((r, i) => {
              const isActive = liked && activeReaction === i;
              const isBouncing = animatingIdx === i;

              return (
                <button
                  key={r.label}
                  onClick={() => handleReaction(i)}
                  title={r.label}
                  aria-label={`React with ${r.label}`}
                  className="relative w-9 h-9 flex items-center justify-center rounded-full transition-colors duration-300"
                  style={{
                    background: isActive ? 'rgba(255,59,16,0.12)' : 'transparent',
                  }}
                >
                  <span
                    className="text-lg select-none transition-all duration-300 ease-out"
                    style={{
                      filter: isActive ? 'none' : 'saturate(0) brightness(0.5)',
                      opacity: isActive ? 1 : 0.35,
                      transform: isBouncing
                        ? 'scale(1.4) translateY(-4px)'
                        : isActive
                          ? 'scale(1.1)'
                          : 'scale(1)',
                      transition: isBouncing
                        ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        : 'all 0.3s ease',
                    }}
                  >
                    {r.emoji}
                  </span>

                  {/* Burst particles on active click */}
                  {isActive && showBurst && (
                    <span className="absolute inset-0 pointer-events-none">
                      {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <span
                          key={deg}
                          className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full"
                          style={{
                            background: '#FF3B10',
                            transform: `rotate(${deg}deg) translateY(-14px)`,
                            opacity: 0,
                            animation: 'reactionBurst 0.5s ease-out forwards',
                          }}
                        />
                      ))}
                    </span>
                  )}

                  {/* Hover ring */}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white/[0.04]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 hover:bg-white/[0.04]"
            style={{ color: showComments ? '#FF3B10' : '#555' }}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-inter text-xs font-medium tabular-nums">
              {post.comments_count || 0}
            </span>
          </button>

          {/* Like count pill */}
          {post.likes_count > 0 && (
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300"
              style={{ background: liked ? 'rgba(255,59,16,0.08)' : 'rgba(255,255,255,0.03)' }}
            >
              <span className="text-xs">
                {activeReaction !== null ? REACTIONS[activeReaction].emoji : '\u2764\uFE0F'}
              </span>
              <span
                className="font-inter text-xs font-semibold tabular-nums transition-colors duration-300"
                style={{ color: liked ? '#FF3B10' : '#555' }}
              >
                {post.likes_count}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="px-6 pb-5">
          <CommentSection
            postId={post.id}
            fetchComments={async (id) => {
        
              const { data } = await supabase
                .from('forum_comments')
                .select('*, profiles(display_name)')
                .eq('post_id', id)
                .order('created_at', { ascending: true });
              return (data || []).map((c: any) => ({
                ...c,
                author_name: c.profiles?.display_name || 'Anonymous',
              }));
            }}
            addComment={async (id, content) => {
        
              const { data } = await supabase
                .from('forum_comments')
                .insert({ post_id: id, content, author_id: user?.id })
                .select('*, profiles(display_name)')
                .maybeSingle();
              if (data) {
                onLikeCountChange(post.id, 0);
                return { ...data, author_name: (data as any).profiles?.display_name || 'Anonymous' };
              }
              return null;
            }}
            onCommentAdded={() => onLikeCountChange(post.id, 0)}
          />
        </div>
      )}

      {/* Keyframes injected once via style tag */}
      <style>{`
        @keyframes reactionBurst {
          0% { opacity: 1; transform: rotate(var(--deg, 0deg)) translateY(-4px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--deg, 0deg)) translateY(-18px) scale(0); }
        }
      `}</style>
    </div>
  );
}

export default React.memo(PostCard);
