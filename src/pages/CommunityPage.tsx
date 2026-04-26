import { useState, useMemo } from 'react';
import { Users, Loader2 } from 'lucide-react';
import { usePosts } from '../hooks/usePosts';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import CreatePostForm from '../components/community/CreatePostForm';
import PostCard from '../components/community/PostCard';

export default function CommunityPage() {
  const { user } = useAuth();
  const { posts, loading, error, loadingMore, hasMore, loadMore, prependPost, removePost, updatePostCounts } = usePosts();
  const { isLiked, toggleLike, createPost, deletePost } = usePostInteractions();
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  const sortedPosts = useMemo(() => {
    if (sortBy === 'popular') {
      return [...posts].sort((a, b) => b.likes_count - a.likes_count);
    }
    return posts;
  }, [posts, sortBy]);

  const handleToggleLike = async (postId: string) => {
    if (!user) {
      toast('Login to like posts');
      return false;
    }
    return toggleLike(postId);
  };

  const handleDelete = async (postId: string) => {
    const success = await deletePost(postId);
    if (success) {
      removePost(postId);
      toast('Post deleted');
    } else {
      toast('Failed to delete post', 'error');
    }
    return success;
  };

  return (
    <div className="min-h-screen bg-surface pt-24">
      <div className="px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="relative overflow-hidden rounded-3xl mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
            <div className="relative px-8 py-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h1 className="font-syne font-bold text-3xl text-[#F5F5F0] tracking-tight">Community</h1>
                  <p className="font-inter text-sm text-white/40 mt-2 max-w-md leading-relaxed">
                    Race stories, training tips, and photos from fellow runners and cyclists.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post */}
          <div className="mb-8">
            <CreatePostForm
              onPostCreated={(post) => {
                prependPost(post);
                toast('Post shared!');
              }}
              createPost={createPost}
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm mb-4">
              Failed to load posts. Please try again.
            </div>
          )}

          {/* Sort Tabs */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-xl text-sm font-inter font-medium transition-all duration-300 ${
                sortBy === 'recent' ? 'bg-accent text-black' : 'text-white/40 hover:text-white/60 border border-white/[0.08]'
              }`}
            >
              Recent
            </button>
            <button
              onClick={() => setSortBy('popular')}
              className={`px-4 py-2 rounded-xl text-sm font-inter font-medium transition-all duration-300 ${
                sortBy === 'popular' ? 'bg-accent text-black' : 'text-white/40 hover:text-white/60 border border-white/[0.08]'
              }`}
            >
              Popular
            </button>
          </div>

          {/* Posts Feed */}
          {loading ? (
            <div className="flex flex-col gap-5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl p-6"
                  style={{ background: '#222', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/[0.04]" />
                    <div>
                      <div className="h-3 w-24 bg-white/[0.06] rounded mb-2" />
                      <div className="h-2 w-16 bg-white/[0.03] rounded" />
                    </div>
                  </div>
                  <div className="h-3 w-full bg-white/[0.04] rounded mb-2" />
                  <div className="h-3 w-3/4 bg-white/[0.03] rounded mb-2" />
                  <div className="h-3 w-1/2 bg-white/[0.02] rounded mb-4" />
                  <div className="flex gap-4">
                    <div className="h-5 w-12 bg-white/[0.03] rounded" />
                    <div className="h-5 w-12 bg-white/[0.03] rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white/10" />
              </div>
              <h3 className="font-syne font-bold text-xl text-[#F5F5F0] mb-2">
                No posts yet
              </h3>
              <p className="font-inter text-white/30 text-sm max-w-sm text-center leading-relaxed">
                Be the first to share a race story or training tip with the community.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {sortedPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  liked={isLiked(post.id)}
                  onToggleLike={handleToggleLike}
                  onDelete={handleDelete}
                  onLikeCountChange={(id, delta) => updatePostCounts(id, 'likes_count', delta)}
                />
              ))}

              {/* Load More */}
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-syne font-bold text-sm uppercase tracking-[0.08em] transition-all duration-300 hover:bg-white/[0.06]"
                    style={{ border: '1px solid #333', color: '#aaa' }}
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {loadingMore ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}

              {/* Footer */}
              <div className="text-center py-8">
                <p className="text-[11px] font-inter uppercase tracking-[0.2em]" style={{ color: '#444' }}>
                  {posts.length} post{posts.length !== 1 ? 's' : ''} in the feed
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
