import { useState } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, SwitchCamera } from 'lucide-react';
import { FRAMES } from '../../constants/frames';
import { useAlert } from '../../contexts/AlertContext';
import { getPrimaryRectAspect } from '../../utils/frameAspect';
import StepPhotoPreview from './StepPhotoPreview';
import StepPrinting from './StepPrinting';

// Fallback kalau frame tidak punya photoStyle/photoBoxes yang valid
// (seharusnya tidak pernah kejadian dengan data frames.js saat ini).
const FALLBACK_ASPECT = 616 / 573;

// Diminta sebagai batas atas resolusi (bukan rasio!) supaya foto tetap
// tajam. Sengaja TIDAK memaksa `aspectRatio` di videoConstraints — kalau
// dipaksa ke rasio yang jauh dari rasio native sensor kamera, browser/driver
// kamera sering meng-crop FOV secara digital ("terasa di-zoom") dan kalau
// device tidak sanggup kasih resolusi tinggi di rasio sempit itu, hasilnya
// di-upscale (pecah/pixelated). Dengan cuma minta width/height ideal tanpa
// rasio, kamera bebas pakai FOV & resolusi native terbaiknya.
//
// PENTING: width dan height TIDAK BOLEH diminta dengan nilai ideal yang
// sama (mis. 1920x1920). Sensor kamera HP hampir tidak pernah persegi
// (umumnya 4:3 atau 16:9), jadi constraint "ideal" yang sama-sama tinggi
// di kedua sumbu justru saling kontradiktif untuk algoritma pemilihan
// resolusi di browser mobile (khususnya Chrome/Safari) — pada beberapa
// device ini terobservasi membuat browser "menyerah" dan memilih mode
// resolusi rendah, bukan mode resolusi tertinggi yang sebenarnya didukung
// sensor. Solusinya: beri ideal 4:3 (rasio sensor HP yang paling umum)
// supaya constraint tidak saling tarik, sambil tetap tidak memaksa
// `aspectRatio` (jadi browser masih bebas pilih FOV/rasio native lain
// kalau device tsb memang bukan 4:3).
const IDEAL_LONG_EDGE = 1920;
const IDEAL_SHORT_EDGE = 1440; // 4:3 terhadap IDEAL_LONG_EDGE

export default function StepCamera({
  frameIndex,
  webcamRef,
  photoSrc,
  capturedPhotos,
  showConfirmDialog,
  flashKey,
  captureToast,
  isDeveloping,
  handleCapture,
  proceedToConfirm,
  retakePhoto,
  confirmPhoto,
  onBack,
  pageVariants
}) {
  const { showAlert } = useAlert();

  // Kamera depan/belakang untuk shot BERIKUTNYA. Sengaja tidak dikunci
  // setelah foto pertama diambil (beda dari orientasi video) — untuk frame
  // Double/Triple, user boleh bebas gonta-ganti kamera antar-jepretan (mis.
  // foto 1 pakai kamera depan, foto 2 pakai kamera belakang). Info kamera
  // yang dipakai dicatat PER FOTO oleh handleCapture (lihat usePhotoCapture.js),
  // jadi tiap foto tetap ter-flip dengan benar sesuai kameranya sendiri
  // saat proses composite, terlepas dari kamera mana yang aktif sekarang.
  const [facingMode, setFacingMode] = useState('user');
  const isMirrored = facingMode === 'user';

  const currentFrame = FRAMES[frameIndex];
  const maxPhotos = currentFrame.maxPhotos;
  const allPhotosCaptured = capturedPhotos.length >= maxPhotos;

  // Rasio crop SEBENARNYA yang dipakai saat compositing (photoBoxes untuk
  // multi-foto, photoStyle untuk single) — sekarang dipakai LANGSUNG sebagai
  // aspect-ratio container live preview juga (bukan cuma untuk thumbnail).
  // Karena CSS object-cover di sini dan drawPhoto() di imageComposite.js
  // sama-sama center-crop ke rasio yang identik, apa yang user lihat di
  // live preview otomatis = apa yang muncul di hasil akhir — tidak perlu
  // lagi garis panduan/overlay hitam sama sekali.
  const rectAspect = getPrimaryRectAspect(currentFrame) || FALLBACK_ASPECT;

  // Animasi printer / hasil cetak
  if (showConfirmDialog) {
    return (
      <StepPrinting
        photoSrc={photoSrc}
        frame={currentFrame}
        isDeveloping={isDeveloping}
        confirmPhoto={confirmPhoto}
        retakePhoto={retakePhoto}
        pageVariants={pageVariants}
      />
    );
  }

  // Semua foto sudah diambil, belum masuk animasi printer -> halaman preview penuh
  if (allPhotosCaptured) {
    return (
      <StepPhotoPreview
        photoSrc={photoSrc}
        capturedPhotos={capturedPhotos}
        frameIndex={frameIndex}
        proceedToConfirm={proceedToConfirm}
        retakePhoto={retakePhoto}
        pageVariants={pageVariants}
      />
    );
  }

  // Sedang mengambil foto (belum lengkap)
  return (
    <motion.div
      key="step2"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="w-full max-w-xl flex flex-col items-center space-y-6 relative z-10"
    >
      {/* Header Container */}
      <div className="relative w-full text-center mt-2 mb-2 px-12">
        {onBack && (
          <button
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-maroon bg-white rounded-full shadow-sm border border-maroon/5 hover:bg-gray-50 transition-colors z-10"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <p className="text-maroon text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
          Langkah 3
        </p>
        <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
          Abadikan Momenmu
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-maroon/60 text-xs px-4">
          Klik tombol di bawah ini untuk mengambil foto.
        </p>
      </div>



      <div className="flex flex-col items-center w-full">
        {maxPhotos > 1 && (
          <div className="mb-4 text-accent font-semibold text-xs bg-panel px-4 py-2 rounded-full border border-accent/30">
            {`Foto ${capturedPhotos.length + 1} dari ${maxPhotos}`}
          </div>
        )}
        <div
          className="relative w-full max-w-[616px] bg-black rounded-lg overflow-hidden border border-accent/30 mx-auto"
          style={{ aspectRatio: rectAspect }}
        >
          <Webcam
            key={facingMode}
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            // PENTING: tanpa ini, react-webcam getScreenshot() default mengambil
            // ukuran canvas dari `video.clientWidth` (ukuran RENDER CSS di layar),
            // BUKAN dari resolusi asli stream kamera (video.videoWidth/videoHeight).
            // Container preview di sini dibatasi max-w-[616px], dan di HP (viewport
            // sempit) clientWidth video bisa cuma ~360-400px — jauh di bawah 1920px
            // yang diminta lewat videoConstraints di bawah. Akibatnya hasil JEPRETAN
            // (bukan live preview, yang selalu render stream mentah) di-downsample
            // ke resolusi kecil itu dan terlihat pecah/blur, sekalipun kamera device
            // sebenarnya mampu kasih resolusi tinggi. forceScreenshotSourceSize
            // memaksa getScreenshot() memakai videoWidth/videoHeight asli kamera.
            forceScreenshotSourceSize
            videoConstraints={{
              facingMode,
              width: { ideal: IDEAL_LONG_EDGE },
              height: { ideal: IDEAL_SHORT_EDGE },
            }}
            className={`w-full h-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
            onUserMediaError={(err) => {
              console.error("Webcam error:", err);
              showAlert("Tidak dapat mengakses kamera. Pastikan kamu telah memberikan izin kamera pada browser.");
            }}
          />

          {/* Shutter flash effect */}
          <motion.div
            key={flashKey}
            initial={{ opacity: flashKey === 0 ? 0 : 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="absolute inset-0 bg-white z-30 pointer-events-none"
          />

          {/* Capture success toast */}
          <AnimatePresence>
            {captureToast && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="absolute top-3 left-1/2 -translate-x-1/2 z-40 bg-accent text-canvas text-xs md:text-sm font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 whitespace-nowrap"
              >
                <Check className="w-4 h-4" />
                {captureToast}
              </motion.div>
            )}
          </AnimatePresence>


        </div>

        {/* Thumbnail preview — muncul untuk frame 1 foto maupun banyak foto.
            Bentuknya (aspect ratio) disamakan dengan crop asli photoBoxes/
            photoStyle, bukan kotak persegi generik, supaya user melihat
            preview sedekat mungkin dengan hasil cetak yang sebenarnya. */}
        {capturedPhotos.length > 0 && (
          <div className="flex items-center justify-center gap-3 mt-4 w-full max-w-[616px] mx-auto flex-wrap">
            {capturedPhotos.map((photo, i) => (
              <div
                key={i}
                className="h-14 rounded-lg overflow-hidden border-2 border-accent/50 bg-black shrink-0"
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
        )}
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[200px]">
        <button
          onClick={() => handleCapture(frameIndex, isMirrored)}
          className="group relative flex items-center justify-center w-20 h-20 bg-accent/20 rounded-full hover:bg-accent/30 transition-colors border-4 border-accent backdrop-blur-sm"
        >
          <div className="w-16 h-16 bg-accent rounded-full transition-transform group-hover:scale-90"></div>
        </button>
        <button
          onClick={() => setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))}
          className="absolute -right-4 w-12 h-12 bg-white text-maroon rounded-full flex items-center justify-center shadow-md border border-maroon/10 hover:bg-gray-50 transition-colors"
          title="Ganti Kamera"
        >
          <SwitchCamera className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}