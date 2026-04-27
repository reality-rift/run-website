import { useState, useEffect, useCallback } from 'react';
import { supabase, type EventRow, type ProfileRow } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { PostWithAuthor } from './usePosts';

interface UserProfile {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  role: ProfileRow['role'];
  location: string;
  created_at: string;
}

interface UserProfileData {
  profile: UserProfile | null;
  posts: PostWithAuthor[];
  events: EventRow[];
  followerCount: number;
  followingCount: number;
  isFollowing: boolean;
  loading: boolean;
  notFound: boolean;
}

export function useUserProfile(userId: string | undefined) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    const fetchAll = async () => {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, bio, avatar_url, role, location, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (profileError || !profileData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile({
        id: profileData.id,
        display_name: profileData.display_name || 'Anonymous',
        bio: profileData.bio || '',
        avatar_url: profileData.avatar_url || null,
        role: profileData.role,
        location: profileData.location || '',
        created_at: profileData.created_at,
      });

      // Fetch counts and data in parallel
      const [
        followerRes,
        followingRes,
        isFollowingRes,
        postsRes,
        eventsRes,
      ] = await Promise.all([
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('id', { count: 'exact', head: true })
          .eq('follower_id', userId),
        user && user.id !== userId
          ? supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', userId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from('forum_posts')
          .select('*, profiles(display_name, avatar_url)')
          .eq('author_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('registrations')
          .select('event_id, events(*)')
          .eq('user_id', userId),
      ]);

      if (cancelled) return;

      setFollowerCount(followerRes.count ?? 0);
      setFollowingCount(followingRes.count ?? 0);
      setIsFollowing(!!isFollowingRes.data);

      if (postsRes.data) {
        const mapped: PostWithAuthor[] = (postsRes.data as any[]).map((row) => ({
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
        setPosts(mapped);
      }

      if (eventsRes.data) {
        const allEvents = eventsRes.data
          .map((r: any) => r.events as EventRow)
          .filter((e): e is EventRow => !!e);
        setEvents(allEvents);
      }

      setLoading(false);
    };

    fetchAll();

    return () => {
      cancelled = true;
    };
  }, [userId, user]);

  const toggleFollow = useCallback(async () => {
    if (!user || !userId || user.id === userId) return;

    if (isFollowing) {
      // Optimistic unfollow
      setIsFollowing(false);
      setFollowerCount((c) => Math.max(0, c - 1));

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) {
        setIsFollowing(true);
        setFollowerCount((c) => c + 1);
      }
    } else {
      // Optimistic follow
      setIsFollowing(true);
      setFollowerCount((c) => c + 1);

      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });

      if (error) {
        setIsFollowing(false);
        setFollowerCount((c) => Math.max(0, c - 1));
      }
    }
  }, [user, userId, isFollowing]);

  const data: UserProfileData = {
    profile,
    posts,
    events,
    followerCount,
    followingCount,
    isFollowing,
    loading,
    notFound,
  };

  return { ...data, toggleFollow };
}
