import { motion } from 'framer-motion';
import { BookOpen, LayoutGrid, Camera, BookImage } from 'lucide-react';
import { GhostPill, GradientPill } from '../components/GsapKit';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="flex-1 min-h-0 flex flex-col bg-canvas relative overflow-hidden">
      {/* Top Section (Image & Hero) */}
      {/* Top Section (Image & Hero) */}
      <div className="relative w-full flex-[3] min-h-0 flex flex-col items-center justify-end pb-4">
        <img
          src="/akad.jpg"
          alt="Pre-wedding"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />


        {/* Extra bottom gradient to ensure a completely smooth merge with the bottom section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-canvas to-transparent"></div>

        {/* Teks sambutan — sekarang berada tepat di atas judul */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-[14px] font-medium tracking-[0.2em] text-maroon text-center px-4 uppercase -mb-4"
        >
          The Wedding Of
        </motion.p>

        {/* Judul — tetap di bawah */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-10 w-full text-[52px] leading-[0.9] text-accent font-couple text-center px-4 translate-y-4"
        >
          Azizah &amp; Randy
        </motion.h1>
      </div>

      {/* Bottom Section (Actions) */}
      <div className="flex-[2] min-h-0 w-full flex flex-col items-center justify-center px-6 py-4 z-10 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="relative z-10 w-full max-w-[280px] flex flex-col items-center"
        >
          <p className="text-[14px] font-normal tracking-tight text-muted mb-5 text-center">
            Abadikan Momen Bahagia dan Tinggalkan Pesan Manis Untuk Kami🩷
          </p>

          <div className="w-full flex flex-col gap-2 items-center">
            <GradientPill to="/capture" className="w-full">
              <Camera className="w-5 h-5" />
              Buat kenangan
            </GradientPill>
            <GhostPill to="/feed" className="w-full gap-2">
              <BookOpen className="w-5 h-5" />
              Jelajahi kenangan
            </GhostPill>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
