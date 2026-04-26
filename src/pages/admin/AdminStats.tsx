import { useEffect, useState } from 'react';
import {
  Users,
  Megaphone,
  CalendarDays,
  Ticket,
  Heart,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  organizers: number;
  totalEvents: number;
  approvedEvents: number;
  pendingEvents: number;
  rejectedEvents: number;
  registrations: number;
  savedEvents: number;
  subscribers: number;
}

const EMPTY: Stats = {
  totalUsers: 0,
  organizers: 0,
  totalEvents: 0,
  approvedEvents: 0,
  pendingEvents: 0,
  rejectedEvents: 0,
  registrations: 0,
  savedEvents: 0,
  subscribers: 0,
};

export default function AdminStats({ refreshKey }: { refreshKey: number }) {
  const [stats, setStats] = useState<Stats>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [
        profilesRes,
        organizersRes,
        eventsRes,
        approvedRes,
        pendingRes,
        rejectedRes,
        registrationsRes,
        savedRes,
        subscribersRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'organizer'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('registrations').select('id', { count: 'exact', head: true }),
        supabase.from('saved_events').select('id', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        totalUsers: profilesRes.count ?? 0,
        organizers: organizersRes.count ?? 0,
        totalEvents: eventsRes.count ?? 0,
        approvedEvents: approvedRes.count ?? 0,
        pendingEvents: pendingRes.count ?? 0,
        rejectedEvents: rejectedRes.count ?? 0,
        registrations: registrationsRes.count ?? 0,
        savedEvents: savedRes.count ?? 0,
        subscribers: subscribersRes.count ?? 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, [refreshKey]);

  const primaryCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      gradient: 'from-sky-500/20 to-sky-500/5',
      iconBg: 'bg-sky-500/15',
      iconColor: 'text-sky-400',
      borderColor: 'border-sky-500/10',
      valueColor: 'text-sky-50',
    },
    {
      label: 'Organizers',
      value: stats.organizers,
      icon: Megaphone,
      gradient: 'from-accent/20 to-accent/5',
      iconBg: 'bg-accent/15',
      iconColor: 'text-accent',
      borderColor: 'border-accent/10',
      valueColor: 'text-orange-50',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents,
      icon: CalendarDays,
      gradient: 'from-emerald-500/20 to-emerald-500/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/10',
      valueColor: 'text-emerald-50',
    },
    {
      label: 'Registrations',
      value: stats.registrations,
      icon: Ticket,
      gradient: 'from-cyan-500/20 to-cyan-500/5',
      iconBg: 'bg-cyan-500/15',
      iconColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/10',
      valueColor: 'text-cyan-50',
    },
    {
      label: 'Saved Events',
      value: stats.savedEvents,
      icon: Heart,
      gradient: 'from-rose-500/20 to-rose-500/5',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-400',
      borderColor: 'border-rose-500/10',
      valueColor: 'text-rose-50',
    },
    {
      label: 'Subscribers',
      value: stats.subscribers,
      icon: Mail,
      gradient: 'from-amber-500/20 to-amber-500/5',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-400',
      borderColor: 'border-amber-500/10',
      valueColor: 'text-amber-50',
    },
  ];

  const eventStatusCards = [
    {
      label: 'Approved',
      value: stats.approvedEvents,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      border: 'border-emerald-400/15',
    },
    {
      label: 'Pending',
      value: stats.pendingEvents,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-400/10',
      border: 'border-amber-400/15',
    },
    {
      label: 'Rejected',
      value: stats.rejectedEvents,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      border: 'border-red-400/15',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {primaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`relative overflow-hidden rounded-2xl border ${card.borderColor} bg-gradient-to-br ${card.gradient} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
            >
              <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              {loading ? (
                <div className="space-y-2">
                  <div className="h-8 w-14 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-3 w-20 bg-white/[0.03] rounded animate-pulse" />
                </div>
              ) : (
                <>
                  <p className={`font-syne font-bold text-2xl ${card.valueColor} tracking-tight`}>
                    {card.value.toLocaleString()}
                  </p>
                  <p className="font-inter text-[10px] text-white/30 mt-1 uppercase tracking-wider font-medium">
                    {card.label}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <h3 className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/30 mb-4">
          Event Status Breakdown
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {eventStatusCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl ${card.bg} border ${card.border}`}
              >
                <Icon className={`w-4 h-4 ${card.color} shrink-0`} />
                <div className="min-w-0">
                  {loading ? (
                    <div className="h-5 w-8 bg-white/5 rounded animate-pulse" />
                  ) : (
                    <p className={`font-syne font-bold text-lg ${card.color}`}>
                      {card.value}
                    </p>
                  )}
                  <p className="font-inter text-[10px] text-white/30 uppercase tracking-wider font-medium">
                    {card.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        {!loading && stats.totalEvents > 0 && (
          <div className="mt-4 flex h-2 rounded-full overflow-hidden bg-white/[0.04]">
            {stats.approvedEvents > 0 && (
              <div
                className="bg-emerald-400/60 transition-all duration-500"
                style={{ width: `${(stats.approvedEvents / stats.totalEvents) * 100}%` }}
              />
            )}
            {stats.pendingEvents > 0 && (
              <div
                className="bg-amber-400/60 transition-all duration-500"
                style={{ width: `${(stats.pendingEvents / stats.totalEvents) * 100}%` }}
              />
            )}
            {stats.rejectedEvents > 0 && (
              <div
                className="bg-red-400/60 transition-all duration-500"
                style={{ width: `${(stats.rejectedEvents / stats.totalEvents) * 100}%` }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
