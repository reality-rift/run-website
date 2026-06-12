import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import type { ForumCommentRow } from '../../lib/supabase';

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

interface CommentWithAuthor extends ForumCommentRow {
  author_name: string;
}

interface CommentSectionProps {
  postId: string;
  fetchComments: (postId: string) => Promise<CommentWithAuthor[]>;
  addComment: (postId: string, content: string) => Promise<CommentWithAuthor | null>;
  onCommentAdded: () => void;
}

export default function CommentSection({ postId, fetchComments, addComment, onCommentAdded }: CommentSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchComments(postId).then((data) => {
      setComments(data);
      setLoading(false);
    });
  }, [postId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    const comment = await addComment(postId, text.trim());
    if (comment) {
      setComments((prev) => [...prev, comment]);
      setText('');
      onCommentAdded();
    }
    setSubmitting(false);
  };

  return (
    <div style={{ borderTop: '1px solid var(--x333)', paddingTop: 16, marginTop: 12 }}>
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2].map((n) => (
            <div key={n} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-white/[0.04] shrink-0" />
              <div className="flex-1">
                <div className="h-3 w-20 bg-white/[0.05] rounded mb-2" />
                <div className="h-3 w-48 bg-white/[0.03] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="font-inter text-xs" style={{ color: 'var(--t666)' }}>
          No comments yet. Be the first!
        </p>
      ) : (
        <div className="flex flex-col gap-3 mb-4">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-3">
              <Link
                to={`/user/${c.author_id}`}
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-syne font-bold text-xs hover:ring-1 hover:ring-accent/30 transition-all duration-300"
                style={{ background: 'var(--x333)', color: 'var(--tccc)' }}
              >
                {c.author_name.charAt(0).toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/user/${c.author_id}`}
                    className="font-syne font-bold text-xs hover:text-accent transition-colors duration-300"
                    style={{ color: 'var(--tddd)' }}
                  >
                    {c.author_name}
                  </Link>
                  <span className="font-inter text-[10px]" style={{ color: 'var(--x555)' }}>
                    {relativeTime(c.created_at)}
                  </span>
                </div>
                <p className="font-inter text-sm leading-relaxed mt-0.5" style={{ color: 'var(--taaa)' }}>
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
        <input
          type="text"
          placeholder={user ? 'Add a comment...' : 'Login to comment'}
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          disabled={!user}
          className="flex-1 font-inter text-sm px-4 py-2.5 rounded-xl outline-none transition-all duration-300"
          style={{
            background: 'var(--x1a1a1a)',
            border: '1px solid var(--x333)',
            color: 'var(--teee)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#FF3B10')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--x333)')}
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: text.trim() ? '#FF3B10' : 'var(--x333)',
            color: text.trim() ? '#000' : 'var(--t666)',
          }}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
