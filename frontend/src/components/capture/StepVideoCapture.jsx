import { useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { ArrowLeft, Square, Smartphone, RectangleHorizontal, RotateCcw, Check, SwitchCamera } from 'lucide-react';
import { GradientPill, GhostPill } from '../GsapKit';
import { useVideoRecorder } from '../../hooks/useVideoRecorder';
import { useAlert } from '../../contexts/AlertContext';

// Diminta sebagai batas atas resolusi (bukan rasio!) supaya video tetap
// tajam — pola yang sama dipakai StepCamera.jsx untuk foto. Sengaja TIDAK
// memaksa `aspectRatio` di videoConstraints: kalau dipaksa ke rasio yang
// jauh dari rasio native sensor kamera, browser/driver kamera sering
// meng-crop FOV secara digital ("terasa di-zoom") dan kalau device tidak
// sanggup kasih resolusi tinggi di rasio sempit itu, hasilnya di-upscale
// (pecah/pixelated). Crop ke rasio portrait/landscape yang diinginkan
// dilakukan lewat CSS (aspect-[...] + object-cover) di elemen <video>/
// <Webcam>, bukan diminta ke hardware kamera.
const IDEAL_LONG_EDGE = 1920;

const ORIENTATIONS = [
  { id: 'portrait', label: 'Portrait', icon: Smartphone, className: 'aspect-[3/4]' },
  { id: 'landscape', label: 'Landscape', icon: RectangleHorizontal, className: 'aspect-[16/9]' },
];

export default function StepVideoCapture({ onNext, onBack, pageVariants }) {
  const webcamRef = useRef(null);
  const streamRef = useRef(null);
  const { showAlert } = useAlert();

  const [orientation, setOrientation] = useState('portrait');
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  const {
    isRecording,
    recordingTime,
    maxDuration,
    videoBlob,
    videoUrl,
    startRecording,
    stopRecording,
    clearVideo,
  } = useVideoRecorder(streamRef);

  const handleUserMedia = (stream) => {
    streamRef.current = stream;
    setCameraReady(true);
  };

  const handleReset = () => {
    if (videoUrl) {
      clearVideo();
    }
  };

  // Orientasi cuma boleh diganti sebelum mulai rekam / sebelum ada hasil video
  const orientationLocked = isRecording || !!videoUrl;
  const activeOrientation = ORIENTATIONS.find((o) => o.id === orientation);

  const progress = Math.min((recordingTime / maxDuration) * 100, 100);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  return (
    <motion.div
      key="step-video"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="w-full max-w-xl flex flex-col items-center space-y-4 relative z-10"
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
          Rekam Ucapan
        </h2>
        <button
          onClick={handleReset}
          disabled={!videoUrl}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full border border-maroon/5 shadow-sm hover:bg-gray-50 flex items-center justify-center text-maroon disabled:opacity-30 transition-all z-10"
          aria-label="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center mb-6">
        <p className="text-maroon/60 text-xs px-4">
          Klik tombol rekam untuk mulai mengambil video.
        </p>
      </div>

      {/* Status row: kamera siap + timer */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-cream rounded-xl px-4 py-2.5">
          <span
            className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : cameraReady ? 'bg-green-500' : 'bg-maroon/30'
              }`}
          />
          <span className="text-maroon text-sm font-medium">
            {isRecording ? 'Merekam…' : cameraReady ? 'Kamera siap' : 'Menyiapkan kamera…'}
          </span>
        </div>
        <div className="bg-cream rounded-xl px-4 py-2.5">
          <span className="text-maroon text-sm font-semibold tabular-nums">
            {formatTime(recordingTime)} / {formatTime(maxDuration)}
          </span>
        </div>
      </div>

      {/* Toggle Portrait / Landscape */}
      <div className="w-full flex items-center gap-3">
        {ORIENTATIONS.map((o) => {
          const Icon = o.icon;
          const active = orientation === o.id;
          return (
            <button
              key={o.id}
              type="button"
              disabled={orientationLocked}
              onClick={() => setOrientation(o.id)}
              className={`flex-1 flex items-center justify-between gap-2 rounded-xl px-4 py-3 border-2 transition-colors disabled:opacity-60 ${active ? 'bg-cream border-maroon' : 'bg-cream/60 border-transparent'
                }`}
            >
              <span className="flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-accent/20 text-maroon' : 'text-maroon/40'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-sm font-semibold ${active ? 'text-maroon' : 'text-maroon/50'}`}>
                  {o.label}
                </span>
              </span>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? 'bg-maroon text-cream' : 'border border-maroon/20'
                  }`}
              >
                {active && <Check className="w-3 h-3" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live preview frame */}
      <div
        className={`relative w-full max-w-[420px] ${activeOrientation.className} bg-black rounded-2xl overflow-hidden border-4 border-maroon mx-auto transition-[aspect-ratio] duration-300`}
      >
        {!videoUrl ? (
          <Webcam
            key={`${orientation}-${facingMode}`}
            audio={true}
            ref={webcamRef}
            onUserMedia={handleUserMedia}
            videoConstraints={{
              facingMode,
              width: { ideal: IDEAL_LONG_EDGE },
              height: { ideal: IDEAL_LONG_EDGE },
            }}
            audioConstraints={{
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }}
            mirrored={facingMode === 'user'}
            muted
            className="w-full h-full object-cover"
            onUserMediaError={(err) => {
              console.error('Webcam error:', err);
              showAlert('Tidak dapat mengakses kamera/mikrofon. Pastikan kamu telah memberikan izin pada browser.');
            }}
          />
        ) : (
          <video
            src={videoUrl}
            className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            controls
            autoPlay
            loop
          />
        )}

        {/* Overlay Teks Hiasan */}
        <div className={`absolute left-0 right-0 z-20 flex flex-col items-center justify-center pointer-events-none drop-shadow-lg ${orientation === 'landscape' ? 'bottom-3' : 'bottom-8'}`}>
          <p className={`text-white font-heading font-bold tracking-wide shadow-black/50 ${orientation === 'landscape' ? 'text-xl' : 'text-2xl'}`} style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Randy &amp; Azizah</p>
          <p className={`text-white/90 tracking-widest uppercase mt-1 ${orientation === 'landscape' ? 'text-[0.65rem]' : 'text-xs'}`} style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>1 November 2026</p>
        </div>

        {!videoUrl && (
          <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-cream/90 text-maroon text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Live Preview
          </div>
        )}

        {isRecording && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30 z-30">
            <div
              className="h-full bg-accent transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {!videoUrl ? (
        <div className="relative flex items-center justify-center w-full max-w-[200px]">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="group relative flex items-center justify-center w-20 h-20 bg-accent/20 rounded-full hover:bg-accent/30 transition-colors border-4 border-accent backdrop-blur-sm"
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-accent fill-current" />
            ) : (
              <div className="w-16 h-16 bg-accent rounded-full transition-transform group-hover:scale-90" />
            )}
          </button>
          {!isRecording && (
            <button
              onClick={() => setFacingMode(prev => prev === 'user' ? 'environment' : 'user')}
              className="absolute -right-4 w-12 h-12 bg-white text-maroon rounded-full flex items-center justify-center shadow-md border border-maroon/10 hover:bg-gray-50 transition-colors"
              title="Putar Kamera"
            >
              <SwitchCamera className="w-5 h-5" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2 w-full max-w-[280px] mx-auto items-center">
          <GradientPill onClick={() => onNext(videoBlob, orientation)} className="w-full">
            Gunakan Video Ini
          </GradientPill>
        </div>
      )}
    </motion.div>
  );
}