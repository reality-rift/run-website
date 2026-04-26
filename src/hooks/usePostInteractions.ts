import { useState, useEffect, useCallback } from 'react';
import { supabase, type ForumCommentRow } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { validateFileUpload } from '../lib/validation';
import type { PostWithAuthor } from './usePosts';

export function usePostInteractions() {
  const { user } = useAuth();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  // Load user's likes on mount
  useEffect(() => {
    if (!user) {
      setLikedIds(new Set());
      return;
    }

    let cancelled = false;

    supabase
      .from('forum_likes')
      .select('post_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (!cancelled && data) {
          setLikedIds(new Set(data.map((d) => d.post_id)));
        }
      }, () => {
        // Silently handle fetch error for likes
      });

    return () => { cancelled = true; };
  }, [user]);

  const isLiked = useCallback((postId: string) => likedIds.has(postId), [likedIds]);

  const toggleLike = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) return false;

      if (likedIds.has(postId)) {
        // Optimistic remove
        setLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
        const { error } = await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) {
          setLikedIds((prev) => new Set(prev).add(postId));
        }
        return false;
      } else {
        // Optimistic add
        setLikedIds((prev) => new Set(prev).add(postId));
        const { error } = await supabase
          .from('forum_likes')
          .insert({ user_id: user.id, post_id: postId });
        if (error) {
          setLikedIds((prev) => {
            const next = new Set(prev);
            next.delete(postId);
            return next;
          });
        }
        return true;
      }
    },
    [user, likedIds],
  );

  const createPost = useCallback(
    async (content: string, imageFile?: File): Promise<PostWithAuthor | null> => {
      if (!user) return null;

      let image_url: string | null = null;

      if (imageFile) {
        const uploadError = validateFileUpload(imageFile);
        if (uploadError) return null;

        const ext = imageFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from('forum-images')
          .upload(path, imageFile);
        if (uploadErr) return null;

        const { data: urlData } = supabase.storage
          .from('forum-images')
          .getPublicUrl(path);
        image_url = urlData.publicUrl;
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({ author_id: user.id, content, image_url })
        .select('*, profiles(display_name, avatar_url)')
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        author_id: data.author_id,
        content: data.content,
        image_url: data.image_url,
        likes_count: data.likes_count,
        comments_count: data.comments_count,
        created_at: data.created_at,
        author_name: (data as any).profiles?.display_name ?? 'Anonymous',
        author_avatar_url: (data as any).profiles?.avatar_url ?? null,
      };
    },
    [user],
  );

  const addComment = useCallback(
    async (postId: string, content: string): Promise<(ForumCommentRow & { author_name: string }) | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('forum_comments')
        .insert({ post_id: postId, author_id: user.id, content })
        .select('*, profiles(display_name, avatar_url)')
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        post_id: data.post_id,
        author_id: data.author_id,
        content: data.content,
        created_at: data.created_at,
        author_name: (data as any).profiles?.display_name ?? 'Anonymous',
      };
    },
    [user],
  );

  const fetchComments = useCallback(
    async (postId: string): Promise<(ForumCommentRow & { author_name: string })[]> => {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*, profiles(display_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map((row: any) => ({
        id: row.id,
        post_id: row.post_id,
        author_id: row.author_id,
        content: row.content,
        created_at: row.created_at,
        author_name: row.profiles?.display_name ?? 'Anonymous',
      }));
    },
    [],
  );

  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) return false;
      const { error } = await supabase.from('forum_posts').delete().eq('id', postId);
      return !error;
    },
    [user],
  );

  return { isLiked, toggleLike, createPost, addComment, fetchComments, deletePost };
}
