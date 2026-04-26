import { useState, useEffect } from 'react';
import { supabase, type EventRow } from '../lib/supabase';

export interface EventFilters {
  city: string;
  sport: string;
  distanceTags: string[];
  sortBy: 'date' | 'price' | 'popularity';
  priceMin: number;
  priceMax: number;
  month: number | null;
  year: number | null;
}

const DEFAULT_FILTERS: EventFilters = {
  city: '',
  sport: '',
  distanceTags: [],
  sortBy: 'date',
  priceMin: 0,
  priceMax: 10000,
  month: null,
  year: null,
};

export function useEvents(initialFilters?: Partial<EventFilters>) {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<EventFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      setLoading(true);
      setError(null);
      let query = supabase
        .from('events')
        .select('*')
        .eq('status', 'approved')
        .gte('price', filters.priceMin)
        .lte('price', filters.priceMax);

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.sport) {
        query = query.eq('sport', filters.sport);
      }

      if (filters.distanceTags.length > 0) {
        query = query.overlaps('distance_tags', filters.distanceTags);
      }

      if (filters.year !== null) {
        const yearStr = String(filters.year);
        query = query.gte('date', `${yearStr}-01-01`).lte('date', `${yearStr}-12-31`);
      }
      if (filters.month !== null && filters.year !== null) {
        const m = String(filters.month + 1).padStart(2, '0');
        const yearStr = String(filters.year);
        const lastDay = new Date(filters.year, filters.month + 1, 0).getDate();
        query = query.gte('date', `${yearStr}-${m}-01`).lte('date', `${yearStr}-${m}-${String(lastDay).padStart(2, '0')}`);
      }

      if (filters.sortBy === 'date') {
        query = query.order('date', { ascending: true });
      } else if (filters.sortBy === 'price') {
        query = query.order('price', { ascending: true });
      } else {
        query = query.order('interested_count', { ascending: false });
      }

      try {
        const { data, error: queryError } = await query;
        if (!cancelled) {
          if (queryError) {
            setError(queryError.message);
          } else if (data) {
            setEvents(data);
          }
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch events');
          setLoading(false);
        }
      }
    }

    fetchEvents();
    return () => { cancelled = true; };
  }, [filters]);

  return { events, loading, error, filters, setFilters };
}
