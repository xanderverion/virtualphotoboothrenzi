import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Camera, Video, Mic, PenLine, Check } from 'lucide-react';
import { GhostPill } from '../GsapKit';
import { FRAMES } from '../../constants/frames';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';

const CONTENT_TYPE_META = {
  photo: { label: 'Foto', icon: Camera },
  video: { label: 'Video', icon: Video },
  voice: { label: 'Voice Note', icon: Mic },
  wishes: { label: 'Wishes', icon: PenLine },
};

// Hitung posisi scroll supaya `card` tepat di tengah `container`, lalu
// clamp ke rentang scroll yang valid (0 .. scrollWidth - clientWidth).
const getCenteredScrollLeft = (container, card) => {
  const rawTarget = card.offsetLeft - container.clientWidth / 2 + card.offsetWidth / 2;
  const maxScrollLeft = container.scrollWidth - container.clientWidth;
  return Math.max(0, Math.min(rawTarget, maxScrollLeft));
};

// Animasi scroll manual (rAF) supaya tidak bentrok dengan CSS scroll-snap.
// animRef adalah token pembatal: pemanggilan baru membatalkan animasi lama
// secara otomatis, jadi klik beruntun tidak saling tabrak.
const animateScrollTo = (container, targetLeft, animRef, duration = 350, onDone) => {
  if (!container) return;
  const myId = ++animRef.current.id;
  const startLeft = container.scrollLeft;
  const distance = targetLeft - startLeft;
  const startTime = performance.now();

  const prevSnap = container.style.scrollSnapType;
  container.style.scrollSnapType = 'none';

  const step = (now) => {
    if (animRef.current.id !== myId) return;

    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    container.scrollLeft = startLeft + distance * eased;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      container.style.scrollSnapType = prevSnap || '';
      onDone?.();
    }
  };

  requestAnimationFrame(step);
};

export default function StepInfo({
  contentType,
  frameIndex,
  setFrameIndex,
  onNext,
  onBack,
  pageVariants
}) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const scrollContainerRef = useRef(null);
  const scrollAnimRef = useRef({ id: 0 });
  const isAnimatingRef = useRef(false);

  // Padding kiri/kanan dihitung dari ukuran kartu yang BENAR-BENAR terukur
  // di DOM (bukan ditebak lewat calc() CSS). Ini menjamin kartu manapun,
  // termasuk yang terakhir, selalu punya cukup ruang scroll untuk mencapai
  // posisi tengah — tidak bergantung pada asumsi lebar kartu yang bisa
  // meleset sedikit dari nilai sebenarnya (border, box-sizing, dll).
  const [sidePadding, setSidePadding] = useState(0);

  useLayoutEffect(() => {
    if (contentType !== 'photo') return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const calcPadding = () => {
      const firstCard = container.querySelector('.frame-card');
      if (!firstCard) return;
      const padding = container.clientWidth / 2 - firstCard.offsetWidth / 2;
      setSidePadding(Math.max(0, padding));
    };

    calcPadding();
    window.addEventListener('resize', calcPadding);
    return () => window.removeEventListener('resize', calcPadding);
  }, [contentType]);

  const handleScroll = () => {
    if (isAnimatingRef.current) return;
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollLeft = container.scrollLeft;
    const containerCenter = scrollLeft + container.clientWidth / 2;

    let closestIndex = frameIndex;
    let minDistance = Infinity;

    const cards = container.querySelectorAll('.frame-card');
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - containerCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== frameIndex) {
      setFrameIndex(closestIndex);
    }
  };

  const handleCardClick = (idx, cardElement) => {
    setFrameIndex(idx);

    const container = scrollContainerRef.current;
    if (container && cardElement) {
      isAnimatingRef.current = true;
      const targetLeft = getCenteredScrollLeft(container, cardElement);
      animateScrollTo(container, targetLeft, scrollAnimRef, 350, () => {
        isAnimatingRef.current = false;
      });
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current && contentType === 'photo') {
      const container = scrollContainerRef.current;
      const card = container.querySelectorAll('.frame-card')[frameIndex];
      if (card) {
        container.scrollTo({
          left: getCenteredScrollLeft(container, card),
          behavior: 'instant'
        });
      }
    }
    // sidePadding sengaja dimasukkan supaya posisi awal dihitung ULANG
    // setelah padding hasil pengukuran DOM diterapkan (bukan sebelum itu).
  }, [contentType, sidePadding]);

  const meta = CONTENT_TYPE_META[contentType];
  const Icon = meta?.icon;

  return (
    <motion.div
      key="step1"
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.3 }}
      className={`w-full max-w-md flex flex-col gap-4 relative z-10 ${contentType !== 'photo' ? 'h-full pt-12 pb-6' : ''}`}
    >
      <div className="relative w-full text-center mt-2 mb-2 px-12">
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
          Langkah 2
        </p>
        <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
          {contentType === 'photo' ? 'Pilih Frame Favorit' : 'Persiapan'}
        </h2>
      </div>

      <div className="text-center">
        <p className="text-maroon/60 text-[11px] px-4 leading-relaxed">
          {contentType === 'photo'
            ? 'Geser ke kanan atau kiri. Frame yang berada di tengah otomatis membesar dan menjadi pilihan aktif.'
            : 'Bersiaplah untuk menyimpan kenanganmu'}
        </p>
      </div>

      <div className="flex flex-col flex-1 justify-center w-full mt-1">

        {/* Frame carousel */}
        {contentType === 'photo' && (
          <div className="relative w-full mb-2 flex flex-col items-center">
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              style={{ paddingLeft: sidePadding, paddingRight: sidePadding }}
              className="relative w-[calc(100%+48px)] -ml-6 flex items-center overflow-x-auto snap-x snap-mandatory pb-6 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {FRAMES.map((frame, idx) => {
                const isActive = idx === frameIndex;
                return (
                  <div
                    key={frame.id}
                    onClick={(e) => handleCardClick(idx, e.currentTarget)}
                    className={`frame-card snap-center shrink-0 w-[180px] mx-2 cursor-pointer transition-all duration-300 ease-out flex flex-col bg-[#EBE2D5] border rounded-[24px] p-3 pb-4 ${isActive ? 'scale-100 shadow-xl border-maroon opacity-100' : 'scale-90 shadow-sm border-maroon/20 opacity-50'
                      }`}
                  >
                    <div className="w-full h-[270px] bg-white rounded-xl border border-maroon/10 mb-4 flex items-center justify-center overflow-hidden p-2">
                      <img
                        src={frame.image}
                        className="w-full h-full object-contain drop-shadow-md"
                        alt={frame.name}
                      />
                    </div>

                    <div className="w-full flex items-end justify-between px-2">
                      <div className="flex flex-col">
                        <span className="text-maroon font-bold text-base font-heading">
                          {frame.name}
                        </span>
                        <span className="text-maroon/50 text-[10px]">
                          Geser untuk preview
                        </span>
                      </div>

                      <div className={`w-[18px] h-[18px] shrink-0 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-maroon text-cream' : 'bg-transparent text-transparent'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-1.5 mb-3">
              {FRAMES.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === frameIndex ? 'w-6 bg-maroon' : 'w-1.5 bg-maroon/20'
                    }`}
                />
              ))}
            </div>

            <p className="text-center text-maroon/70 text-xs font-medium">
              {FRAMES[frameIndex].name} dipilih
            </p>
          </div>
        )}

        {contentType === 'video' && (
          <p className="text-center text-muted text-xs max-w-[280px] mx-auto pb-4">
            Kamu akan merekam video ucapan singkat (maks. 30 detik).
          </p>
        )}

        {contentType === 'voice' && (
          <p className="text-center text-muted text-xs max-w-[280px] mx-auto pb-4">
            Kamu akan merekam pesan suara untuk kedua mempelai.
          </p>
        )}

        {contentType === 'wishes' && (
          <p className="text-center text-muted text-xs max-w-[280px] mx-auto pb-4">
            Tuliskan doa dan harapan untuk kedua mempelai.
          </p>
        )}
      </div>

      <div className={`flex flex-col gap-2 mx-auto w-full max-w-[280px] ${contentType !== 'photo' ? 'mt-auto' : 'mt-4'}`}>
        <button
          onClick={onNext}
          className="w-full bg-maroon text-cream font-semibold py-4 rounded-full flex items-center justify-center gap-2 hover:bg-maroon/90 transition-colors shadow-md"
        >
          {contentType === 'photo' ? 'Gunakan Frame Ini' : 'Lanjut'} <span className="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </motion.div>
  );
}