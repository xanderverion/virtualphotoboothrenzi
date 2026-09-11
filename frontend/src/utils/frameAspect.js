// "2 / 3" -> 0.6667, "2 / 6" -> 0.3333
export const parseAspectRatio = (str) => {
  if (!str) return null;
  const [w, h] = str.split('/').map((n) => parseFloat(n.trim()));
  if (!w || !h) return null;
  return w / h;
};

// Hitung rasio lebar:tinggi SEBENARNYA dari sebuah slot foto (photoStyle
// atau salah satu elemen photoBoxes), berdasarkan persentasenya terhadap
// frame + rasio fisik frame itu sendiri (frame.aspectRatio, mis. "2 / 3").
//
// box.width/box.height dinyatakan sebagai PERSENTASE dari lebar/tinggi
// frame masing-masing (bukan dari sisi yang sama), jadi rasio piksel
// sebenarnya baru didapat setelah dikalikan rasio asli frame — inilah
// rumus yang sama persis dipakai drawPhoto() di imageComposite.js untuk
// menentukan crop, jadi rectAspect ini akurat mencerminkan hasil akhir.
export const getRectAspect = (frame, box) => {
  if (!box) return null;
  const frameAspect = parseAspectRatio(frame.aspectRatio);
  const boxW = parseFloat(box.width);
  const boxH = parseFloat(box.height);
  if (!frameAspect || !boxW || !boxH) return null;
  return (boxW / boxH) * frameAspect;
};

// Ambil rectAspect "utama" sebuah frame — otomatis pilih sumbernya:
// - frame.photoStyle untuk frame single foto (maxPhotos === 1)
// - photoBoxes[0] untuk frame multi-foto (semua box dalam satu frame
//   diasumsikan punya aspect yang sama, sesuai desain frames.js saat ini)
export const getPrimaryRectAspect = (frame) => {
  if (!frame) return null;
  if (frame.maxPhotos === 1 && frame.photoStyle) {
    return getRectAspect(frame, frame.photoStyle);
  }
  if (frame.photoBoxes && frame.photoBoxes.length > 0) {
    return getRectAspect(frame, frame.photoBoxes[0]);
  }
  return null;
};
