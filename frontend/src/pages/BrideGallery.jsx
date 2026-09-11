import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, QrCode, Search, Grid, Film, MessageCircleHeart } from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useFeedEntries } from '../hooks/useFeedEntries';
import FeedCard from '../components/feed/FeedCard';
import FullViewModal from '../components/feed/FullViewModal';
import { AnimatePresence } from 'framer-motion';

export default function BrideGallery() {
  const navigate = useNavigate();
  // PANGGIL HOOK DENGAN MODE 'private' UNTUK MENGAMBIL SEMUA DATA
  const { entries: feed, loading } = useFeedEntries('private');
  const [fullViewItem, setFullViewItem] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');

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
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 sticky top-0 bg-[#2a1a1f]/95 backdrop-blur z-20 shrink-0 px-4">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'posts' ? 'text-[#e4d5b7] border-b-[1.5px] border-[#e4d5b7] -mb-[1px]' : 'text-[#e4d5b7]/40 hover:text-[#e4d5b7]/70'}`}
        >
          <Grid className="w-3.5 h-3.5" /> POSTS
        </button>
        <button
          onClick={() => setActiveTab('reels')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'reels' ? 'text-[#e4d5b7] border-b-[1.5px] border-[#e4d5b7] -mb-[1px]' : 'text-[#e4d5b7]/40 hover:text-[#e4d5b7]/70'}`}
        >
          <Film className="w-3.5 h-3.5" /> REELS
        </button>
        <button
          onClick={() => setActiveTab('wishes')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'wishes' ? 'text-[#e4d5b7] border-b-[1.5px] border-[#e4d5b7] -mb-[1px]' : 'text-[#e4d5b7]/40 hover:text-[#e4d5b7]/70'}`}
        >
          <MessageCircleHeart className="w-3.5 h-3.5" /> WISHES
        </button>
      </div>

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
                  showDownloadButton={true}
                />
              </div>
            ))}
          </div>
        </div>
      )}

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
