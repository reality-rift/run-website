import { useEffect, useState } from 'react';
import { X, Loader2, Users, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { escapeCSVField } from '../../lib/validation';

interface Attendee {
  id: string;
  user_id: string;
  created_at: string;
  display_name: string;
  email: string;
}

interface EventAttendeesModalProps {
  eventId: string;
  eventTitle: string;
  onClose: () => void;
}

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

export default function EventAttendeesModal({
  eventId,
  eventTitle,
  onClose,
}: EventAttendeesModalProps) {
  const { toast } = useToast();
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendees = async () => {
      const { data: regs } = await supabase
        .from('registrations')
        .select('id, user_id, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (!regs || regs.length === 0) {
        setAttendees([]);
        setLoading(false);
        return;
      }

      const userIds = regs.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      const profileMap = new Map<string, string>();
      profiles?.forEach((p) => {
        profileMap.set(p.id, p.display_name || 'Unknown User');
      });

      setAttendees(
        regs.map((r) => ({
          id: r.id,
          user_id: r.user_id,
          created_at: r.created_at,
          display_name: profileMap.get(r.user_id) || 'Unknown User',
          email: '',
        })),
      );
      setLoading(false);
    };
    fetchAttendees();
  }, [eventId]);

  const exportCsv = () => {
    const rows = [
      ['Name', 'User ID', 'Registered Date'],
      ...attendees.map((a) => [
        escapeCSVField(a.display_name),
        escapeCSVField(a.user_id),
        escapeCSVField(new Date(a.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendees-${eventTitle.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-card border border-white/10 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden max-h-[80vh] flex flex-col">
        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-syne font-bold text-lg text-[#F5F5F0]">Registered Attendees</h3>
            <p className="font-inter text-xs text-white/30 mt-0.5 truncate max-w-[300px]">{eventTitle}</p>
          </div>
          <div className="flex items-center gap-2">
            {attendees.length > 0 && (
              <button
                onClick={exportCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs font-inter font-semibold hover:bg-accent/15 transition-all"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/40 hover:text-white/70 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white/15" />
              </div>
              <p className="font-inter text-sm text-white/30">No registrations yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {attendees.map((attendee, idx) => {
                const gradient = getAvatarColor(attendee.user_id);
                const initial = attendee.display_name.charAt(0).toUpperCase();
                return (
                  <div key={attendee.id} className="flex items-center gap-3.5 px-6 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <span className="font-inter text-xs text-white/20 w-6 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                      <span className="font-syne font-bold text-xs text-white">{initial}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-inter text-sm text-[#F5F5F0] truncate">{attendee.display_name}</p>
                      <p className="font-mono text-[10px] text-white/20 truncate">{attendee.user_id.slice(0, 20)}...</p>
                    </div>
                    <span className="font-inter text-[10px] text-white/25 shrink-0">
                      {new Date(attendee.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!loading && attendees.length > 0 && (
          <div className="px-6 py-3 border-t border-white/[0.06] shrink-0">
            <p className="font-inter text-xs text-white/25">
              {attendees.length} total registration{attendees.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
