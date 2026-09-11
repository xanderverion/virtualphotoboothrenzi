import { motion } from 'framer-motion';
import { Upload, Download, Share2, Images, RotateCcw, ArrowLeft, Mic, Square } from 'lucide-react';
import { GradientPill, GhostPill } from '../GsapKit';
import CustomAudioPlayer from './CustomAudioPlayer';
import { useNavigate } from 'react-router-dom';
import { useAlert } from '../../contexts/AlertContext';

export default function StepUploadAndSuccess({
  step,
  uploading,
  handleUpload,
  onBack,
  pageVariants,
  contentType,
  photoSrc,
  videoUrl,
  videoOrientation,
  name,
  setName,
  caption,
  setCaption,
  message,
  publishMode,
  setPublishMode,
  audioBlob,
  isRecording,
  recordingTime,
  startRecording,
  stopRecording,
  clearAudio
}) {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Nama file download, dibersihkan dari karakter aneh
  const getFileName = (ext = 'jpg') => {
    const base = name ? name.trim().replace(/\s+/g, '-') : 'wedding-memory';
    return `${base}-${Date.now()}.${ext}`;
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const previewSrc = contentType === 'video' ? videoUrl : photoSrc;

  const handleDownload = async () => {
    if (!previewSrc) {
      showAlert('Konten tidak ditemukan.');
      return;
    }
    try {
      const link = document.createElement('a');
      link.href = previewSrc;
      link.download = getFileName(contentType === 'video' ? 'webm' : 'jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      showAlert('Gagal menyimpan konten.');
    }
  };

  const handleShareInstagram = async () => {
    if (!previewSrc) {
      showAlert('Konten tidak ditemukan.');
      return;
    }
    try {
      const res = await fetch(previewSrc);
      const blob = await res.blob();
      const ext = contentType === 'video' ? 'webm' : 'jpg';
      const file = new File([blob], getFileName(ext), {
        type: blob.type || (contentType === 'video' ? 'video/webm' : 'image/jpeg'),
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Wedding Memories',
        });
      } else {
        showAlert('Perangkat ini belum mendukung bagikan langsung. Konten akan diunduh — silakan unggah manual ke Instagram.');
        await handleDownload();
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        console.error(err);
        showAlert('Gagal membagikan konten.');
      }
    }
  };

  if (step === 4) {
    return (
      <motion.div
        key="step4"
        variants={pageVariants}
        initial="initial"
        animate="in"
        exit="out"
        className="w-full max-w-md mx-auto relative z-10"
      >
        {/* Header */}
        <div className="relative w-full text-center mt-2 mb-2 px-12">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-maroon/5 text-maroon hover:bg-gray-50 transition-colors z-10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <p className="text-maroon text-[10px] font-bold tracking-[0.2em] uppercase mb-1">
            Ready To Publish
          </p>
          <h2 className="text-maroon text-2xl font-heading font-bold leading-tight">
            Bagikan {contentType === 'video' ? 'Video' : contentType === 'photo' ? 'Foto' : 'Ucapan'}
          </h2>
        </div>

        <p className="text-muted text-xs text-center max-w-[280px] mx-auto mb-6">
          Lengkapi detail memori Anda di bawah ini sebelum membagikannya ke Wedding Gallery.
        </p>

        {/* Preview Foto Card */}
        <div className="w-full bg-white rounded-3xl p-4 sm:p-5 shadow-sm mb-6 border border-maroon/5">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-accent text-[10px] font-bold tracking-widest uppercase">Preview {contentType === 'wishes' ? 'Ucapan' : contentType === 'video' ? 'Video' : 'Foto'}</p>
              <p className="text-maroon font-semibold text-sm mt-0.5">Hasil {contentType === 'wishes' ? 'ucapan' : contentType === 'video' ? 'video' : 'foto'} siap dibagikan</p>
            </div>
            <div className="bg-maroon text-cream text-[10px] font-bold px-3 py-1.5 rounded-full tracking-wider uppercase">
              {contentType === 'video' ? 'VIDEO' : contentType === 'photo' ? 'PHOTO' : 'WISHES'}
            </div>
          </div>

          {contentType === 'wishes' ? (
            <div className="w-full rounded-xl overflow-hidden bg-cream/10 border-2 border-cream/40 p-6 flex items-center justify-center min-h-[150px]">
              <p className="text-maroon text-lg italic text-center leading-relaxed">
                &ldquo;{message}&rdquo;
              </p>
            </div>
          ) : (
            <div className={`w-full rounded-xl overflow-hidden relative flex items-center justify-center ${contentType === 'video' ? `bg-black ${videoOrientation === 'landscape' ? 'aspect-[16/9]' : 'aspect-[3/4]'}` : 'bg-white py-6'}`}>
              {contentType === 'video' ? (
                <video src={previewSrc} className="w-full h-full object-cover scale-x-[-1]" autoPlay loop muted playsInline />
              ) : (
                <img src={previewSrc} className="w-full h-auto max-h-[55vh] object-contain" alt="Preview" />
              )}
            </div>
          )}

          <p className="text-muted text-[11px] text-center mt-4 px-2">
            Cek hasil {contentType === 'wishes' ? 'ucapan' : contentType === 'video' ? 'video' : 'foto'} terlebih dahulu, lalu tambahkan nama{contentType !== 'wishes' ? ' dan caption' : ''}.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-6 text-left">

          {/* 01 NAMA KAMU */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#f3e6d8] text-[#8e6b52] flex items-center justify-center text-[11px] font-bold">01</span>
              <span className="text-maroon font-bold text-sm tracking-wide">NAMA KAMU</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="contoh: Azizah"
                className="w-full bg-white rounded-2xl py-4 px-4 text-maroon focus:outline-none border border-transparent focus:border-accent/30 shadow-sm transition-colors text-sm"
              />
            </div>
            <p className="text-muted text-[11px] mt-2 ml-1">Nama kamu akan tampil sebagai pengirim di Wedding Gallery.</p>
          </div>

          {/* 02 VOICE NOTE */}
          {contentType === 'photo' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#f3e6d8] text-[#8e6b52] flex items-center justify-center text-[11px] font-bold">02</span>
                <span className="text-maroon font-bold text-sm tracking-wide">VOICE NOTE <span className="text-[10px] font-normal opacity-70 ml-1">(OPSIONAL)</span></span>
              </div>
              <div className="w-full bg-white rounded-2xl p-4 border border-transparent shadow-sm">
                {!audioBlob ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {!isRecording ? (
                        <button onClick={startRecording} className="w-12 h-12 bg-maroon/10 text-maroon rounded-full flex items-center justify-center hover:bg-maroon/20 transition-colors shrink-0">
                          <Mic className="w-5 h-5" />
                        </button>
                      ) : (
                        <button onClick={stopRecording} className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors animate-pulse shrink-0">
                          <Square className="w-5 h-5" />
                        </button>
                      )}
                      <div>
                        <p className="text-sm font-bold text-maroon leading-tight">
                          {isRecording ? "Merekam..." : "Rekam Pesan Suara"}
                        </p>
                        {isRecording ? (
                          <p className="text-[11px] font-mono text-red-500 mt-1">{formatTime(recordingTime)}</p>
                        ) : (
                          <p className="text-[10px] text-muted mt-0.5">Tambahkan rekaman suara ke kenangan ini</p>
                        )}
                      </div>
                    </div>
                    {isRecording && (
                      <div className="flex gap-1 h-4 items-center">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 bg-red-500 rounded-full"
                            initial={{ height: "20%" }}
                            animate={{ height: ["20%", "100%", "20%"] }}
                            transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <CustomAudioPlayer blob={audioBlob} onRemove={clearAudio} />
                    <button onClick={clearAudio} className="text-[11px] text-maroon/60 underline hover:text-maroon transition-colors text-left w-fit font-medium">
                      Hapus & Rekam Ulang
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 03 CAPTION */}
          {contentType !== 'wishes' && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-6 h-6 rounded-full bg-[#f3e6d8] text-[#8e6b52] flex items-center justify-center text-[11px] font-bold">03</span>
                <span className="text-maroon font-bold text-sm tracking-wide">CAPTION</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-4 text-accent text-sm">✏️</span>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Tulis caption untuk momen ini..."
                  className="w-full bg-white rounded-2xl py-4 pl-10 pr-4 text-maroon focus:outline-none border border-transparent focus:border-accent/30 shadow-sm min-h-[120px] resize-none transition-colors text-sm"
                />
              </div>
              <p className="text-muted text-[11px] mt-2 ml-1">Caption tampil bersama foto atau GIF di Wedding Gallery.</p>
            </div>
          )}

          {/* 04 TAMPILKAN UNTUK */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-[#f3e6d8] text-[#8e6b52] flex items-center justify-center text-[11px] font-bold">
                {contentType === 'wishes' ? '02' : '04'}
              </span>
              <span className="text-maroon font-bold text-sm tracking-wide">TAMPILKAN {contentType === 'wishes' ? 'UCAPAN' : contentType === 'video' ? 'VIDEO' : 'FOTO'} UNTUK</span>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setPublishMode('private')}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${publishMode === 'private' ? 'bg-gradient-to-r from-[#7a2833] to-[#b37a82] text-white border-transparent shadow-md' : 'bg-white text-maroon border-transparent shadow-sm hover:border-maroon/20'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm">{publishMode === 'private' ? '🤍' : '♡'}</span>
                  <div>
                    <p className="font-bold text-sm">Only untuk Pengantin</p>
                    <p className={`text-[11px] mt-0.5 ${publishMode === 'private' ? 'text-white/80' : 'text-muted'}`}>Kiriman hanya terlihat oleh pasangan</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPublishMode('public')}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${publishMode === 'public' ? 'bg-gradient-to-r from-[#7a2833] to-[#b37a82] text-white border-transparent shadow-md' : 'bg-white text-maroon border-transparent shadow-sm hover:border-maroon/20'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-sm">ⓘ</span>
                  <div>
                    <p className="font-bold text-sm">Publish</p>
                    <p className={`text-[11px] mt-0.5 ${publishMode === 'public' ? 'text-white/80' : 'text-muted'}`}>Tampil sebagai post di Wedding Gallery</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <GradientPill onClick={handleUpload} disabled={uploading} className="w-full mt-8 py-4 text-lg">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-cream border-t-transparent rounded-full animate-spin mx-auto" />
          ) : (
            <>Publish {contentType === 'wishes' ? 'Ucapan' : contentType === 'video' ? 'Video' : 'Foto'} ✦</>
          )}
        </GradientPill>

      </motion.div>
    );
  }

  if (step === 5) {
    return (
      <motion.div
        key="step5"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-full max-w-md text-center space-y-8 relative z-10 p-8 rounded-2xl border border-accent/20 bg-panel/50 backdrop-blur-sm"
      >
        <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto border-4 border-accent">
          <svg className="w-12 h-12 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-maroon mb-2 font-display">Sukses!</h2>
          <p className="text-muted">Kenangan Anda telah disimpan di galeri.</p>
        </div>

        <div className="flex flex-col gap-2 w-full max-w-[280px] mx-auto mt-8">
          {previewSrc && (
            <>
              <GradientPill onClick={handleShareInstagram} className="w-full">
                <Share2 className="w-5 h-5 mr-1" />
                Bagikan ke Instagram
              </GradientPill>
              <GradientPill onClick={handleDownload} className="w-full">
                <Download className="w-5 h-5 mr-1" />
                Simpan {contentType === 'video' ? 'Video' : 'Foto'}
              </GradientPill>
            </>
          )}
          <GradientPill onClick={() => navigate('/feed')} className="w-full">
            <Images className="w-5 h-5 mr-1" />
            Lihat Galeri
          </GradientPill>
          <GradientPill onClick={() => window.location.reload()} className="w-full">
            <RotateCcw className="w-5 h-5 mr-1" />
            Tambah Kenangan Lagi
          </GradientPill>
        </div>
      </motion.div>
    );
  }

  return null;
}