import { useState, useEffect } from 'react';

/**
 * useDeviceOrientation
 * -------------------------------------------------------------
 * Melacak orientasi VIEWPORT (bukan sensor fisik HP secara langsung —
 * tapi untuk kebutuhan layout ini hasilnya sama saja, karena browser
 * mobile otomatis me-resize viewport saat HP diputar).
 *
 * Sengaja pakai matchMedia('(orientation: ...)') alih-alih
 * window.screen.orientation.angle, karena:
 * - Didukung lebih luas (termasuk desktop resize untuk testing)
 * - Tidak perlu izin/API khusus
 * - Otomatis konsisten dengan breakpoint CSS lain
 *
 * Return: 'portrait' | 'landscape'
 */
export function useDeviceOrientation() {
  const getOrientation = () =>
    typeof window !== 'undefined' && window.matchMedia('(orientation: landscape)').matches
      ? 'landscape'
      : 'portrait';

  const [orientation, setOrientation] = useState(getOrientation);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: landscape)');
    const handleChange = (e) => setOrientation(e.matches ? 'landscape' : 'portrait');

    // Safari lama pakai addListener/removeListener, browser modern pakai addEventListener
    if (mql.addEventListener) {
      mql.addEventListener('change', handleChange);
      return () => mql.removeEventListener('change', handleChange);
    } else {
      mql.addListener(handleChange);
      return () => mql.removeListener(handleChange);
    }
  }, []);

  return orientation;
}
