import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFeedEntries } from '../hooks/useFeedEntries';

// Hash sederhana dari id -> angka stabil, dipakai untuk rotasi acak yang
// KONSISTEN antar render (bukan Math.random() yang berubah tiap render,
// yang akan bikin kartu "loncat" posisi saat React re-render).
const hashRotation = (id) => {
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash % 14) - 7; // -7deg .. 7deg
};

export default function MemoryWall() {
  const navigate = useNavigate();
  const { entries, loading } = useFeedEntries();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-broken-white">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-panel relative overflow-hidden">
      {/* Header */}
      <div className="shrink-0 px-4 pt-6 pb-4 text-center">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 w-9 h-9 flex items-center justify-center text-maroon"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <p className="text-maroon text-sm font-semibold tracking-[0.2em] uppercase">
            Memory Wall
          </p>
        </div>
        <h1 className="text-maroon text-4xl leading-tight font-couple mt-2">
          Azizah &amp; Randy
        </h1>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-maroon/50 px-4">
          Dinding kenangan masih kosong. Jadilah yang pertama menempelkan momenmu!
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 pt-4">
            {entries.map((item, i) => {
              const rot = hashRotation(item.id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: rot }}
                  transition={{ delay: i * 0.05, duration: 0.4 }}
                  whileHover={{ rotate: 0, scale: 1.04 }}
                  className="bg-cream p-2 pb-6 shadow-lg relative"
                >
                  {/* "Selotip" penahan di atas polaroid */}
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-4 bg-cream/70 border border-black/5 rotate-2 shadow-sm" />

                  <div className="w-full aspect-square bg-black/10 overflow-hidden relative">
                    {item.type === 'video' && item.videoUrl ? (
                      <>
                        <video src={item.videoUrl} className="w-full h-full object-cover" muted playsInline />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                      </>
                    ) : item.type === 'wishes' ? (
                      <div className="w-full h-full flex items-center justify-center p-3 bg-broken-white">
                        <p className="text-maroon text-xs italic text-center leading-snug line-clamp-6">
                          &ldquo;{item.caption}&rdquo;
                        </p>
                      </div>
                    ) : item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-maroon/30 text-xs">
                        Tidak ada konten
                      </div>
                    )}
                  </div>

                  <p className="mt-2 text-maroon text-xs font-heading font-bold text-center truncate">
                    {item.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
