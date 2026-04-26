import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronDown,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  CalendarDays,
  MapPin,
  Users,
  Pencil,
} from 'lucide-react';
import { supabase, type EventRow } from '../../lib/supabase';
import { resolveImageUrl } from '../../lib/imageUrl';
import { useToast } from '../../components/Toast';
import EventAttendeesModal from './EventAttendeesModal';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    label: 'Pending Review',
  },
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    label: 'Approved',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    label: 'Rejected',
  },
} as const;

export default function EventManagement({
  refreshKey,
  onEditEvent,
}: {
  refreshKey: number;
  onEditEvent?: (event: EventRow) => void;
}) {
  const { toast } = useToast();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [attendeesEvent, setAttendeesEvent] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [refreshKey, statusFilter]);

  const fetchEvents = async () => {
    setLoading(true);
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data } = await query;
    setEvents(data ?? []);
    setLoading(false);
  };

  const handleApprove = async (eventId: string) => {
    setActionLoading(eventId);
    const { error } = await supabase
      .from('events')
      .update({ status: 'approved', rejection_reason: '' })
      .eq('id', eventId);

    if (error) {
      toast(error.message);
    } else {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, status: 'approved' as const, rejection_reason: '' } : e,
        ),
      );
      toast('Event approved');
    }
    setActionLoading(null);
  };

  const handleReject = async (eventId: string) => {
    if (!rejectReason.trim()) {
      toast('Please provide a reason for rejection');
      return;
    }
    setActionLoading(eventId);
    const { error } = await supabase
      .from('events')
      .update({ status: 'rejected', rejection_reason: rejectReason.trim() })
      .eq('id', eventId);

    if (error) {
      toast(error.message);
    } else {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, status: 'rejected' as const, rejection_reason: rejectReason.trim() }
            : e,
        ),
      );
      toast('Event rejected');
    }
    setActionLoading(null);
    setRejectingId(null);
    setRejectReason('');
  };

  const filtered = events.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.title.toLowerCase().includes(q) ||
      e.city.toLowerCase().includes(q) ||
      e.sport.toLowerCase().includes(q)
    );
  });

  const pendingCount = events.filter((e) => e.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Pending alert banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-amber-500/[0.06] border border-amber-500/15 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <p className="font-inter text-sm text-amber-400/90">
            <span className="font-semibold">{pendingCount}</span> event{pendingCount !== 1 ? 's' : ''} pending review
          </p>
        </div>
      )}

      {/* Main table container */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        {/* Header bar */}
        <div className="px-6 md:px-8 py-6 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-syne font-bold text-xl text-[#F5F5F0]">Event Management</h2>
              <p className="font-inter text-xs text-white/25 mt-1.5">
                {loading ? 'Loading...' : `${filtered.length} event${filtered.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events..."
                  className="w-full sm:w-60 bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter text-white/80 placeholder:text-white/20 outline-none focus:border-accent/30 focus:bg-white/[0.04] transition-all duration-300"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 pr-9 text-sm font-inter text-white/55 outline-none focus:border-accent/30 transition-all duration-300 cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="px-6 md:px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 rounded-xl bg-white/[0.04] animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-4 w-48 bg-white/[0.04] rounded-lg animate-pulse" />
                    <div className="h-3 w-32 bg-white/[0.03] rounded-lg animate-pulse" />
                  </div>
                  <div className="h-8 w-24 bg-white/[0.04] rounded-lg animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          /* Empty state */
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-5">
              <CalendarDays className="w-7 h-7 text-white/12" />
            </div>
            <p className="font-inter text-sm text-white/30 mb-1">No events found</p>
            <p className="font-inter text-xs text-white/15">Try adjusting your search or filter</p>
          </div>
        ) : (
          /* Event list */
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((event) => {
              const config = STATUS_CONFIG[event.status];
              const StatusIcon = config.icon;
              const isRejecting = rejectingId === event.id;

              return (
                <div key={event.id} className="px-6 md:px-8 py-5 hover:bg-white/[0.015] transition-colors duration-300">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    {event.image_url && (
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06] shrink-0">
                        <img
                          src={resolveImageUrl(event.image_url)}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Event details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h3 className="font-syne font-bold text-sm text-[#F5F5F0] truncate">
                          {event.title}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-inter font-semibold ${config.bg} ${config.color} ${config.border} border shrink-0`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-inter text-white/30">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.city}{event.state ? `, ${event.state}` : ''}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays className="w-3 h-3" />
                          {new Date(event.date + 'T00:00:00').toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="capitalize">{event.sport}</span>
                        <span className="font-medium text-white/40">{`\u20B9${event.price}`}</span>
                      </div>

                      {event.status === 'rejected' && event.rejection_reason && (
                        <p className="mt-3 text-xs font-inter text-red-400/60 bg-red-500/[0.05] border border-red-500/10 px-3.5 py-2 rounded-lg">
                          Rejection reason: {event.rejection_reason}
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setAttendeesEvent({ id: event.id, title: event.title })}
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/20 transition-all duration-300"
                        title="View attendees"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      {onEditEvent && (
                        <button
                          onClick={() => onEditEvent(event)}
                          className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-accent hover:bg-accent/10 hover:border-accent/20 transition-all duration-300"
                          title="Edit event"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <Link
                        to={`/events/${event.id}`}
                        className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all duration-300"
                        title="View event"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>

                      {event.status !== 'approved' && (
                        <button
                          onClick={() => handleApprove(event.id)}
                          disabled={actionLoading === event.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/15 text-emerald-400 text-xs font-inter font-medium hover:bg-emerald-500/15 hover:border-emerald-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {actionLoading === event.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3" />
                          )}
                          Approve
                        </button>
                      )}

                      {event.status !== 'rejected' && (
                        <button
                          onClick={() => {
                            setRejectingId(isRejecting ? null : event.id);
                            setRejectReason('');
                          }}
                          disabled={actionLoading === event.id}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-500/[0.08] border border-red-500/15 text-red-400 text-xs font-inter font-medium hover:bg-red-500/15 hover:border-red-500/25 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-3 h-3" />
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Rejection reason input */}
                  {isRejecting && (
                    <div className="mt-4 ml-28 flex items-center gap-3">
                      <input
                        type="text"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleReject(event.id);
                        }}
                        placeholder="Reason for rejection..."
                        className="flex-1 bg-white/[0.03] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm font-inter text-white/80 placeholder:text-white/20 outline-none focus:border-red-500/30 focus:bg-white/[0.04] transition-all duration-300"
                        autoFocus
                      />
                      <button
                        onClick={() => handleReject(event.id)}
                        disabled={actionLoading === event.id}
                        className="px-4 py-2.5 rounded-xl bg-red-500/[0.1] border border-red-500/20 text-red-400 text-xs font-inter font-semibold hover:bg-red-500/[0.18] hover:border-red-500/30 transition-all duration-300 disabled:opacity-40"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/35 text-xs font-inter font-medium hover:text-white/55 hover:border-white/10 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {attendeesEvent && (
        <EventAttendeesModal
          eventId={attendeesEvent.id}
          eventTitle={attendeesEvent.title}
          onClose={() => setAttendeesEvent(null)}
        />
      )}
    </div>
  );
}
