import { useState, useEffect, useCallback } from 'react';
import { supabase, type ForumPostRow } from '../lib/supabase';

const PAGE_SIZE = 10;

export interface PostWithAuthor extends ForumPostRow {
  author_name: string;
  author_avatar_url: string | null;
}

interface ForumPostWithProfile extends ForumPostRow {
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

export function usePosts() {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async (cursor?: string) => {
    const isLoadMore = !!cursor;
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('forum_posts')
        .select('*, profiles(display_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error: queryError } = await query;

      if (queryError) {
        setError(queryError.message);
      } else if (data) {
        const mapped: PostWithAuthor[] = (data as ForumPostWithProfile[]).map((row) => ({
          id: row.id,
          author_id: row.author_id,
          content: row.content,
          image_url: row.image_url,
          likes_count: row.likes_count,
          comments_count: row.comments_count,
          created_at: row.created_at,
          author_name: row.profiles?.display_name ?? 'Anonymous',
          author_avatar_url: row.profiles?.avatar_url ?? null,
        }));

        if (isLoadMore) {
          setPosts((prev) => [...prev, ...mapped]);
        } else {
          setPosts(mapped);
        }
        setHasMore(mapped.length === PAGE_SIZE);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    }

    if (isLoadMore) setLoadingMore(false);
    else setLoading(false);
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (posts.length === 0 || loadingMore || !hasMore) return;
    const lastPost = posts[posts.length - 1];
    fetchPosts(lastPost.created_at);
  }, [posts, loadingMore, hasMore, fetchPosts]);

  const prependPost = useCallback((post: PostWithAuthor) => {
    setPosts((prev) => [post, ...prev]);
  }, []);

  const removePost = useCallback((postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  }, []);

  const updatePostCounts = useCallback(
    (postId: string, field: 'likes_count' | 'comments_count', delta: number) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, [field]: Math.max(0, p[field] + delta) } : p,
        ),
      );
    },
    [],
  );

  return { posts, loading, error, loadingMore, hasMore, loadMore, prependPost, removePost, updatePostCounts };
}
