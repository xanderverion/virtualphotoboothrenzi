import { Play, Pause, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FullViewModal({
  item,
  closeFullView,
  playingId,
  handlePlayAudio,
  audioProgress,
  audioCurrentTime
}) {
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return "00:00";
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isPlaying = playingId === item.id;

  const dateObj = new Date(item.timestamp || Date.now());
  const dateLabel = dateObj
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
    .toUpperCase();
  const timeLabel = dateObj
    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    .replace(':', '.');

  // Static waveform silhouette (visual only — real progress is driven by audioProgress)
  const bars = [6, 10, 4, 14, 8, 18, 6, 12, 20, 9, 15, 5, 11, 17, 7, 13, 19, 6, 10, 4, 14, 8];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
      onClick={closeFullView}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
        className="relative w-full max-w-[380px] max-h-[85vh] overflow-y-auto no-scrollbar flex flex-col bg-maroon rounded-3xl border border-cream/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-3 text-center relative shrink-0">
          <p className="text-cream/70 text-[10px] font-semibold tracking-[0.2em] uppercase">
            Wedding Memories
          </p>

          <button
            onClick={closeFullView}
            className="absolute top-3 right-3 w-8 h-8 border border-cream/40 text-cream bg-maroon/60 backdrop-blur-sm hover:opacity-80 rounded-full flex items-center justify-center transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Media preview card */}
        <div className="px-5 shrink-0">
          <div className="bg-broken-white rounded-2xl p-3 flex items-center justify-center">
            {item.type === 'video' && item.videoUrl ? (
              <video
                src={item.videoUrl}
                className={`w-full h-auto rounded-sm mx-auto object-cover select-none [-webkit-touch-callout:none] ${item.frame === 'landscape' ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}
                controls
                playsInline
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : item.type === 'wishes' ? (
              <p className="text-maroon text-base italic text-center leading-relaxed py-8 px-2">
                &ldquo;{item.caption}&rdquo;
              </p>
            ) : item.photoUrl ? (
              <img
                src={item.photoUrl}
                alt={item.name}
                className="max-w-[170px] max-h-[280px] w-auto h-auto rounded-sm object-contain select-none [-webkit-touch-callout:none]"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            ) : null}
          </div>
        </div>

        {/* Audio pill — hanya untuk foto/video yang punya pesan suara */}
        {item.type !== 'wishes' && item.audioUrl && (
          <div className="px-5 mt-4 shrink-0">
            <button
              onClick={() => {
                if (item.audioUrl) handlePlayAudio(item.id, item.audioUrl);
              }}
              className={`w-full flex items-center gap-3 bg-broken-white rounded-full pl-2 pr-4 py-1.5 ${item.audioUrl ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
            >
              <span className="w-8 h-8 shrink-0 rounded-full border border-maroon/70 text-maroon flex items-center justify-center">
                {isPlaying ? (
                  <Pause className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                )}
              </span>

              <span className="text-maroon text-xs font-semibold tabular-nums shrink-0">
                {isPlaying ? formatTime(audioCurrentTime) : '00:00'}
              </span>

              <span className="flex-1 flex items-center gap-[2px] h-4 overflow-hidden">
                {bars.map((h, i) => {
                  const barThreshold = ((i + 1) / bars.length) * 100;
                  const active = isPlaying && audioProgress >= barThreshold;
                  return (
                    <span
                      key={i}
                      className={`w-[2px] rounded-full ${active ? 'bg-maroon' : 'bg-maroon/30'}`}
                      style={{ height: `${h}px` }}
                    ></span>
                  );
                })}
              </span>
            </button>
          </div>
        )}

        {/* Caption */}
        {item.type !== 'wishes' && item.caption && (
          <div className="px-5 mt-3 shrink-0">
            <span className="inline-block max-w-full break-words text-cream/90 text-sm italic leading-relaxed">
              &ldquo;{item.caption}&rdquo;
            </span>
          </div>
        )}

        <div className="px-5 mt-4 shrink-0">
          <h2 className="text-cream font-bold text-xl tracking-tight uppercase break-words leading-tight">
            {item.name}
          </h2>
        </div>

        {/* Footer */}
        <div className="mt-4 pb-5 shrink-0">
          <div className="mx-5 border-t border-cream/15"></div>
          <div className="px-5 pt-3 flex items-center justify-between gap-2">
            <span className="text-cream/70 text-[10px] font-semibold tracking-[0.1em] truncate">
              {dateLabel}
            </span>
            <span className="text-cream/70 text-[10px] font-semibold tracking-[0.1em] shrink-0">
              {timeLabel} WIB
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
