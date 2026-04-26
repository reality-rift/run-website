import { useEffect, useState } from 'react';
import { Search, ChevronDown, Loader2, Shield, Megaphone, User, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';
import type { ProfileRow } from '../../lib/supabase';

interface ProfileWithEmail extends ProfileRow {
  email?: string;
}

const ROLE_CONFIG = {
  admin: {
    icon: Shield,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    dot: 'bg-amber-400',
  },
  organizer: {
    icon: Megaphone,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    dot: 'bg-accent',
  },
  user: {
    icon: User,
    color: 'text-white/50',
    bg: 'bg-white/5',
    border: 'border-white/10',
    dot: 'bg-white/30',
  },
} as const;

const AVATAR_COLORS = [
  'from-sky-500 to-sky-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600',
  'from-teal-500 to-teal-600',
  'from-cyan-500 to-cyan-600',
];

function getAvatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function UserTable({
  refreshKey,
  onRoleChange,
}: {
  refreshKey: number;
  onRoleChange: () => void;
}) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ProfileWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | ProfileRow['role']>('all');
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data } = await query;
      setProfiles((data as ProfileWithEmail[]) ?? []);
      setLoading(false);
    };
    fetchProfiles();
  }, [refreshKey, roleFilter]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleRoleChange = async (profileId: string, newRole: ProfileRow['role']) => {
    if (profileId === currentUser?.id) {
      toast('You cannot change your own role');
      return;
    }

    setChangingRole(profileId);
    setOpenDropdown(null);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId);

    if (error) {
      toast(error.message);
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === profileId ? { ...p, role: newRole } : p)),
      );
      toast(`Role updated to ${newRole}`);
      onRoleChange();
    }

    setChangingRole(null);
  };

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.display_name.toLowerCase().includes(q) ||
      (p.email?.toLowerCase().includes(q) ?? false) ||
      p.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-x-auto">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-syne font-bold text-xl text-[#F5F5F0]">User Management</h2>
            <p className="font-inter text-xs text-white/30 mt-1">
              {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'user' : 'users'} found`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full sm:w-56 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter text-white/80 placeholder:text-white/25 outline-none focus:border-accent/30 transition-colors"
              />
            </div>
            <div className="relative">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="appearance-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-9 text-sm font-inter text-white/60 outline-none focus:border-accent/30 transition-colors cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="organizer">Organizer</option>
                <option value="user">User</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_140px] gap-4 px-6 py-3 border-b border-white/[0.04]">
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25">User</span>
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25">Joined</span>
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25">ID</span>
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25 text-right">Role</span>
      </div>

      {loading ? (
        <div className="divide-y divide-white/[0.04]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-white/[0.04] rounded animate-pulse" />
                  <div className="h-3 w-20 bg-white/[0.03] rounded animate-pulse" />
                </div>
                <div className="h-8 w-24 bg-white/[0.04] rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-white/15" />
          </div>
          <p className="font-inter text-sm text-white/30">No users found</p>
          <p className="font-inter text-xs text-white/20 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((profile) => {
            const config = ROLE_CONFIG[profile.role];
            const RoleIcon = config.icon;
            const isSelf = profile.id === currentUser?.id;
            const avatarGradient = getAvatarColor(profile.id);
            const initial = (profile.display_name || 'U').charAt(0).toUpperCase();

            return (
              <div
                key={profile.id}
                className="group md:grid md:grid-cols-[2fr_1fr_1fr_140px] md:gap-4 md:items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center shrink-0 shadow-lg shadow-black/20`}>
                    <span className="font-syne font-bold text-sm text-white">
                      {initial}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-inter text-sm font-medium text-[#F5F5F0] truncate">
                        {profile.display_name || 'Unnamed User'}
                      </p>
                      {isSelf && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-inter font-semibold uppercase tracking-wider bg-white/[0.06] text-white/30">
                          you
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 md:hidden mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      <span className={`text-[11px] font-inter font-medium capitalize ${config.color}`}>
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-1.5 text-white/30">
                  <Clock className="w-3 h-3" />
                  <span className="font-inter text-xs">
                    {formatDate(profile.created_at)}
                  </span>
                </div>

                <div className="hidden md:block">
                  <span className="font-mono text-xs text-white/20">
                    {profile.id.slice(0, 12)}...
                  </span>
                </div>

                <div className="hidden md:flex justify-end relative">
                  {changingRole === profile.id ? (
                    <div className="px-4 py-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white/40" />
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenDropdown(openDropdown === profile.id ? null : profile.id);
                      }}
                      disabled={isSelf}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-inter font-medium border transition-all ${config.bg} ${config.color} ${config.border} ${
                        isSelf ? 'opacity-40 cursor-not-allowed' : 'hover:brightness-125 cursor-pointer'
                      }`}
                    >
                      <RoleIcon className="w-3.5 h-3.5" />
                      <span className="capitalize">{profile.role}</span>
                      {!isSelf && <ChevronDown className="w-3 h-3 ml-0.5 opacity-50" />}
                    </button>
                  )}

                  {openDropdown === profile.id && !isSelf && (
                    <div className="absolute right-0 top-full mt-2 z-30 min-w-[160px] bg-surface-card border border-white/10 rounded-xl shadow-2xl shadow-black/40 overflow-hidden">
                      <div className="px-3 py-2 border-b border-white/[0.06]">
                        <p className="font-inter text-[10px] font-semibold uppercase tracking-wider text-white/25">
                          Change role
                        </p>
                      </div>
                      {(['user', 'organizer', 'admin'] as const).map((r) => {
                        const rc = ROLE_CONFIG[r];
                        const Icon = rc.icon;
                        const isCurrentRole = profile.role === r;
                        return (
                          <button
                            key={r}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoleChange(profile.id, r);
                            }}
                            disabled={isCurrentRole}
                            className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-inter transition-colors ${
                              isCurrentRole
                                ? `${rc.color} font-semibold bg-white/[0.03] cursor-default`
                                : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] cursor-pointer'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span className="capitalize flex-1 text-left">{r}</span>
                            {isCurrentRole && (
                              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
