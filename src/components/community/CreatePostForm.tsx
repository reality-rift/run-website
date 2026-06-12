import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import type { PostWithAuthor } from '../../hooks/usePosts';

const MAX_CHARS = 2000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

interface CreatePostFormProps {
  onPostCreated: (post: PostWithAuthor) => void;
  createPost: (content: string, imageFile?: File) => Promise<PostWithAuthor | null>;
}

export default function CreatePostForm({ onPostCreated, createPost }: CreatePostFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div
        className="rounded-2xl p-8 text-center"
        style={{ background: 'var(--x222)', border: '1px solid var(--w006)' }}
      >
        <p className="font-inter text-sm mb-4" style={{ color: 'var(--t888)' }}>
          Join the conversation
        </p>
        <Link
          to="/login"
          className="inline-flex items-center font-syne font-bold text-sm uppercase tracking-[0.08em] px-8 py-3 rounded-xl transition-all duration-300 hover:brightness-110"
          style={{ background: '#FF3B10', color: '#000' }}
        >
          Login to post
        </Link>
      </div>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image must be under 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    setError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!content.trim()) {
      setError('Post content cannot be empty.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const post = await createPost(content.trim(), imageFile ?? undefined);
    if (post) {
      onPostCreated(post);
      setContent('');
      removeImage();
    } else {
      setError('Failed to create post. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--x222)', border: '1px solid var(--w006)' }}
    >
      <div className="p-6">
        <textarea
          placeholder="Share a race story, training tip, or photo..."
          aria-label="Write your post"
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
          rows={3}
          className="w-full font-inter text-sm resize-none outline-none leading-relaxed"
          style={{
            background: 'transparent',
            color: 'var(--teee)',
            minHeight: 80,
          }}
        />

        {/* Image preview */}
        {imagePreview && (
          <div className="relative mt-3 rounded-xl overflow-hidden inline-block">
            <img src={imagePreview} alt="Post image preview" className="max-h-48 rounded-xl object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all"
              style={{ background: 'rgba(0,0,0,0.7)', color: 'var(--tfff)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <p className="font-inter text-xs mt-2" style={{ color: '#ef4444' }}>
            {error}
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{ borderTop: '1px solid var(--x333)' }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 hover:bg-white/[0.06]"
            style={{ color: 'var(--t777)' }}
            title="Add image"
            aria-label="Add image"
          >
            <ImagePlus className="w-[18px] h-[18px]" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <span className="font-inter text-[11px]" style={{ color: 'var(--x555)' }}>
            {content.length}/{MAX_CHARS}
          </span>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-2 font-syne font-bold text-sm uppercase tracking-[0.06em] px-6 py-2 rounded-xl transition-all duration-300"
          style={{
            background: content.trim() && !submitting ? '#FF3B10' : 'var(--x333)',
            color: content.trim() && !submitting ? '#000' : 'var(--t666)',
          }}
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Post
        </button>
      </div>
    </form>
  );
}
