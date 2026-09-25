import { motion } from 'framer-motion';
import { Image, Video, PenLine, Mic, ArrowUpRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * StepChooseType
 * -------------------------------------------------------------
 * Step 1 pengganti/pendahulu StepInfo — user memilih jenis momen
 * yang ingin ditinggalkan, sebelum masuk ke input nama & alur
 * pengambilan konten.
 *
 * Cara pakai di Capture.jsx:
 *
 *   const [contentType, setContentType] = useState(null); // null = belum pilih
 *
 *   {step === 1 && !contentType && (
 *     <StepChooseType
 *       onSelect={(type) => { setContentType(type); }}
 *       pageVariants={pageVariants}
 *     />
 *   )}
 *   {step === 1 && contentType && (
 *     <StepInfo ... />  // lanjut input nama, dst
 *   )}
 */

const OPTIONS = [
  {
    id: 'photo',
    number: '01',
    icon: Image,
    title: 'Kirim Foto',
    desc: 'Kirim foto dengan pesan suara dan abadikan dalam bingkai spesial.',
  },
  {
    id: 'video',
    number: '02',
    icon: Video,
    title: 'Kirim Video',
    desc: 'Rekam ucapan dan momen bahagia dalam bentuk video.',
  },
  {
    id: 'wishes',
    number: '03',
    icon: PenLine,
    title: 'Tulisan Saja',
    desc: 'Kirim doa dan pesan tertulis.',
  },
];

export default function StepChooseType({ onSelect, pageVariants }) {
  const navigate = useNavigate();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      transition={{ duration: 0.35 }}
      className="w-full max-w-3xl mx-auto"
    >
      <div className="relative w-full text-center mt-2 mb-2 px-12">
        <button
          onClick={() => navigate('/')}
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center text-maroon bg-white rounded-full shadow-sm border border-maroon/5 hover:bg-gray-50 transition-colors z-10"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <p className="text-maroon text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
          Langkah 1
        </p>
        <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
          Jenis Kenangan
        </h2>
      </div>

      <div className="text-center mb-6">
        <p className="text-maroon/60 text-xs px-4">
          Pilih bagaimana kamu ingin mengabadikan momen
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {OPTIONS.map((opt, i) => {
          const Icon = opt.icon;
          return (
            <motion.button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="group relative text-left bg-cream rounded-2xl p-6 pb-8 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-md hover:shadow-lg border border-maroon/5 transition-all"
            >
              {/* Blob dekoratif pojok kanan bawah */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-maroon/10 group-hover:bg-maroon/15 transition-colors" />

              <div className="relative flex items-start justify-between">
                <span className="text-maroon/40 text-xs font-semibold tracking-widest">
                  {opt.number}
                </span>
                <span className="w-8 h-8 rounded-full border border-maroon/15 flex items-center justify-center text-maroon group-hover:bg-maroon group-hover:text-cream group-hover:border-maroon transition-colors">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>

              <div className="relative w-11 h-11 rounded-xl bg-maroon text-cream flex items-center justify-center mt-5 mb-4">
                <Icon className="w-5 h-5" />
              </div>

              <h3 className="relative text-maroon text-xl font-heading font-bold">
                {opt.title}
              </h3>
              <p className="relative text-maroon/60 text-xs mt-1.5 leading-relaxed pr-6">
                {opt.desc}
              </p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
