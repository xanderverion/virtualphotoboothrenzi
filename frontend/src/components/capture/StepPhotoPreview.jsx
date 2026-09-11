import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { GradientPill, GhostPill } from '../GsapKit';
import { FRAMES } from '../../constants/frames';
import { getPrimaryRectAspect } from '../../utils/frameAspect';

/**
 * StepPhotoPreview
 * -------------------------------------------------------------
 * Halaman penuh yang muncul setelah semua foto selesai diambil
 * (allPhotosCaptured === true) dan SEBELUM animasi printer
 * (showConfirmDialog). Menggantikan tombol inline "Gunakan Foto
 * Ini / Ambil Ulang" yang sebelumnya nempel di bawah webcam.
 *
 * Tidak menyentuh logic usePhotoCapture sama sekali — cuma
 * memakai ulang handler yang sudah ada (proceedToConfirm, retakePhoto).
 *
 * v3 fix: box preview sekarang memakai rectAspect ASLI dari
 * photoBoxes/photoStyle frame yang aktif (via getPrimaryRectAspect),
 * bukan rasio 616/573 generik. Untuk frame double/triple, rectAspect
 * ini adalah rasio landscape strip yang sesungguhnya akan muncul di
 * hasil cetak (dihitung dengan rumus yang sama persis dipakai
 * drawPhoto() di imageComposite.js) — jadi apa yang dilihat user di
 * sini benar-benar mencerminkan foto yang sudah "terpotong", bukan
 * foto mentah utuh di kotak persegi.
 */
export default function StepPhotoPreview({
  photoSrc,
  capturedPhotos,
  frameIndex,
  proceedToConfirm,
  retakePhoto,
  pageVariants,
}) {
  const isGrid = capturedPhotos.length > 1;
  const rectAspect = getPrimaryRectAspect(FRAMES[frameIndex]) || 616 / 573;

  return (
    <motion.div
      key="step-photo-preview"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="w-full max-w-md flex flex-col items-center space-y-6 relative z-10"
    >
      {/* Header Container */}
      <div className="relative w-full text-center mt-2 mb-2 px-12">
        <button
          onClick={retakePhoto}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-maroon bg-white rounded-full shadow-sm hover:bg-gray-50 transition-all border border-maroon/5 z-10"
          aria-label="Ambil ulang"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-maroon text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
          Your Captured Moment
        </p>
        <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
          Preview Foto
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-maroon/60 text-xs px-4">
          Pastikan hasilnya sudah sesuai sebelum melanjutkan.
        </p>
      </div>

      {/* Photo(s) — aspect ratio & crop disamakan dengan bentuk potongan
          ASLI di frame cetak (photoBoxes/photoStyle), bukan rasio capture
          mentah 616/573, supaya preview ini benar-benar mencerminkan hasil
          akhir yang akan dicetak. */}
      {isGrid ? (
        <div className="w-full grid grid-cols-1 gap-3">
          {capturedPhotos.map((photo, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border border-accent/20 bg-black"
              style={{ aspectRatio: rectAspect }}
            >
              <img
                src={photo.src}
                alt={`Foto ${i + 1}`}
                className={`w-full h-full object-cover ${photo.mirror ? 'scale-x-[-1]' : ''}`}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          className="w-full max-w-[420px] rounded-xl overflow-hidden border border-accent/20 bg-black mx-auto"
          style={{ aspectRatio: rectAspect }}
        >
          <img
            src={photoSrc || capturedPhotos[0].src}
            alt="Preview"
            className={`w-full h-full object-cover ${!photoSrc && capturedPhotos[0].mirror ? 'scale-x-[-1]' : ''}`}
          />
        </div>
      )}

      <div className="flex flex-col gap-2 w-full max-w-[280px] mx-auto items-center">
        <GradientPill onClick={() => proceedToConfirm(frameIndex)} className="w-full">
          Gunakan Foto Ini
        </GradientPill>
        <GhostPill onClick={retakePhoto} className="w-full">
          Ambil Ulang
        </GhostPill>
      </div>
    </motion.div>
  );
}