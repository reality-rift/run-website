import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Shield,
  LayoutDashboard,
  Users,
  UserPlus,
  CalendarDays,
  Plus,
  Bell,
  Pencil,
} from 'lucide-react';
import type { EventRow } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import AdminStats from './AdminStats';
import CreateOrganizerForm from './CreateOrganizerForm';
import UserTable from './UserTable';
import EventManagement from './EventManagement';
import AdminCreateEvent from './AdminCreateEvent';
import AdminEditEvent from './AdminEditEvent';

type Tab = 'overview' | 'users' | 'events' | 'create-organizer' | 'create-event' | 'edit-event';

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'create-organizer', label: 'Create Organizer', icon: UserPlus },
  { id: 'create-event', label: 'Create Event', icon: Plus },
];

export default function AdminPage() {
  const { user, loading: authLoading, role } = useAuth();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .then(({ count }) => {
        setPendingCount(count ?? 0);
      });
  }, [refreshKey]);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/', { replace: true });
    }
  }, [user, authLoading, role, navigate]);

  if (authLoading || !user || role !== 'admin') {
    return (
      <div className="min-h-screen bg-surface pt-24 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleEditEvent = (event: EventRow) => {
    setEditingEvent(event);
    setActiveTab('edit-event');
  };

  const handleEditSaved = () => {
    setEditingEvent(null);
    setActiveTab('events');
    handleRefresh();
  };

  const handleEditCancel = () => {
    setEditingEvent(null);
    setActiveTab('events');
  };

  return (
    <div className="min-h-screen bg-surface pt-24 pb-24">
      <div className="px-6 md:px-12">
        <div className="max-w-content mx-auto">

          <div className="relative overflow-hidden rounded-3xl mb-10">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-accent/5 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(255,59,16,0.12)_0%,_transparent_60%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
            <div className="relative px-8 py-10 md:px-12 md:py-14">
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h1 className="font-syne font-bold text-3xl md:text-4xl text-[#F5F5F0] tracking-tight">
                    Admin Panel
                  </h1>
                  <p className="font-inter text-sm text-white/40 mt-2 max-w-md leading-relaxed">
                    Manage users, events, organizers, and monitor platform activity.
                  </p>
                </div>
              </div>

              <div className="absolute top-6 right-8">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-white/50 hover:text-accent hover:border-accent/30 transition-all duration-300"
                >
                  <Bell className="w-5 h-5" />
                  {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent text-[10px] font-inter font-bold text-black flex items-center justify-center animate-pulse">
                      {pendingCount}
                    </span>
                  )}
                </button>

                {notifOpen && pendingCount > 0 && (
                  <div className="absolute top-14 right-0 w-80 bg-[#1a1a1a] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50">
                    <div className="px-5 py-4 border-b border-white/[0.06]">
                      <p className="font-syne font-bold text-sm text-[#F5F5F0]">Pending Reviews</p>
                      <p className="font-inter text-[11px] text-white/30 mt-0.5">{pendingCount} event{pendingCount !== 1 ? 's' : ''} awaiting approval</p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setActiveTab('events'); setNotifOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-white/[0.04] transition-colors duration-200"
                      >
                        <CalendarDays className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="block font-inter text-sm text-[#F5F5F0]">Review Events</span>
                          <span className="block font-inter text-[11px] text-white/30">{pendingCount} pending</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-1 mb-10 border-b border-white/[0.06] overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-5 py-3.5 font-inter text-sm whitespace-nowrap transition-all border-b-2 -mb-px ${
                    isActive
                      ? 'border-accent text-accent'
                      : 'border-transparent text-white/35 hover:text-white/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
            {activeTab === 'edit-event' && (
              <div className="flex items-center gap-2.5 px-5 py-3.5 font-inter text-sm whitespace-nowrap border-b-2 -mb-px border-accent text-accent">
                <Pencil className="w-4 h-4" />
                Edit Event
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="animate-fade-in-up space-y-10">
              <AdminStats refreshKey={refreshKey} />
              <EventManagement refreshKey={refreshKey} onEditEvent={handleEditEvent} />
            </div>
          )}

          {activeTab === 'events' && (
            <div className="animate-fade-in-up">
              <EventManagement refreshKey={refreshKey} onEditEvent={handleEditEvent} />
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-fade-in-up">
              <UserTable refreshKey={refreshKey} onRoleChange={handleRefresh} />
            </div>
          )}

          {activeTab === 'create-organizer' && (
            <div className="animate-fade-in-up max-w-lg">
              <CreateOrganizerForm onCreated={handleRefresh} />
            </div>
          )}

          {activeTab === 'create-event' && (
            <div className="animate-fade-in-up">
              <AdminCreateEvent onCreated={handleRefresh} />
            </div>
          )}

          {activeTab === 'edit-event' && editingEvent && (
            <div className="animate-fade-in-up">
              <AdminEditEvent
                event={editingEvent}
                onSaved={handleEditSaved}
                onCancel={handleEditCancel}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
