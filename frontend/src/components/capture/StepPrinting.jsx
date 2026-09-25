import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GhostPill } from '../GsapKit';
import { parseAspectRatio } from '../../utils/frameAspect';

// Fallback dipakai hanya kalau frame tidak tersedia / aspectRatio-nya
// tidak valid — seharusnya tidak pernah kejadian di kondisi normal.
const FALLBACK_PRINT_ASPECT = 2 / 3;

/**
 * StepPrinting
 * -------------------------------------------------------------
 * v2 fixes:
 * 1. Foto ditampilkan apa adanya (border/frame dekoratif sudah
 *    baked-in di photoSrc lewat FRAMES) — tidak ada lagi border
 *    putih/merah tambahan yang dulu dipasang di sini.
 * 2. Foto sekarang diklip oleh container yang nempel langsung di
 *    slot printer (overflow-hidden + margin negatif ke atas),
 *    jadi animasinya benar-benar terlihat "keluar dari dalam
 *    printer", bukan meluncur dari luar/atas layar seperti
 *    sebelumnya (itu terjadi karena container pembungkusnya
 *    kepasang overflow-visible).
 */
export default function StepPrinting({
  photoSrc,
  frame,
  isDeveloping,
  confirmPhoto,
  retakePhoto,
  pageVariants,
}) {
  // photoSrc adalah gambar frame UTUH hasil composite (bukan cuma satu foto),
  // jadi rasio container-nya harus mengikuti rasio FISIK frame itu sendiri
  // (frame.aspectRatio, mis. "2 / 3" untuk Classic/Double, "2 / 6" untuk
  // Triple yang berbentuk strip panjang) — bukan rasio tetap seperti sebelumnya.
  // Sebelumnya container dipaksa ke aspect-[3/4] untuk semua frame, sehingga
  // object-cover memotong bagian atas/bawah gambar — nyaris tak terlihat di
  // Classic (rasionya dekat dengan 3/4), tapi terlihat jelas terpotong di
  // Double dan sangat parah di Triple (rasio 2/6 jauh dari 3/4).
  const printAspect = parseAspectRatio(frame?.aspectRatio) || FALLBACK_PRINT_ASPECT;

  // Menandai kapan animasi slide-masuk (di bawah) benar-benar SELESAI di
  // render/mount ini. Sengaja pakai state lokal (bukan cuma cek isDeveloping)
  // supaya efek "lepas/miring" tidak bisa langsung aktif begitu screen ini
  // mount ulang — misalnya saat user menekan tombol back dari halaman
  // "Ready to Publish", di mana isDeveloping sudah bernilai false sejak
  // awal (proses cetak memang sudah selesai sebelumnya). Reset ke false
  // otomatis setiap kali komponen ini mount dari nol.
  const [slideComplete, setSlideComplete] = useState(false);
  const settled = slideComplete && !isDeveloping;
  return (
    <motion.div
      key="step-printing"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="w-full max-w-sm flex flex-col items-center relative z-10"
    >
      {/* Header Container */}
      <div className="relative w-full text-center mt-2 mb-2 px-12">
        <button
          onClick={retakePhoto}
          disabled={isDeveloping}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-maroon bg-white rounded-full shadow-sm hover:bg-gray-50 transition-all border border-maroon/5 z-10 disabled:opacity-40"
          aria-label="Ambil ulang"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-maroon text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
          Langkah 4
        </p>
        <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
          Mencetak Momenmu
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-maroon/60 text-xs px-4">
          Hasil sedang disiapkan sebelum kamu memilih siapa yang dapat melihatnya.
        </p>
      </div>

      {/* Printer + foto yang keluar & lepas dari mesin (ada jarak, bukan nempel) */}
      <div className="relative w-full max-w-[240px] flex flex-col items-center">
        {/* Printer device */}
        <div className="relative z-20 w-full rounded-2xl bg-gradient-to-b from-maroon to-[#2a0810] shadow-xl px-5 pt-4 pb-5">
          <div className="w-full flex items-center justify-between mb-5">
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cream/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-cream/40" />
              <span className="w-1.5 h-1.5 rounded-full bg-cream/40" />
            </div>
            <span
              className={`w-2 h-2 rounded-full bg-emerald-400 ${isDeveloping ? 'animate-pulse' : ''}`}
            />
          </div>
          {/* Slot kertas */}
          <div className="w-[85%] h-2.5 mx-auto bg-black/60 rounded-full shadow-inner" />
        </div>

        {/* Foto hasil cetak: lebih kecil dari printer & terlihat sudah lepas (ada jarak di bawah slot),
            tanpa frame putih maupun teks caption — foto tampil apa adanya (border dekoratif sudah baked-in).
            Wrapper ini "diam" di posisi akhir (mt-4 = jarak final ke printer); yang bergerak adalah
            motion.div di dalamnya, dari tersembunyi di belakang body printer (z-index lebih rendah)
            meluncur turun ke posisi ini — jadi kelihatan benar-benar keluar dari mesin, bukan cuma
            muncul di tempat. */}
        <div className="relative z-10 w-[72%] mt-4">
          {photoSrc && (
            <motion.div
              className="relative"
              initial={{ y: -110 }}
              animate={{ y: 0 }}
              transition={{ duration: 2.6, ease: 'easeOut' }}
              onAnimationComplete={() => setSlideComplete(true)}
            >
              {/* Efek "lepas/terlempar": baru aktif kalau `settled` true, yaitu
                  setelah slide-masuk selesai DAN proses cetak (isDeveloping)
                  juga sudah selesai — bukan cuma mengandalkan isDeveloping saja,
                  supaya tidak langsung miring begitu screen ini mount ulang
                  (mis. dari tombol back). Transisi spring — bukan keyframe kaku —
                  supaya ada pantulan halus yang natural saat "jatuh terlempar"
                  lalu landing miring di posisi akhir. */}
              <motion.div
                className="relative"
                initial={{ y: 0, x: 0, rotate: 0 }}
                animate={
                  settled
                    ? { y: 10, x: -5, rotate: -1 }
                    : { y: 0, x: 0, rotate: 0 }
                }
                transition={
                  settled
                    ? { type: 'spring', stiffness: 190, damping: 13, mass: 0.7 }
                    : { duration: 0 }
                }
              >
                {/* Bayangan halus di bawah kartu — dianimasikan ikut menguat seiring
                    foto keluar dari printer, supaya kesan kartu terangkat dari
                    permukaan terasa nyata (bukan bayangan statis). */}
                <motion.div
                  className="relative w-full overflow-hidden rounded-md"
                  style={{ aspectRatio: printAspect }}
                  initial={{ boxShadow: '0 2px 4px -2px rgba(0,0,0,0.25)' }}
                  animate={{ boxShadow: '0 18px 28px -8px rgba(0,0,0,0.55)' }}
                  transition={{ duration: 2.6, ease: 'easeOut' }}
                >
                  <motion.img
                    src={photoSrc}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain"
                    initial={{ filter: 'contrast(0.6) brightness(1.4) saturate(0.4)' }}
                    animate={{
                      filter: isDeveloping
                        ? 'contrast(0.6) brightness(1.4) saturate(0.4)'
                        : 'contrast(1) brightness(1) saturate(1)',
                    }}
                    transition={{ duration: 2.4, delay: 0.3, ease: 'easeOut' }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Status + CTA */}
      <div className="w-full max-w-[280px] mt-8">
        {isDeveloping ? (
          <div className="w-full bg-cream rounded-2xl p-3 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-center gap-1.5 text-maroon/60 text-xs mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Printer sedang menarik kertas…
            </div>
            <div className="w-full h-12 rounded-full bg-accent/80 text-cream font-bold text-sm flex items-center justify-center">
              Sedang mencetak…
            </div>
          </div>
        ) : (
          <div className="w-full bg-cream rounded-2xl p-3 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-center gap-1.5 text-maroon/60 text-xs mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Hasil sudah siap
            </div>
            <button
              onClick={confirmPhoto}
              className="w-full h-12 rounded-full bg-maroon text-cream font-bold text-sm flex items-center justify-center gap-2 hover:bg-maroon/90 transition-colors"
            >
              Gunakan Foto Ini <ArrowRight className="w-4 h-4" />
            </button>
            <GhostPill onClick={retakePhoto} className="w-full mt-2 h-12">
              Foto Ulang
            </GhostPill>
          </div>
        )}
      </div>
    </motion.div>
  );
}