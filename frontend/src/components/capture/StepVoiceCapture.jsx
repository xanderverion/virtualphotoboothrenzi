import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';

/**
 * StepVoiceCapture
 * -------------------------------------------------------------
 * Step 2 khusus contentType === 'voice'. Beda dari StepAudioCaption
 * (yang audionya opsional, pelengkap foto/video), di sini rekaman
 * suara WAJIB ada karena dia sendiri adalah kontennya.
 *
 * Props yang dipakai dari state yang sudah ada di Capture.jsx
 * (hasil useAudioRecorder — tidak perlu hook baru):
 *   audioBlob, isRecording, recordingTime,
 *   startRecording, stopRecording, clearAudio
 *
 * Plus caption teks opsional (state `caption` yang sudah ada).
 */

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

export default function StepVoiceCapture({
  audioBlob,
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  clearAudio,
  caption,
  setCaption,
  onNext,
  onBack,
  pageVariants,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [audioBlob]);

  const handleNext = () => {
    if (!audioBlob) {
      setError('Rekam pesan suaramu dulu, ya.');
      return;
    }
    setError('');
    onNext();
  };

  const handleRetake = () => {
    clearAudio();
    setError('');
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.35 }}
      className="w-full max-w-sm mx-auto flex flex-col items-center"
    >
      <p className="text-maroon text-sm font-semibold tracking-[0.2em] uppercase mb-1">
        Voice Note
      </p>
      <h2 className="text-maroon text-2xl font-couple text-center mb-8">
        Rekam pesan suaramu
      </h2>

      {/* Panggung rekaman */}
      <div className="w-full bg-cream rounded-2xl p-8 flex flex-col items-center">
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {isRecording && (
            <motion.span
              className="absolute inset-0 rounded-full bg-accent/30"
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!!audioBlob}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
              isRecording
                ? 'bg-maroon text-cream'
                : audioBlob
                ? 'bg-maroon/20 text-maroon/40'
                : 'bg-maroon text-cream hover:bg-maroon/90'
            }`}
          >
            {isRecording ? <Square className="w-7 h-7 fill-current" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        <p className="text-maroon font-heading font-bold text-lg tabular-nums">
          {formatTime(recordingTime || 0)}
        </p>
        <p className="text-maroon/50 text-xs mt-1">
          {audioBlob
            ? 'Rekaman selesai — putar untuk cek dulu'
            : isRecording
            ? 'Sedang merekam… ketuk kotak untuk berhenti'
            : 'Ketuk mikrofon untuk mulai merekam'}
        </p>

        {previewUrl && (
          <div className="w-full mt-6 flex items-center gap-3">
            <audio ref={audioRef} src={previewUrl} controls className="w-full h-9" />
            <button
              type="button"
              onClick={handleRetake}
              className="shrink-0 w-9 h-9 rounded-full border border-maroon/20 flex items-center justify-center text-maroon"
              aria-label="Rekam ulang"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Caption opsional */}
      <textarea
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Tambahkan keterangan singkat (opsional)"
        rows={2}
        className="w-full mt-4 bg-panel rounded-xl p-3 text-sm text-maroon placeholder:text-maroon/40 focus:outline-none focus:ring-2 focus:ring-accent resize-none"
      />

      {error && <p className="text-red-600 text-xs mt-2">{error}</p>}

      {/* Navigasi */}
      <div className="w-full flex items-center gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="w-11 h-11 rounded-full border border-maroon/20 flex items-center justify-center text-maroon shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 h-11 rounded-full bg-maroon text-cream font-semibold text-sm flex items-center justify-center gap-2"
        >
          Lanjut <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
