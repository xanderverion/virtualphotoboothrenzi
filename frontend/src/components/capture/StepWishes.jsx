import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { GradientPill, GhostPill } from '../GsapKit';

export default function StepWishes({ message, setMessage, onNext, onBack, pageVariants }) {
  return (
    <motion.div
      key="step-wishes"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="w-full max-w-xl flex flex-col space-y-6 relative z-10"
    >
      <div className="relative w-full text-center mt-2 mb-2 px-12 max-w-[420px] mx-auto">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-maroon bg-white rounded-full shadow-sm hover:bg-gray-50 transition-all border border-maroon/5 z-10"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <p className="text-maroon text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
          Langkah 3
        </p>
        <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
          Tulis Ucapan
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-maroon/60 text-xs px-4">
          Silakan tulis doa dan harapan terbaikmu untuk kedua mempelai.
        </p>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tuliskan doa dan harapan terbaikmu untuk kedua mempelai..."
        maxLength={300}
        rows={8}
        className="w-full max-w-[420px] mx-auto bg-canvas text-maroon rounded-2xl px-6 py-4 border border-accent/30 focus:outline-none focus:border-accent focus:bg-panel transition-all text-base shadow-sm resize-none"
      />
      <p className="text-center text-muted text-xs -mt-4">{message.length}/300</p>

      <div className="flex flex-col gap-2 justify-center w-full max-w-[280px] mx-auto">
        <GradientPill onClick={onNext} disabled={!message.trim()} className="w-full">
          Selanjutnya
        </GradientPill>
        <GhostPill onClick={onBack} className="w-full">
          Kembali
        </GhostPill>
      </div>
    </motion.div>
  );
}
