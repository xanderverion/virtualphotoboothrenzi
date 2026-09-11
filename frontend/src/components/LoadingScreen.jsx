import { motion } from 'framer-motion';

export default function LoadingScreen({ onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-canvas flex flex-col items-center justify-center font-inter"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col items-center gap-8 w-full max-w-sm px-6"
      >
        <div className="flex flex-col items-center gap-10">

          <h2 className="text-maroon text-sm md:text-base font-medium tracking-[0.2em] text-center uppercase leading-relaxed">
            Menuju Momen Bahagia <br /> Tak Terlupakan
          </h2>
        </div>

        {/* Progress Bar Container */}
        <div className="w-48 md:w-56 h-1 bg-maroon/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "easeInOut", delay: 0.2 }}
            onAnimationComplete={onComplete}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
