import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, QrCode, Search, Grid, Film, MessageCircleHeart, CheckSquare, X, Download, CheckCheck } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useFeedEntries } from '../hooks/useFeedEntries';
import FeedCard from '../components/feed/FeedCard';
import FullViewModal from '../components/feed/FullViewModal';
import { AnimatePresence, motion } from 'framer-motion';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export default function BrideGallery() {
  const navigate = useNavigate();
  // PANGGIL HOOK DENGAN MODE 'private' UNTUK MENGAMBIL SEMUA DATA
  const { entries: feed, loading } = useFeedEntries('private');
  const [fullViewItem, setFullViewItem] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk download state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });

  const filteredFeed = useMemo(() => {
    let filtered = feed;
    if (activeTab === 'posts') filtered = filtered.filter(item => item.type === 'photo');
    if (activeTab === 'reels') filtered = filtered.filter(item => item.type === 'video');
    if (activeTab === 'wishes') filtered = filtered.filter(item => item.type === 'wishes');

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [feed, activeTab, searchQuery]);

  const {
    playingId,
    audioProgress,
    audioCurrentTime,
    audioDuration,
    handlePlayAudio,
    stopAudio
  } = useAudioPlayer();

  const closeFullView = () => {
    stopAudio();
    setFullViewItem(null);
  };

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = () => {
    // Only select downloadable items (photo/video) from current filtered feed
    const downloadable = filteredFeed.filter(item => item.type !== 'wishes');
    if (selectedIds.size === downloadable.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(downloadable.map(item => item.id)));
    }
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;

    setDownloading(true);
    const zip = new JSZip();
    const selectedItems = feed.filter(item => selectedIds.has(item.id));
    const total = selectedItems.length;
    let current = 0;

    setDownloadProgress({ current: 0, total });

    for (const item of selectedItems) {
      try {
        const url = item.type === 'video' ? item.videoUrl : item.photoUrl;
        if (!url) continue;

        const response = await fetch(url);
        const blob = await response.blob();

        const safeName = (item.name || 'unknown').replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_');
        const ext = item.type === 'video' ? 'mp4' : 'jpg';
        const folder = item.type === 'video' ? 'videos' : 'photos';
        const filename = `${folder}/${safeName}_${item.id}.${ext}`;

        zip.file(filename, blob);
        current++;
        setDownloadProgress({ current, total });
      } catch (err) {
        console.error(`Failed to download ${item.id}:`, err);
        current++;
        setDownloadProgress({ current, total });
      }
    }

    try {
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `wedding-memories-${Date.now()}.zip`);
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
    } finally {
      setDownloading(false);
      setDownloadProgress({ current: 0, total: 0 });
    }
  };

  const downloadableCount = filteredFeed.filter(item => item.type !== 'wishes').length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#2a1a1f]">
        <div className="w-12 h-12 border-4 border-[#e4d5b7] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-[#2a1a1f] relative overflow-hidden">
      {/* Header Khusus Private */}
      <div className="shrink-0 px-4 pt-6 pb-4 text-center border-b border-white/10">
        <div className="relative flex items-center justify-center">
          <button
            onClick={() => navigate('/')}
            className="absolute left-0 w-9 h-9 flex items-center justify-center bg-[#e4d5b7] text-[#2a1a1f] rounded-full hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-center gap-1.5 text-[#e4d5b7] text-sm font-semibold tracking-[0.2em] uppercase">
            <Lock className="w-4 h-4" />
            <p>Private Gallery</p>
          </div>
          <button
            onClick={() => navigate('/bride/qr')}
            className="absolute right-0 w-9 h-9 flex items-center justify-center text-[#e4d5b7] hover:bg-white/5 rounded-full transition-colors"
          >
            <QrCode className="w-5 h-5" />
          </button>
        </div>
        <h1 className="text-[#e4d5b7] text-3xl font-heading font-bold mt-3">
          Only For<br />Bride & Groom
        </h1>
        <p className="text-[#e4d5b7]/60 text-[11px] font-medium mt-2 max-w-[280px] mx-auto">
          Galeri ini memuat semua foto dan video, termasuk yang dikirimkan secara privat oleh tamu (hanya untuk pengantin).
        </p>

        {/* Search Bar */}
        <div className="mt-5 max-w-[320px] mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#e4d5b7]/50" />
            <input
              type="text"
              placeholder="Cari nama tamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-[#e4d5b7] placeholder:text-[#e4d5b7]/30 focus:outline-none focus:border-[#e4d5b7]/50 transition-colors"
            />
          </div>
        </div>

        {/* Select / Download Toggle */}
        {activeTab !== 'wishes' && (
          <div className="mt-4 max-w-[320px] mx-auto">
            <button
              onClick={toggleSelectMode}
              className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all ${selectMode ? 'bg-white/10 text-[#e4d5b7] border border-[#e4d5b7]/30' : 'bg-[#e4d5b7]/10 text-[#e4d5b7] border border-transparent hover:border-[#e4d5b7]/20'}`}
            >
              {selectMode ? (
                <><X className="w-4 h-4" /> Batal Pilih</>
              ) : (
                <><CheckSquare className="w-4 h-4" /> Pilih & Download</>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 sticky top-0 bg-[#2a1a1f]/95 backdrop-blur z-20 shrink-0 px-4">
        <button
          onClick={() => { setActiveTab('posts'); setSelectedIds(new Set()); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'posts' ? 'text-[#e4d5b7] border-b-[1.5px] border-[#e4d5b7] -mb-[1px]' : 'text-[#e4d5b7]/40 hover:text-[#e4d5b7]/70'}`}
        >
          <Grid className="w-3.5 h-3.5" /> POSTS
        </button>
        <button
          onClick={() => { setActiveTab('reels'); setSelectedIds(new Set()); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'reels' ? 'text-[#e4d5b7] border-b-[1.5px] border-[#e4d5b7] -mb-[1px]' : 'text-[#e4d5b7]/40 hover:text-[#e4d5b7]/70'}`}
        >
          <Film className="w-3.5 h-3.5" /> REELS
        </button>
        <button
          onClick={() => { setActiveTab('wishes'); setSelectMode(false); setSelectedIds(new Set()); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'wishes' ? 'text-[#e4d5b7] border-b-[1.5px] border-[#e4d5b7] -mb-[1px]' : 'text-[#e4d5b7]/40 hover:text-[#e4d5b7]/70'}`}
        >
          <MessageCircleHeart className="w-3.5 h-3.5" /> WISHES
        </button>
      </div>

      {/* Select All bar */}
      {selectMode && downloadableCount > 0 && (
        <div className="shrink-0 px-4 py-2.5 bg-[#e4d5b7]/10 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={selectAll}
            className="flex items-center gap-2 text-[#e4d5b7] text-xs font-semibold hover:text-white transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {selectedIds.size === downloadableCount ? 'Batal pilih semua' : `Pilih semua (${downloadableCount})`}
          </button>
          <span className="text-[#e4d5b7]/60 text-xs">
            {selectedIds.size} dipilih
          </span>
        </div>
      )}

      {/* Gallery grid */}
      {filteredFeed.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#e4d5b7]/50 px-4 text-center">
          <p>Belum ada {activeTab === 'posts' ? 'foto' : activeTab === 'reels' ? 'video' : 'ucapan'} {searchQuery ? `untuk pencarian "${searchQuery}"` : ''}.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
          <div className="columns-2 gap-4">
            {filteredFeed.map((item, index) => (
              <div key={item.id} className="relative">
                {!item.is_public && (
                  <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded border border-white/20 flex items-center gap-1 shadow-sm">
                    <Lock className="w-3 h-3" />
                    <span className="text-[9px] font-bold tracking-wider uppercase">Private</span>
                  </div>
                )}
                <FeedCard
                  item={item}
                  index={index}
                  playingId={playingId}
                  setFullViewItem={setFullViewItem}
                  handlePlayAudio={handlePlayAudio}
                  showDownloadButton={!selectMode}
                  selectMode={selectMode && item.type !== 'wishes'}
                  isSelected={selectedIds.has(item.id)}
                  onToggleSelect={toggleSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating Download Bar */}
      <AnimatePresence>
        {selectMode && selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2 }}
            className="absolute bottom-6 left-4 right-4 z-30"
          >
            <button
              onClick={handleBulkDownload}
              disabled={downloading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#e4d5b7] to-[#c9b896] text-[#2a1a1f] font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/30 disabled:opacity-70 transition-opacity"
            >
              {downloading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-[#2a1a1f] border-t-transparent rounded-full animate-spin" />
                  <span>Mengunduh {downloadProgress.current}/{downloadProgress.total}...</span>
                </div>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download {selectedIds.size} item
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full View Modal */}
      <AnimatePresence>
        {fullViewItem && (
          <FullViewModal
            item={fullViewItem}
            closeFullView={closeFullView}
            playingId={playingId}
            handlePlayAudio={handlePlayAudio}
            audioProgress={audioProgress}
            audioCurrentTime={audioCurrentTime}
            audioDuration={audioDuration}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
