import { useEffect, useState } from 'react';
import { Search, Download, Mail, Loader2, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/Toast';
import { escapeCSVField } from '../../lib/validation';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

export default function NewsletterManagement({ refreshKey }: { refreshKey: number }) {
  const { toast } = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, [refreshKey]);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    setSubscribers(data ?? []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase
      .from('newsletter_subscribers')
      .delete()
      .eq('id', id);

    if (error) {
      toast(error.message);
    } else {
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast('Subscriber removed');
    }
    setDeletingId(null);
    setConfirmDelete(null);
  };

  const exportCsv = () => {
    const rows = [
      ['Email', 'Subscribed Date'],
      ...filtered.map((s) => [
        escapeCSVField(s.email),
        escapeCSVField(new Date(s.created_at).toLocaleDateString('en-US', {
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
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('CSV exported');
  };

  const filtered = subscribers.filter((s) => {
    if (!search) return true;
    return s.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-x-auto">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-syne font-bold text-xl text-[#F5F5F0]">Newsletter Subscribers</h2>
            <p className="font-inter text-xs text-white/30 mt-1">
              {loading ? 'Loading...' : `${filtered.length} subscriber${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email..."
                className="w-full sm:w-56 bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm font-inter text-white/80 placeholder:text-white/25 outline-none focus:border-accent/30 transition-colors"
              />
            </div>
            <button
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-inter font-semibold hover:bg-accent/15 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-[2fr_1fr_80px] gap-4 px-6 py-3 border-b border-white/[0.04]">
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25">Email</span>
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25">Subscribed</span>
        <span className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/25 text-right">Actions</span>
      </div>

      {loading ? (
        <div className="divide-y divide-white/[0.04]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="px-6 py-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-white/[0.04] rounded animate-pulse" />
                  <div className="h-3 w-24 bg-white/[0.03] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6 text-white/15" />
          </div>
          <p className="font-inter text-sm text-white/30">No subscribers yet</p>
          <p className="font-inter text-xs text-white/20 mt-1">Subscribers will appear here when users sign up for the newsletter</p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              className="sm:grid sm:grid-cols-[2fr_1fr_80px] sm:gap-4 sm:items-center px-6 py-4 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-accent/60" />
                </div>
                <span className="font-inter text-sm text-[#F5F5F0] truncate">
                  {sub.email}
                </span>
              </div>

              <span className="hidden sm:block font-inter text-xs text-white/30">
                {new Date(sub.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>

              <div className="hidden sm:flex justify-end">
                {confirmDelete === sub.id ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      disabled={deletingId === sub.id}
                      className="px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/20 text-red-400 text-[10px] font-inter font-semibold hover:bg-red-500/20 transition-all disabled:opacity-50"
                    >
                      {deletingId === sub.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Confirm'
                      )}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 text-[10px] font-inter hover:text-white/60 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(sub.id)}
                    className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filtered.length > 20 && (
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-white/20" />
          <p className="font-inter text-xs text-white/25">
            Showing all {filtered.length} subscribers. Use search to narrow down.
          </p>
        </div>
      )}
    </div>
  );
}
