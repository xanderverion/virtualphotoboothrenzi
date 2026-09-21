import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Camera, Video as VideoIcon } from 'lucide-react';

const FLIP_DURATION = 0.6; // seconds, for a full 0→180 turn triggered by tap
const DRAG_COMMIT_THRESHOLD = 0.35; // fraction of the turn a drag must pass to complete it

// ---------------------------------------------------------------------
// CONTENT — edit this array with the real story, chapter titles and
// media. Everything below (`type: 'cover' | 'story' | 'image' | 'video'
// | 'closing'`) is placeholder copy so the book has something to show.
//
//   - 'story' pages: `chapter` (label), `title`, `body` (paragraph text)
//   - 'image' pages: `src` (photo path) + `caption`. Leave `src` empty
//     to keep the "add a photo" placeholder tile.
//   - 'video' pages: `src` (video path) + `caption` + optional `poster`
//     (thumbnail shown before playback starts). Autoplays muted as soon
//     as the page arrives; leave `src` empty for the placeholder tile.
//   - cover / closing: edit the JSX directly in CoverPage / ClosingPage
//     below (tagline, eyebrow text, couple names).
// ---------------------------------------------------------------------
const pages = [
  { type: 'cover', photoSrc: '/wedding-journal-cover.jpg' },
  {
    type: 'story',
    chapter: '01',
    title: 'Pertemuan',
    body: 'Kami bertemu di tempat yang paling biasa — namun sejak hari itu, semuanya terasa berbeda. Percakapan singkat yang mengalir begitu saja, tanpa kami sadari, menjadi awal dari perjalanan panjang yang akan kami tempuh bersama.',
  },
  {
    type: 'image',
    src: '/wedding-journal-1.jpg',
    caption: 'Momen pertama kami, diabadikan begitu saja.',
  },
  {
    type: 'story',
    chapter: '02',
    title: 'Perjalanan',
    body: 'Waktu berjalan, dan yang tadinya sekadar kenal menjadi saling memahami. Setiap tawa, setiap diskusi kecil, setiap momen sederhana yang kami lalui berdua, perlahan menyatukan dua cerita menjadi satu.',
  },
  {
    type: 'video',
    src: '/video-journal.mp4',
    poster: '',
    caption: 'Perjalanan kecil yang selalu kami syukuri.',
  },
  {
    type: 'story',
    chapter: '03',
    title: 'Janji',
    body: 'Dan di suatu hari, kami memutuskan untuk tidak lagi berjalan sendiri-sendiri. Sebuah janji terucap — bukan untuk hari ini saja, tapi untuk setiap hari yang akan datang.',
  },
  {
    type: 'image',
    src: '/wedding-journal-2.jpg',
    caption: "Awal dari 'selamanya' kami.",
  },
  { type: 'closing' },
];

function CoverPage({ page }) {
  return (
    <div className="absolute inset-0 rounded-lg border border-accent/20 shadow-xl overflow-hidden bg-accent-soft flex items-center justify-center">
      {page.photoSrc ? (
        <img
          src={page.photoSrc}
          alt="Azizah & Randy"
          className="w-full h-full object-cover select-none [-webkit-touch-callout:none]"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <>
          <div className="absolute inset-4 rounded border border-maroon/15" />
          <p className="font-couple text-7xl text-maroon relative">R &amp; A</p>
        </>
      )}

      {/* Text sits directly on the photo/monogram — no separate panel underneath */}
      {/* Gradient scrim — fixed proportion of the card, independent of text length */}
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-maroon/90 via-maroon/40 to-transparent pointer-events-none" />

      {/* Text sits directly on the photo/monogram — no separate panel underneath */}
      <div className="absolute inset-x-0 bottom-4 px-6 text-left">
        <p className="text-cream/80 text-[10px] font-semibold tracking-[0.25em] uppercase font-heading">
          {/*Our Wedding Journal*/}
        </p>
        <h1 className="text-cream text-3xl font-heading font-bold mt-0.5">
          Our
          <br />
          Wedding
          <br />
          Journal</h1>
        <p className="text-cream/80 text-[12px] italic mt-5 font-body">
          A little glimpse into the story of us
        </p>
      </div>
    </div>
  );
}

function ClosingPage() {
  return (
    <div className="absolute inset-0 rounded-lg overflow-hidden shadow-xl bg-maroon flex items-center justify-center p-5">
      <div className="w-full h-full border border-cream/25 rounded flex flex-col items-center justify-center text-center px-6">
        <span className="text-cream/70 text-[10px] tracking-[0.3em] uppercase font-heading">
          Akhir &middot; Awal
        </span>
        <h2 className="text-cream font-heading text-3xl font-bold mt-4">Randy &amp; Azizah</h2>
        <p className="text-cream/70 text-sm italic font-body mt-20">
          Bukan akhir dari sebuah perjalanan, melainkan awal dari selamanya.
        </p>
      </div>
    </div>
  );
}

function StoryPage({ page, pageNumber, total }) {
  return (
    <div className="absolute inset-0 bg-canvas rounded-lg border border-accent/20 shadow-xl flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-7 py-8">
        <span className="text-accent/50 font-heading text-xs tracking-[0.3em] uppercase">
          Bab {page.chapter}
        </span>
        <h2 className="text-maroon font-heading text-2xl font-bold mt-2 mb-4">{page.title}</h2>
        <p className="text-maroon/80 font-body text-sm leading-relaxed">{page.body}</p>
      </div>
      <div className="shrink-0 px-7 py-3 border-t border-accent/10 text-center">
        <span className="text-maroon/40 text-[10px] tracking-widest font-heading">
          {pageNumber} / {total}
        </span>
      </div>
    </div>
  );
}

function ImagePage({ page, pageNumber, total }) {
  return (
    <div className="absolute inset-0 bg-canvas rounded-lg border border-accent/20 shadow-xl flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex items-center justify-center bg-accent-soft relative">
        {page.src ? (
          <img src={page.src} alt={page.caption} className="w-full h-full object-cover select-none [-webkit-touch-callout:none]" draggable={false} onContextMenu={(e) => e.preventDefault()} />
        ) : (
          <div className="flex flex-col items-center gap-2 text-maroon/40 px-6 text-center">
            <Camera className="w-7 h-7" />
            <p className="text-xs font-body">Tambahkan foto di sini</p>
          </div>
        )}
      </div>
      <div className="shrink-0 px-4 py-3 border-t border-accent/10 bg-canvas flex items-center justify-between">
        <p className="text-maroon/70 text-xs italic font-body truncate">{page.caption}</p>
        <span className="text-maroon/40 text-[10px] tracking-widest font-heading shrink-0 ml-3">
          {pageNumber} / {total}
        </span>
      </div>
    </div>
  );
}

function VideoPage({ page, pageNumber, total, active }) {
  return (
    <div className="absolute inset-0 bg-canvas rounded-lg border border-accent/20 shadow-xl flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex items-center justify-center bg-black relative">
        {page.src ? (
          // Mounting this element is what triggers playback, so it only renders once the
          // page has actually arrived (or is arriving) — see `active` below.
          active && (
            <video
              src={page.src}
              poster={page.poster || undefined}
              className="w-full h-full object-cover select-none [-webkit-touch-callout:none]"
              style={{ pointerEvents: 'none' }}
              autoPlay
              muted
              loop
              playsInline
              disablePictureInPicture
              disableRemotePlayback
              onContextMenu={(e) => e.preventDefault()}
            />
          )
        ) : (
          <div className="flex flex-col items-center gap-2 text-cream/50 px-6 text-center">
            <VideoIcon className="w-7 h-7" />
            <p className="text-xs font-body">Tambahkan video di sini</p>
          </div>
        )}
      </div>
      <div className="shrink-0 px-4 py-3 border-t border-accent/10 bg-canvas flex items-center justify-between">
        <p className="text-maroon/70 text-xs italic font-body truncate">{page.caption}</p>
        <span className="text-maroon/40 text-[10px] tracking-widest font-heading shrink-0 ml-3">
          {pageNumber} / {total}
        </span>
      </div>
    </div>
  );
}

function PageFace({ page, pageNumber, total, active = true }) {
  if (!page) return null;
  switch (page.type) {
    case 'cover':
      return <CoverPage page={page} />;
    case 'closing':
      return <ClosingPage />;
    case 'story':
      return <StoryPage page={page} pageNumber={pageNumber} total={total} />;
    case 'image':
      return <ImagePage page={page} pageNumber={pageNumber} total={total} />;
    case 'video':
      return <VideoPage page={page} pageNumber={pageNumber} total={total} active={active} />;
    default:
      return null;
  }
}

export default function WeddingBook() {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  // While a turn is in flight: which page is leaving, which is arriving, which way it hinges
  const [flip, setFlip] = useState(null);
  const lockRef = useRef(false);
  const stageRef = useRef(null);
  const dragRef = useRef({ active: false, dir: null, startX: 0, width: 320 });

  // Single motion value drives the turning page's rotation, whether it's being
  // pushed by a tap (animated start-to-finish) or by a finger (set frame-by-frame
  // while dragging, then handed off to `animate()` to settle on release).
  const rotateY = useMotionValue(0);
  const rotateProgress = useTransform(rotateY, (v) => Math.abs(v));
  // Shading that sweeps across the turning page, peaking as it stands edge-on.
  const shadeOpacity = useTransform(rotateProgress, [0, 90, 180], [0, 1, 0]);
  const contactOpacity = useTransform(rotateProgress, [0, 90, 180], [0, 0.18, 0]);

  const isFlipping = !!flip;
  const hingeOrigin = flip?.dir === 1 ? 'left center' : 'right center';

  const finishFlip = () => {
    setFlip((f) => {
      if (!f) return f;
      setIndex(f.to);
      return null;
    });
    lockRef.current = false;
  };

  const cancelFlip = () => {
    setFlip(null);
    lockRef.current = false;
  };

  const runFlip = (dir) => {
    if (lockRef.current) return;
    const target = index + dir;
    if (target < 0 || target >= pages.length) return;
    lockRef.current = true;
    setFlip({ from: index, to: target, dir });
    rotateY.set(0);
    animate(rotateY, dir === 1 ? -180 : 180, {
      duration: FLIP_DURATION,
      ease: [0.45, 0, 0.55, 1],
      onComplete: finishFlip,
    });
  };

  const goNext = () => runFlip(1);
  const goPrev = () => runFlip(-1);

  // --- Finger-drag page turning -------------------------------------
  const handlePointerDown = (e) => {
    if (lockRef.current) return;
    const rect = stageRef.current?.getBoundingClientRect();
    dragRef.current = { active: true, dir: null, startX: e.clientX, width: rect?.width || 320 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const deltaX = e.clientX - drag.startX;

    if (drag.dir === null) {
      if (Math.abs(deltaX) < 8) return; // small movement — not a swipe yet
      const dir = deltaX < 0 ? 1 : -1;
      const target = index + dir;
      if (target < 0 || target >= pages.length) {
        drag.active = false; // already at the front/back cover — nothing to flip to
        return;
      }
      drag.dir = dir;
      lockRef.current = true;
      setFlip({ from: index, to: target, dir });
      rotateY.set(0);
    }

    const progress = Math.min(Math.abs(deltaX) / drag.width, 1);
    rotateY.set(drag.dir === 1 ? -180 * progress : 180 * progress);
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    dragRef.current = { active: false, dir: null, startX: 0, width: drag.width };
    if (!drag.active || drag.dir === null) return;

    const progress = Math.abs(rotateY.get()) / 180;
    const target = drag.dir === 1 ? -180 : 180;

    if (progress > DRAG_COMMIT_THRESHOLD) {
      animate(rotateY, target, {
        duration: FLIP_DURATION * (1 - progress),
        ease: [0.45, 0, 0.55, 1],
        onComplete: finishFlip,
      });
    } else {
      animate(rotateY, 0, {
        duration: FLIP_DURATION * progress,
        ease: [0.45, 0, 0.55, 1],
        onComplete: cancelFlip,
      });
    }
  };

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-broken-white relative overflow-hidden">
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
            Our Wedding Journal
          </p>
        </div>
        <h1 className="text-maroon text-4xl leading-tight font-couple mt-2">
          Azizah &amp; Randy
        </h1>
      </div>

      {/* Book stage */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-6" style={{ perspective: 1600 }}>
        <div
          ref={stageRef}
          className="relative w-full max-w-[340px] aspect-[3/4] select-none touch-pan-y"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Resting page underneath — what's already revealed as the turn progresses */}
          <PageFace
            page={isFlipping ? pages[flip.to] : pages[index]}
            pageNumber={(isFlipping ? flip.to : index) + 1}
            total={pages.length}
            active
          />

          {/* The page currently mid-turn, layered on top of the resting page */}
          <AnimatePresence>
            {isFlipping && (
              <motion.div
                key={`flip-${flip.from}-${flip.to}`}
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d', transformOrigin: hingeOrigin, rotateY }}
              >
                {/* Front face: the page as it looked before turning */}
                <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden' }}>
                  <PageFace page={pages[flip.from]} pageNumber={flip.from + 1} total={pages.length} active={false} />
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      opacity: shadeOpacity,
                      background:
                        flip.dir === 1
                          ? 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.35) 100%)'
                          : 'linear-gradient(to left, transparent 60%, rgba(0,0,0,0.35) 100%)',
                    }}
                  />
                </div>

                {/* Back face: the incoming page, pre-rotated so it reads correctly once flipped into view */}
                <div
                  className="absolute inset-0"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <PageFace page={pages[flip.to]} pageNumber={flip.to + 1} total={pages.length} active />
                  <motion.div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      opacity: shadeOpacity,
                      background:
                        flip.dir === 1
                          ? 'linear-gradient(to left, transparent 60%, rgba(0,0,0,0.35) 100%)'
                          : 'linear-gradient(to right, transparent 60%, rgba(0,0,0,0.35) 100%)',
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Soft contact shadow the turning page casts back onto the book while it's mid-air */}
          {isFlipping && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none bg-black"
              style={{ opacity: contactOpacity }}
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="shrink-0 flex items-center justify-center gap-6 pb-6 pt-2">
        <button
          onClick={goPrev}
          disabled={index === 0 || isFlipping}
          className="w-11 h-11 rounded-full border border-maroon/20 flex items-center justify-center text-accent disabled:opacity-30 transition-opacity"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-maroon/60 text-xs font-semibold tracking-widest">
          {index + 1} / {pages.length}
        </span>
        <button
          onClick={goNext}
          disabled={index === pages.length - 1 || isFlipping}
          className="w-11 h-11 rounded-full border border-maroon/20 flex items-center justify-center text-accent disabled:opacity-30 transition-opacity"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}