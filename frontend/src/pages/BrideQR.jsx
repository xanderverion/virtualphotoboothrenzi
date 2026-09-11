import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GradientPill } from '../components/GsapKit';
import { useAlert } from '../contexts/AlertContext';

export default function BrideQR() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  // Dapatkan URL saat ini tapi diganti belakangnya jadi /bride
  const brideUrl = `${window.location.origin}/bride`;
  // URL untuk generate QR code via API gratis
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(brideUrl)}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'bride-private-gallery-qr.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      showAlert('Gagal mengunduh QR Code.');
    }
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-[#2a1a1f] relative">
      <div className="p-6">
        <button
          onClick={() => navigate('/bride')}
          className="w-10 h-10 flex items-center justify-center text-[#e4d5b7] bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12 text-center -mt-10">
        <div className="bg-white p-6 rounded-3xl shadow-xl mb-8">
          <img 
            src={qrCodeUrl} 
            alt="QR Code Bride Gallery" 
            className="w-48 h-48 sm:w-64 sm:h-64 object-contain"
            crossOrigin="anonymous"
          />
        </div>

        <h1 className="text-3xl font-heading font-bold text-[#e4d5b7] mb-3">
          QR Code Pengantin
        </h1>
        <p className="text-[#e4d5b7]/70 text-sm max-w-[280px] mb-10 leading-relaxed">
          Simpan QR Code ini. Pengantin dapat memindainya (scan) kapan saja untuk masuk ke <strong>Private Gallery</strong> tanpa perlu login.
        </p>

        <GradientPill onClick={handleDownload} className="w-full max-w-[260px] py-4 text-lg">
          <Download className="w-5 h-5 mr-2" />
          Simpan QR Code
        </GradientPill>
      </div>
    </div>
  );
}
