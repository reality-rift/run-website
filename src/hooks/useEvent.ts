import { useState, useEffect } from 'react';
import { supabase, type EventRow } from '../lib/supabase';

export function useEvent(id: string | undefined) {
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data, error: queryError }) => {
        if (!cancelled) {
          if (queryError) {
            setError(queryError.message);
          } else {
            setEvent(data);
          }
          setLoading(false);
        }
      }, (err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch event');
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [id]);

  return { event, loading, error };
}
