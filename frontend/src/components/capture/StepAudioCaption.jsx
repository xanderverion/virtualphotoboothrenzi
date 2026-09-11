import { motion } from 'framer-motion';
import { Mic, Square, RefreshCw } from 'lucide-react';
import { GradientPill, GhostPill } from '../GsapKit';
import CustomAudioPlayer from './CustomAudioPlayer';

export default function StepAudioCaption({
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
  pageVariants
}) {
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <motion.div
      key="step3"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="w-full max-w-xl flex flex-col space-y-6 relative z-10"
    >
      <div className="relative w-full max-w-[616px] flex flex-col mx-auto px-4 md:px-8">
        {/* Audio UI */}
        <div className="flex-1 flex flex-col items-center justify-center py-10 md:py-16">
          <div className="flex flex-col items-center justify-center w-full space-y-10">
            {!audioBlob ? (
              <div className="flex flex-col items-center space-y-10">
                <h3 className="text-xl md:text-2xl font-semibold text-maroon tracking-tight text-center max-w-sm px-4 font-heading">Tinggalkan pesan dan kesan kepada kami</h3>

                {/* Waveform Animation */}
                <div className="flex items-center justify-center gap-1.5 md:gap-2 h-16 my-4">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 md:w-2 bg-accent rounded-full"
                      initial={{ height: "20%" }}
                      animate={{
                        height: isRecording ? ["20%", "100%", "20%"] : "20%",
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.05,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>

                {!isRecording ? (
                  <button onClick={startRecording} className="w-20 h-20 border border-maroon rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                    <Mic className="w-8 h-8 text-maroon" />
                  </button>
                ) : (
                  <div className="flex flex-col items-center space-y-4">
                    <button onClick={stopRecording} className="w-20 h-20 border border-accent rounded-full flex items-center justify-center hover:opacity-80 transition-opacity">
                      <Square className="w-8 h-8 text-accent" />
                    </button>
                    <div className="flex items-center gap-2 text-cream font-mono bg-black/50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      {formatTime(recordingTime)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-6">
                <h3 className="text-xl md:text-2xl font-semibold text-maroon tracking-tight text-center font-heading">Pesan Suara Tersimpan</h3>
                <CustomAudioPlayer blob={audioBlob} onRemove={clearAudio} />
                <button
                  onClick={clearAudio}
                  className="flex items-center gap-1.5 text-sm text-maroon/70 hover:text-accent font-medium underline underline-offset-4 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Rekam Ulang Pesan
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Caption Input always visible at the bottom */}
        <div className="w-full mt-12 mb-4">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Berikan pesan dan kesan..."
            maxLength={100}
            className="w-full bg-canvas text-maroon rounded-md px-6 py-4 border border-accent/30 focus:outline-none focus:border-accent focus:bg-panel transition-all text-base shadow-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 justify-center w-full max-w-[280px] mx-auto">
        <GradientPill onClick={onNext} className="w-full">
          Selanjutnya
        </GradientPill>
        <GhostPill onClick={onBack} className="w-full">
          Foto Ulang
        </GhostPill>
      </div>
    </motion.div>
  );
}