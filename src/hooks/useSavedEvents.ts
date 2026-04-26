import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for managing a user's shortlisted (saved) events.
 * The hook name is kept as `useSavedEvents` for backwards compatibility,
 * but the feature is user-facing as "Shortlist".
 */
export function useSavedEvents() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    supabase
      .from('saved_events')
      .select('event_id')
      .eq('user_id', user.id)
      .then(({ data, error: queryError }) => {
        if (!cancelled) {
          if (queryError) {
            setError(queryError.message);
          } else if (data) {
            setSavedIds(new Set(data.map((d) => d.event_id)));
          }
          setLoading(false);
        }
      }, (err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch saved events');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [user]);

  const toggleSave = useCallback(
    async (eventId: string) => {
      if (!user) return false;

      try {
        if (savedIds.has(eventId)) {
          const { error } = await supabase
            .from('saved_events')
            .delete()
            .eq('user_id', user.id)
            .eq('event_id', eventId);

          if (!error) {
            setSavedIds((prev) => {
              const next = new Set(prev);
              next.delete(eventId);
              return next;
            });
          }
          return false;
        } else {
          const { error } = await supabase
            .from('saved_events')
            .insert({ user_id: user.id, event_id: eventId });

          if (!error) {
            setSavedIds((prev) => new Set(prev).add(eventId));
          }
          return true;
        }
      } catch {
        return savedIds.has(eventId);
      }
    },
    [user, savedIds],
  );

  const isSaved = useCallback(
    (eventId: string) => savedIds.has(eventId),
    [savedIds],
  );

  return { savedIds, loading, error, toggleSave, isSaved };
}
