import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * useFeedEntries — fetch semua entries (foto/video/wishes) sekali saat mount,
 * dipakai bersama oleh Feed, WeddingBook, dan MemoryWall supaya query dan
 * mapping field-nya tidak diduplikasi di tiga tempat.
 */
export function useFeedEntries(mode = 'public') {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        let query = supabase
          .from('entries')
          .select('*')
          .order('timestamp', { ascending: false });

        if (mode === 'public') {
          // Hanya ambil yang is_public true ATAU null (data lama)
          query = query.or('is_public.eq.true,is_public.is.null');
        }

        const { data, error } = await query;

        if (error) throw error;

        const mapped = data.map((item) => ({
          ...item,
          photoUrl: item.photo_url,
          audioUrl: item.audio_url,
          videoUrl: item.video_url,
          // Data lama (sebelum migrasi) tidak punya kolom `type` — anggap 'photo'.
          type: item.type || 'photo',
        }));

        setEntries(mapped);
      } catch (err) {
        console.error('Failed to fetch entries', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  return { entries, loading };
}
