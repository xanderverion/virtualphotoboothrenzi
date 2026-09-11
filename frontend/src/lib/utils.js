// Ringan, tanpa dependency clsx/tailwind-merge — cukup gabungkan class truthy.
// Kalau nanti butuh merge Tailwind class yang konflik (mis. p-2 vs p-4),
// install clsx + tailwind-merge dan ganti isi fungsi ini.
export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}
