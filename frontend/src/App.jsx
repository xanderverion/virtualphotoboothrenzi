import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Capture from './pages/Capture';
import Feed from './pages/Feed';
import WeddingBook from './pages/WeddingBook';
import MemoryWall from './pages/MemoryWall';
import BrideGallery from './pages/BrideGallery';
import BrideQR from './pages/BrideQR';
import LoadingScreen from './components/LoadingScreen';
import { AlertProvider } from './contexts/AlertContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AlertProvider>
      <Router>
        {/* Outer wrapper — fills full screen, centers the mobile frame */}
        <div className="h-dvh w-full flex items-center justify-center bg-hairline">
          {/* Mobile-sized frame */}
          <div className="relative h-dvh w-full max-w-[480px] overflow-hidden bg-canvas text-maroon font-inter flex flex-col shadow-2xl">
            <AnimatePresence>
              {isLoading && <LoadingScreen key="loading" onComplete={() => setIsLoading(false)} />}
            </AnimatePresence>

            {/* Konten utama — bisa discroll kalau lebih tinggi dari layar (Home didesain pas tanpa scroll, Capture/Feed boleh scroll) */}
            <main className="flex-1 min-h-0 relative flex flex-col overflow-y-auto no-scrollbar">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/capture" element={<Capture />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/book" element={<WeddingBook />} />
                <Route path="/memory-wall" element={<MemoryWall />} />
                <Route path="/bride" element={<BrideGallery />} />
                <Route path="/bride/qr" element={<BrideQR />} />
              </Routes>
            </main>

            {/* Footer — bagian normal dari layout (bukan absolute), supaya tidak pernah menutupi konten/tombol */}
            <div className="shrink-0 text-center z-[100] bg-canvas/90 backdrop-blur-md py-2 border-t border-maroon/10">
              <p className="text-[10px] text-maroon/70 tracking-wider font-medium">
                Made with love &copy; Renzi
              </p>
            </div>
          </div>
        </div>
      </Router>
    </AlertProvider>
  );
}

export default App;
