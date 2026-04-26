import { useState, useEffect } from 'react';
import { supabase, type EventRow } from '../lib/supabase';

export function useCalendarEvents(
  year: number,
  month: number,
  city?: string,
  sport?: string,
) {
  const [eventsByDate, setEventsByDate] = useState<Map<string, EventRow[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    let query = supabase
      .from('events')
      .select('*')
      .eq('status', 'approved')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (city) query = query.eq('city', city);
    if (sport) query = query.eq('sport', sport);

    query.then(({ data }) => {
        if (cancelled) return;
        const map = new Map<string, EventRow[]>();
        if (data) {
          for (const event of data) {
            const key = event.date;
            const existing = map.get(key) || [];
            existing.push(event);
            map.set(key, existing);
          }
        }
        setEventsByDate(map);
        setLoading(false);
      }, () => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [year, month, city, sport]);

  return { eventsByDate, loading };
}
