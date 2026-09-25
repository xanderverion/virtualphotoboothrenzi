import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, LayoutGrid, Camera, Home,
  Heart, Grid, Film, MessageCircleHeart
} from 'lucide-react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useFeedEntries } from '../hooks/useFeedEntries';
import FeedCard from '../components/feed/FeedCard';
import FullViewModal from '../components/feed/FullViewModal';
import { AnimatePresence, motion } from 'framer-motion';

export default function Feed() {
  const navigate = useNavigate();
  const { entries: feed, loading } = useFeedEntries();
  const [fullViewItem, setFullViewItem] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'reels', 'wishes'


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

  // Stats calculation
  const stats = useMemo(() => {
    return {
      posts: feed.filter(item => item.type === 'photo').length,
      reels: feed.filter(item => item.type === 'video').length,
      wishes: feed.filter(item => item.type === 'wishes').length,
    };
  }, [feed]);

  // Filtered feed
  const filteredFeed = useMemo(() => {
    if (activeTab === 'posts') return feed.filter(item => item.type === 'photo');
    if (activeTab === 'reels') return feed.filter(item => item.type === 'video');
    if (activeTab === 'wishes') return feed.filter(item => item.type === 'wishes');
    return [];
  }, [feed, activeTab]);



  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#fdfaf6]">
        <div className="w-12 h-12 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 w-full h-full flex flex-col bg-[#fdfaf6] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Banner Section */}
        <div className="relative w-full h-64 overflow-hidden shrink-0">
          <img
            src="/vpbgallery.jpg"
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-70% to-[#fdfaf6]"></div>


          <div className="absolute bottom-6 left-6 right-6 text-left">
            <p className="text-white text-[10px] font-normal tracking-[0.2em] uppercase mb-1 ml-1">
              Wedding Gallery
            </p>
            <h1 className="text-white text-4xl font-heading font-bold drop-shadow-md">
              Azizah &amp; Randy
            </h1>
          </div>
        </div>

        {/* Profile Section */}
        <div className="px-6 pb-6 -mt-4 relative z-10 shrink-0">
          <div className="flex flex-col mb-6">
            {/* Avatar & Username */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-[#d4a373] to-[#7f4f24] shrink-0 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#fdfaf6] bg-white">
                  <img src="/photo-profile.jpg" alt="Profile" className="w-full h-full object-cover" />
                </div>
              </div>
              <div>
                <h2 className="text-maroon text-lg font-bold">@azizah.randy</h2>
                <p className="text-maroon/60 text-xs mt-0.5">#beRANiuntukZAH</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => navigate('/capture')}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#6e1e2d] to-[#4a121e] text-white flex items-center justify-center gap-2 font-semibold shadow-lg shadow-maroon/20 hover:opacity-90 transition-opacity"
              >
                <Camera className="w-5 h-5" />
                Buat kenangan
              </button>

              <button
                onClick={() => navigate('/capture?type=wishes')}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-maroon border border-[#e8dcc7] flex items-center justify-center gap-2 font-semibold hover:bg-maroon/5 transition-colors shadow-sm"
              >
                <Heart className="w-5 h-5" />
                Kirim ucapan
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-maroon border border-[#e8dcc7] flex items-center justify-center gap-2 font-semibold hover:bg-maroon/5 transition-colors shadow-sm"
              >
                <Home className="w-5 h-5" />
                Beranda
              </button>

            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-around items-center border-t border-b border-[#e8dcc7] py-4 mb-5">
            <div className="text-center">
              <p className="text-xl font-bold text-maroon">{stats.posts}</p>
              <p className="text-[10px] text-maroon/60 uppercase tracking-wider mt-0.5">posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-maroon">{stats.reels}</p>
              <p className="text-[10px] text-maroon/60 uppercase tracking-wider mt-0.5">reels</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-maroon">{stats.wishes}</p>
              <p className="text-[10px] text-maroon/60 uppercase tracking-wider mt-0.5">wishes</p>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-8">
            <h3 className="font-bold text-maroon mb-1">Azizah &amp; Randy</h3>
            <p className="text-sm text-maroon/80 leading-relaxed mb-2">
              Setiap foto adalah cerita, setiap ucapan adalah doa. Terima kasih telah menjadi bagian dari hari bahagia kami.
            </p>
            <p className="text-xs text-maroon/50">
              01 November 2026 • Wedding Gallery
            </p>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            <button
              onClick={() => navigate('/book')}
              className="bg-gradient-to-br from-[#6e1e2d] to-[#3a0d15] text-white p-4 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden group shadow-md min-h-[100px]"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
              <h4 className="font-heading font-bold text-xl tracking-wide leading-tight text-center relative z-10">Wedding<br />Journal</h4>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-[#e8dcc7] sticky top-0 bg-[#fdfaf6]/95 backdrop-blur z-20 shrink-0">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'posts' ? 'text-maroon border-t-[1.5px] border-maroon -mt-[1px]' : 'text-maroon/40 hover:text-maroon/70'}`}
          >
            <Grid className="w-3.5 h-3.5" /> POSTS
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'reels' ? 'text-maroon border-t-[1.5px] border-maroon -mt-[1px]' : 'text-maroon/40 hover:text-maroon/70'}`}
          >
            <Film className="w-3.5 h-3.5" /> REELS
          </button>
          <button
            onClick={() => setActiveTab('wishes')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-semibold tracking-widest transition-colors ${activeTab === 'wishes' ? 'text-maroon border-t-[1.5px] border-maroon -mt-[1px]' : 'text-maroon/40 hover:text-maroon/70'}`}
          >
            <MessageCircleHeart className="w-3.5 h-3.5" /> WISHES
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 min-h-[400px]">
          {filteredFeed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-80 text-center px-4">
              {activeTab === 'posts' && <Heart className="w-8 h-8 mb-4 text-maroon" />}
              {activeTab === 'reels' && <Heart className="w-8 h-8 mb-4 text-maroon" />}
              {activeTab === 'wishes' && <Heart className="w-8 h-8 mb-4 text-maroon" />}

              <h3 className="font-heading text-2xl font-bold text-maroon mb-2">
                Belum ada {activeTab === 'posts' ? 'foto' : activeTab === 'reels' ? 'video' : 'ucapan'}
              </h3>
              <p className="text-[13px] text-maroon/60 leading-relaxed max-w-[250px]">
                {activeTab === 'posts' && 'Foto tamu akan tampil di tab posts.'}
                {activeTab === 'reels' && 'Video Reels tamu akan tampil di sini.'}
                {activeTab === 'wishes' && 'Ucapan tamu akan tampil di sini.'}
              </p>
            </div>
          ) : (
            <div className="columns-2 gap-4">
              {filteredFeed.map((item, index) => (
                <FeedCard
                  key={item.id}
                  item={item}
                  index={index}
                  playingId={playingId}
                  setFullViewItem={setFullViewItem}
                  handlePlayAudio={handlePlayAudio}
                />
              ))}
            </div>
          )}
        </div>
      </div>

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
