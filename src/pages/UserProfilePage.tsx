import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  UserCheck,
  UserPlus,
  UserX,
  FileText,
  Trophy,
  Info,
  Shield,
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/community/PostCard';
import { resolveImageUrl } from '../lib/imageUrl';

type Tab = 'posts' | 'events' | 'about';

function SkeletonProfile() {
  return (
    <div className="min-h-screen bg-surface pt-24">
      {/* Banner skeleton */}
      <div className="h-48 bg-gradient-to-br from-white/[0.02] to-transparent animate-pulse" />
      <div className="px-6 md:px-12">
        <div className="max-w-4xl mx-auto -mt-12">
          <div className="flex items-end gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-white/[0.04] animate-pulse ring-4 ring-[#111] shrink-0" />
            <div className="flex-1 pb-2">
              <div className="h-7 w-48 bg-white/[0.06] rounded-lg mb-3 animate-pulse" />
              <div className="h-4 w-72 bg-white/[0.03] rounded-lg animate-pulse" />
            </div>
          </div>
          <div className="flex gap-6 mb-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-4 w-20 bg-white/[0.04] rounded animate-pulse" />
            ))}
          </div>
          <div className="h-12 w-full bg-white/[0.02] rounded-xl animate-pulse mb-8" />
          {[1, 2].map((n) => (
            <div
              key={n}
              className="rounded-2xl p-6 mb-5"
              style={{ background: '#222', border: '1px solid rgba(255,255,255,0.04)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] animate-pulse" />
                <div>
                  <div className="h-3 w-24 bg-white/[0.06] rounded mb-2 animate-pulse" />
                  <div className="h-2 w-16 bg-white/[0.03] rounded animate-pulse" />
                </div>
              </div>
              <div className="h-3 w-full bg-white/[0.04] rounded mb-2 animate-pulse" />
              <div className="h-3 w-3/4 bg-white/[0.03] rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const {
    profile,
    posts,
    events,
    followerCount,
    followingCount,
    isFollowing,
    loading,
    notFound,
    toggleFollow,
  } = useUserProfile(userId);
  const { isLiked, toggleLike, deletePost } = usePostInteractions();

  const [activeTab, setActiveTab] = useState<Tab>('posts');
  const [followHover, setFollowHover] = useState(false);

  if (loading) return <SkeletonProfile />;

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-surface pt-24 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-8">
          <Users className="w-8 h-8 text-white/15" />
        </div>
        <h2 className="font-syne font-bold text-2xl text-[#F5F5F0] mb-3">User not found</h2>
        <p className="font-inter text-white/30 text-sm mb-8">
          This profile doesn't exist or has been removed.
        </p>
        <Link
          to="/community"
          className="px-6 py-3 bg-accent text-black font-syne font-bold text-sm uppercase tracking-wide rounded-xl hover:brightness-110 transition-all"
        >
          Back to Community
        </Link>
      </div>
    );
  }

  const isOwnProfile = user?.id === profile.id;
  const initial = (profile.display_name || 'A').charAt(0).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const tabs: { key: Tab; label: string; icon: typeof FileText; count?: number }[] = [
    { key: 'posts', label: 'Posts', icon: FileText, count: posts.length },
    { key: 'events', label: 'Events', icon: Trophy, count: events.length },
    { key: 'about', label: 'About', icon: Info },
  ];

  const handleToggleLike = async (postId: string) => {
    if (!user) return false;
    return toggleLike(postId);
  };

  const handleDelete = async (postId: string) => {
    return deletePost(postId);
  };

  const handleLikeCountChange = (_postId: string, _delta: number) => {
    // In the profile page context we don't have a centralized post state updater,
    // so we allow PostCard's internal optimistic update to handle it visually.
  };

  return (
    <div className="min-h-screen bg-surface pt-24">
      {/* ── Banner ────────────────────────────────────────────────── */}
      <div
        className="h-48 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,59,16,0.08) 0%, rgba(255,59,16,0.02) 40%, transparent 100%)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#111]" />
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Profile Header ────────────────────────────────────────── */}
      <div className="px-6 md:px-12">
        <div className="max-w-4xl mx-auto -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5 mb-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#1a1a1a] ring-4 ring-[#111] shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                  <span className="font-syne font-bold text-3xl text-accent">
                    {initial}
                  </span>
                </div>
              )}
            </div>

            {/* Name + meta */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-syne font-bold text-3xl text-[#F5F5F0] tracking-tight">
                  {profile.display_name}
                </h1>
                {(profile.role === 'organizer' || profile.role === 'admin') && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-inter font-bold bg-accent/10 text-accent border border-accent/20">
                    <Shield className="w-3 h-3" />
                    {profile.role === 'admin' ? 'Admin' : 'Organizer'}
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="font-inter text-sm text-white/50 mt-2 max-w-lg leading-relaxed">
                  {profile.bio}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <span className="flex items-center gap-1.5 font-inter text-xs text-white/30">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {memberSince}
                </span>
                {profile.location && (
                  <span className="flex items-center gap-1.5 font-inter text-xs text-white/30">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
              </div>
            </div>

            {/* Follow / Edit button */}
            <div className="shrink-0">
              {isOwnProfile ? (
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-sm font-inter font-medium text-white/50 hover:text-white/80 hover:border-white/15 transition-all duration-300"
                >
                  Edit Profile
                </Link>
              ) : user ? (
                <button
                  onClick={toggleFollow}
                  onMouseEnter={() => setFollowHover(true)}
                  onMouseLeave={() => setFollowHover(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-inter font-bold transition-all duration-300"
                  style={
                    isFollowing
                      ? followHover
                        ? {
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            color: '#ef4444',
                          }
                        : {
                            background: 'rgba(255,59,16,0.1)',
                            border: '1px solid rgba(255,59,16,0.3)',
                            color: '#FF3B10',
                          }
                      : {
                          background: '#FF3B10',
                          border: '1px solid #FF3B10',
                          color: '#000',
                        }
                  }
                >
                  {isFollowing ? (
                    followHover ? (
                      <>
                        <UserX className="w-4 h-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Following
                      </>
                    )
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
              ) : null}
            </div>
          </div>

          {/* ── Stats row ──────────────────────────────────────────── */}
          <div className="flex items-center gap-6 mb-8">
            <div className="flex items-center gap-1.5">
              <span className="font-syne font-bold text-lg text-[#F5F5F0]">
                {followerCount}
              </span>
              <span className="font-inter text-xs text-white/30">
                {followerCount === 1 ? 'Follower' : 'Followers'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-syne font-bold text-lg text-[#F5F5F0]">
                {followingCount}
              </span>
              <span className="font-inter text-xs text-white/30">
                Following
              </span>
            </div>
          </div>

          {/* ── Tab Navigation ─────────────────────────────────────── */}
          <div className="relative flex gap-8 border-b border-white/[0.06] mb-8">
            {tabs.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`relative flex items-center gap-2 pb-4 font-inter text-sm transition-all duration-300 ${
                    isActive
                      ? 'text-[#F5F5F0]'
                      : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-colors duration-300 ${
                      isActive ? 'text-accent' : ''
                    }`}
                  />
                  <span className="font-medium">{t.label}</span>
                  {t.count !== undefined && (
                    <span
                      className={`ml-0.5 text-xs tabular-nums transition-colors duration-300 ${
                        isActive ? 'text-accent' : 'text-white/20'
                      }`}
                    >
                      {t.count}
                    </span>
                  )}
                  <span
                    className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-accent opacity-100'
                        : 'bg-transparent opacity-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* ── Tab Content ────────────────────────────────────────── */}
          <div className="pb-24">
            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div>
                {posts.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-7 h-7 text-white/10" />
                    </div>
                    <h3 className="font-syne font-bold text-lg text-[#F5F5F0]/80 mb-2">
                      No posts yet
                    </h3>
                    <p className="font-inter text-white/30 text-sm">
                      {isOwnProfile
                        ? 'Share your first post with the community!'
                        : 'This user hasn\'t posted anything yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 max-w-3xl">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        liked={isLiked(post.id)}
                        onToggleLike={handleToggleLike}
                        onDelete={handleDelete}
                        onLikeCountChange={handleLikeCountChange}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                {events.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
                      <Trophy className="w-7 h-7 text-white/10" />
                    </div>
                    <h3 className="font-syne font-bold text-lg text-[#F5F5F0]/80 mb-2">
                      No events yet
                    </h3>
                    <p className="font-inter text-white/30 text-sm">
                      {isOwnProfile
                        ? 'Register for events to see them here!'
                        : 'This user hasn\'t registered for any events yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {events.map((event) => {
                      const d = new Date(event.date + 'T00:00:00');
                      const month = d
                        .toLocaleString('en-US', { month: 'short' })
                        .toUpperCase();
                      const day = d.getDate().toString().padStart(2, '0');
                      return (
                        <Link
                          key={event.id}
                          to={`/events/${event.id}`}
                          className="group relative bg-white/[0.02] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-accent/25 hover:bg-white/[0.03] transition-all duration-500"
                        >
                          <div className="relative aspect-[16/10] overflow-hidden">
                            <img
                              src={resolveImageUrl(event.image_url)}
                              alt={event.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                            <div className="absolute top-3 left-3 bg-[#111111]/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-center border border-white/[0.08]">
                              <span className="block text-[9px] font-inter font-bold uppercase tracking-wider text-accent">
                                {month}
                              </span>
                              <span className="block text-lg font-inter font-bold leading-none text-[#F5F5F0]">
                                {day}
                              </span>
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-syne font-bold text-lg text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 truncate">
                              {event.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-2 text-white/35">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-sm font-inter truncate">
                                {event.city}
                                {event.state ? `, ${event.state}` : ''}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.04]">
                              <div className="flex flex-wrap gap-1.5">
                                {event.distance_tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-inter font-semibold bg-accent/10 text-accent"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <span className="font-inter font-semibold text-sm text-[#F5F5F0]/80">
                                {'₹'}{event.price}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="max-w-lg">
                <div
                  className="rounded-2xl p-6 space-y-5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-white/25 shrink-0" />
                      <div>
                        <span className="block font-inter text-xs text-white/30 mb-0.5">
                          Location
                        </span>
                        <span className="font-inter text-sm text-[#F5F5F0]/80">
                          {profile.location}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-white/25 shrink-0" />
                    <div>
                      <span className="block font-inter text-xs text-white/30 mb-0.5">
                        Member since
                      </span>
                      <span className="font-inter text-sm text-[#F5F5F0]/80">
                        {memberSince}
                      </span>
                    </div>
                  </div>
                  {(profile.role === 'organizer' || profile.role === 'admin') && (
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-white/25 shrink-0" />
                      <div>
                        <span className="block font-inter text-xs text-white/30 mb-0.5">
                          Role
                        </span>
                        <span className="font-inter text-sm text-[#F5F5F0]/80 capitalize">
                          {profile.role}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-white/25 shrink-0" />
                    <div>
                      <span className="block font-inter text-xs text-white/30 mb-0.5">
                        Total posts
                      </span>
                      <span className="font-inter text-sm text-[#F5F5F0]/80">
                        {posts.length}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-white/25 shrink-0" />
                    <div>
                      <span className="block font-inter text-xs text-white/30 mb-0.5">
                        Events registered
                      </span>
                      <span className="font-inter text-sm text-[#F5F5F0]/80">
                        {events.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
