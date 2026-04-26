import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useRegistrations() {
  const { user } = useAuth();
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRegisteredIds(new Set());
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);
    supabase
      .from('registrations')
      .select('event_id')
      .eq('user_id', user.id)
      .then(({ data, error: queryError }) => {
        if (!cancelled) {
          if (queryError) {
            setError(queryError.message);
          } else if (data) {
            setRegisteredIds(new Set(data.map((d) => d.event_id)));
          }
          setLoading(false);
        }
      }, (err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch registrations');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [user]);

  const toggleRegistration = useCallback(
    async (eventId: string) => {
      if (!user) return false;

      try {
        if (registeredIds.has(eventId)) {
          const { error } = await supabase
            .from('registrations')
            .delete()
            .eq('user_id', user.id)
            .eq('event_id', eventId);

          if (!error) {
            setRegisteredIds((prev) => {
              const next = new Set(prev);
              next.delete(eventId);
              return next;
            });
          }
          return false;
        } else {
          const { error } = await supabase
            .from('registrations')
            .insert({ user_id: user.id, event_id: eventId });

          if (!error) {
            setRegisteredIds((prev) => new Set(prev).add(eventId));
          }
          return true;
        }
      } catch {
        return registeredIds.has(eventId);
      }
    },
    [user, registeredIds],
  );

  const isRegistered = useCallback(
    (eventId: string) => registeredIds.has(eventId),
    [registeredIds],
  );

  return { registeredIds, loading, error, toggleRegistration, isRegistered };
}
