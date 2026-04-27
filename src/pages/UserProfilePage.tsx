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
  ArrowLeft,
} from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/community/PostCard';
import { resolveImageUrl } from '../lib/imageUrl';

type Tab = 'posts' | 'events' | 'about';

function SkeletonProfile() {
  return (
    <div className="min-h-screen bg-surface pt-20">
      {/* Banner skeleton */}
      <div className="h-52 md:h-60 bg-gradient-to-br from-white/[0.03] to-transparent animate-pulse" />
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        {/* Avatar skeleton */}
        <div className="-mt-16 mb-5">
          <div className="w-32 h-32 rounded-full bg-white/[0.04] animate-pulse ring-4 ring-[#111]" />
        </div>
        <div className="h-8 w-52 bg-white/[0.06] rounded-lg mb-3 animate-pulse" />
        <div className="h-4 w-80 bg-white/[0.03] rounded-lg animate-pulse mb-6" />
        <div className="flex gap-5 mb-8">
          {[1, 2].map((n) => (
            <div key={n} className="h-4 w-24 bg-white/[0.04] rounded animate-pulse" />
          ))}
        </div>
        <div className="h-12 w-full bg-white/[0.02] rounded-xl animate-pulse mb-8" />
        {[1, 2].map((n) => (
          <div
            key={n}
            className="rounded-2xl p-6 mb-5"
            style={{ background: '#191919' }}
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
      <div className="min-h-screen bg-surface pt-20 flex flex-col items-center justify-center">
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
    // PostCard's internal optimistic update handles it visually
  };

  return (
    <div className="min-h-screen bg-surface pt-20">
      {/* ── Banner ──────────────────────────────────────────────── */}
      <div className="relative h-52 md:h-60 overflow-hidden">
        {/* Accent gradient background */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,59,16,0.15) 0%, rgba(255,59,16,0.06) 35%, rgba(30,30,30,0.9) 70%, #111 100%)',
          }}
        />
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Bottom fade into page bg */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#111] to-transparent" />

        {/* Back button */}
        <Link
          to="/community"
          className="absolute top-5 left-5 z-10 w-10 h-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* ── Profile Content ─────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-5 md:px-8">
        {/* ── Avatar + Action row ─────────────────────────────── */}
        <div className="flex items-end justify-between -mt-16 mb-5">
          {/* Avatar — overlapping banner */}
          <div className="w-[120px] h-[120px] md:w-[134px] md:h-[134px] rounded-full overflow-hidden ring-[5px] ring-[#111] bg-[#1a1a1a] shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5">
                <span className="font-syne font-bold text-4xl md:text-5xl text-accent">
                  {initial}
                </span>
              </div>
            )}
          </div>

          {/* Follow / Edit button */}
          <div className="pb-1">
            {isOwnProfile ? (
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/[0.12] text-sm font-inter font-semibold text-white/60 hover:text-white hover:border-white/25 transition-all duration-300"
              >
                Edit Profile
              </Link>
            ) : user ? (
              <button
                onClick={toggleFollow}
                onMouseEnter={() => setFollowHover(true)}
                onMouseLeave={() => setFollowHover(false)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-inter font-bold transition-all duration-300 min-w-[120px] justify-center"
                style={
                  isFollowing
                    ? followHover
                      ? {
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          color: '#ef4444',
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: '#F5F5F0',
                        }
                    : {
                        background: '#F5F5F0',
                        border: '1px solid #F5F5F0',
                        color: '#111',
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

        {/* ── Name + Badge + Bio ──────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="font-syne font-bold text-[28px] md:text-[32px] text-[#F5F5F0] leading-tight tracking-tight">
              {profile.display_name}
            </h1>
            {(profile.role === 'organizer' || profile.role === 'admin') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-inter font-bold bg-accent/10 text-accent border border-accent/20">
                <Shield className="w-3 h-3" />
                {profile.role === 'admin' ? 'Admin' : 'Organizer'}
              </span>
            )}
          </div>

          {profile.bio && (
            <p className="font-inter text-[15px] text-white/50 mt-2 max-w-xl leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Meta info row */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            {profile.location && (
              <span className="flex items-center gap-1.5 font-inter text-[13px] text-white/30">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            <span className="flex items-center gap-1.5 font-inter text-[13px] text-white/30">
              <Calendar className="w-3.5 h-3.5" />
              Joined {memberSince}
            </span>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────── */}
        <div className="flex items-center gap-5 mb-6">
          <span className="font-inter text-[14px]">
            <span className="font-bold text-[#F5F5F0]">{followerCount}</span>
            <span className="text-white/35 ml-1">{followerCount === 1 ? 'Follower' : 'Followers'}</span>
          </span>
          <span className="font-inter text-[14px]">
            <span className="font-bold text-[#F5F5F0]">{followingCount}</span>
            <span className="text-white/35 ml-1">Following</span>
          </span>
        </div>

        {/* ── Tab Navigation ──────────────────────────────────── */}
        <div className="relative flex overflow-x-auto border-b border-white/[0.06] mb-8">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`relative flex items-center gap-2 px-5 py-4 font-inter text-[14px] transition-all duration-300 ${
                  isActive
                    ? 'text-[#F5F5F0]'
                    : 'text-white/30 hover:text-white/50 hover:bg-white/[0.02]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors duration-300 ${
                    isActive ? 'text-accent' : ''
                  }`}
                />
                <span className="font-semibold">{t.label}</span>
                {t.count !== undefined && (
                  <span
                    className={`text-[12px] tabular-nums transition-colors duration-300 ${
                      isActive ? 'text-accent' : 'text-white/20'
                    }`}
                  >
                    {t.count}
                  </span>
                )}
                {/* Active indicator */}
                <span
                  className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-accent opacity-100'
                      : 'bg-transparent opacity-0'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ─────────────────────────────────────── */}
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
                <div className="flex flex-col gap-5">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.map((event) => {
                    const d = new Date(event.date + 'T00:00:00');
                    const month = d
                      .toLocaleString('en-US', { month: 'short' })
                      .toUpperCase();
                    const day = d.getDate().toString().padStart(2, '0');
                    const isPast =
                      new Date(event.date + 'T23:59:59').getTime() < Date.now();
                    return (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className={`group relative rounded-2xl overflow-hidden border border-white/[0.06] hover:border-accent/25 transition-all duration-500 ${
                          isPast ? 'opacity-60' : ''
                        }`}
                        style={{ background: '#191919' }}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <img
                            src={resolveImageUrl(event.image_url)}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#191919] via-black/20 to-transparent" />

                          {/* Date badge */}
                          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xl px-3 py-2 rounded-xl text-center border border-white/[0.08]">
                            <span className="block text-[9px] font-inter font-extrabold uppercase tracking-[0.15em] text-accent leading-none">
                              {month}
                            </span>
                            <span className="block text-xl font-syne font-bold leading-none text-white mt-0.5">
                              {day}
                            </span>
                          </div>

                          {/* Status badge */}
                          {isPast && (
                            <div className="absolute top-3 right-3">
                              <span className="px-2.5 py-1 rounded-lg text-[10px] font-inter font-bold bg-white/10 backdrop-blur-xl text-white/60 border border-white/[0.08]">
                                Completed
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-syne font-bold text-[16px] text-[#F5F5F0] group-hover:text-accent transition-colors duration-300 truncate mb-2">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-1.5 text-white/35 mb-3">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-[13px] font-inter truncate">
                              {event.city}
                              {event.state ? `, ${event.state}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                            <div className="flex flex-wrap gap-1.5">
                              {(event.distance_tags ?? []).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2.5 py-0.5 rounded-md text-[10px] font-inter font-bold bg-accent/10 text-accent"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <span className="font-inter font-semibold text-[14px] text-[#F5F5F0]/70">
                              {'₹'}{(event.price ?? 0).toLocaleString('en-IN')}
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
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {profile.bio && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-white/25 shrink-0 mt-0.5" />
                    <div>
                      <span className="block font-inter text-xs text-white/30 mb-1">
                        Bio
                      </span>
                      <span className="font-inter text-sm text-[#F5F5F0]/80 leading-relaxed">
                        {profile.bio}
                      </span>
                    </div>
                  </div>
                )}
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
  );
}
