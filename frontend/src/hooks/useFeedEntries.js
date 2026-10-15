import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * useFeedEntries — fetch semua entries (foto/video/wishes) sekali saat mount,
 * dipakai bersama oleh Feed, WeddingBook, dan MemoryWall supaya query dan
 * mapping field-nya tidak diduplikasi di tiga tempat.
 */
export function useFeedEntries(mode = 'public') {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchEntries = async () => {
      try {
        const res = await axios.get(`${API_URL}/event-services/v1/entries`, {
          params: { mode },
        });

        // Sesuaikan path ini dengan bentuk response handleResponse lu
        const body = res.data;
        const list = body?.data ?? body?.response?.data ?? [];

        const mapped = list.map((item) => ({
          ...item,
          photoUrl: item.photo_url,
          audioUrl: item.audio_url,
          videoUrl: item.video_url,
          // Data lama (sebelum migrasi) tidak punya kolom `type`, anggap 'photo'.
          type: item.type || 'photo',
        }));

        if (!cancelled) setEntries(mapped);
      } catch (err) {
        console.error('Failed to fetch entries', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEntries();

    return () => {
      cancelled = true;
    };
  }, [mode]);

  return { entries, loading };
}