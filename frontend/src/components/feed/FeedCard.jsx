import { motion } from 'framer-motion';
import { Play, Pause, Download, Check } from 'lucide-react';

export default function FeedCard({
  item,
  index,
  playingId,
  setFullViewItem,
  handlePlayAudio,
  showDownloadButton = false,
  selectMode = false,
  isSelected = false,
  onToggleSelect
}) {
  const isPlaying = playingId === item.id;

  const handleDownload = async (e) => {
    e.stopPropagation();
    try {
      const url = item.type === 'video' ? item.videoUrl : item.photoUrl;
      if (!url) return;
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${item.name.replace(/\s+/g, '_')}_${item.type === 'video' ? 'video.mp4' : 'photo.jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const dateObj = new Date(item.timestamp || Date.now());
  const dateLabel = dateObj
    .toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase();
  const timeLabel = dateObj
    .toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false })
    .replace(':', '.');

  const handleClick = () => {
    if (selectMode && onToggleSelect) {
      onToggleSelect(item.id);
    } else {
      setFullViewItem(item);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className={`mb-4 break-inside-avoid rounded-2xl overflow-hidden bg-cream border shadow-md cursor-pointer group ${selectMode && isSelected ? 'border-[#e4d5b7] border-2 ring-2 ring-[#e4d5b7]/40' : 'border-maroon/10'}`}
      onClick={handleClick}
    >
      {/* Media */}
      <div className="relative w-full">
        {/* Selection checkbox overlay */}
        {selectMode && (
          <div className={`absolute top-2 left-2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-[#e4d5b7] text-[#2a1a1f]' : 'bg-black/40 border-2 border-white/60'}`}>
            {isSelected && <Check className="w-4 h-4" strokeWidth={3} />}
          </div>
        )}

        {showDownloadButton && !selectMode && item.type !== 'wishes' && (
          <button
            onClick={handleDownload}
            className="absolute top-2 right-2 z-10 w-8 h-8 border border-white/20 bg-black/40 backdrop-blur-md text-white hover:bg-black/60 rounded-full flex items-center justify-center transition-colors shadow-sm"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        )}

        {item.type === 'video' && item.videoUrl ? (
          <>
            <video
              src={item.videoUrl}
              className={`w-full h-auto object-cover select-none [-webkit-touch-callout:none] ${item.frame === 'landscape' ? 'aspect-[16/9]' : 'aspect-[3/4]'}`}
              muted
              playsInline
              preload="metadata"
              onContextMenu={(e) => e.preventDefault()}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <span className="w-11 h-11 border border-cream text-cream bg-maroon/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
            </div>
          </>
        ) : item.type === 'wishes' ? (
          <div className="w-full aspect-[4/5] flex items-center justify-center p-5 bg-maroon/5 border-b border-maroon/5">
            <p className="text-maroon/90 text-sm italic text-center leading-relaxed line-clamp-6">
              &ldquo;{item.caption}&rdquo;
            </p>
          </div>
        ) : (
          <img
            src={item.photoUrl}
            alt={item.name}
            className="w-full h-auto object-cover select-none [-webkit-touch-callout:none]"
            loading="lazy"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
        )}

        {!selectMode && item.type !== 'wishes' && item.audioUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlayAudio(item.id, item.audioUrl);
            }}
            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 border border-cream text-cream bg-maroon/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying ? 'opacity-100 scale-105' : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'}`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
        )}

        {isPlaying && (
          <div className="absolute bottom-2 left-2 flex items-end gap-1 h-3">
            <div className="w-1 bg-cream visualizer-bar rounded-t-sm"></div>
            <div className="w-1 bg-cream visualizer-bar rounded-t-sm"></div>
            <div className="w-1 bg-cream visualizer-bar rounded-t-sm"></div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 py-3 bg-cream">
        <h3 className="text-maroon font-bold text-base leading-tight truncate font-heading">{item.name}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="text-maroon/60 text-[10px] font-semibold tracking-wide">{dateLabel}</span>
          <span className="text-maroon/60 text-[10px] font-semibold tracking-wide">{timeLabel} WIB</span>
        </div>
      </div>
    </motion.div>
  );
}
