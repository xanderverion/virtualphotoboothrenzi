import { useState, useRef, useCallback, useEffect } from 'react';
import { generateCompositedImage } from '../utils/imageComposite';
import { FRAMES } from '../constants/frames';

export function usePhotoCapture(webcamRef) {
  const [photoSrc, setPhotoSrc] = useState(null);
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [captureToast, setCaptureToast] = useState(null);
  const [isDeveloping, setIsDeveloping] = useState(false);

  const toastTimerRef = useRef(null);
  const developTimerRef = useRef(null);

  const startDeveloping = () => {
    setIsDeveloping(true);
    if (developTimerRef.current) clearTimeout(developTimerRef.current);
    developTimerRef.current = setTimeout(() => setIsDeveloping(false), 3100);
  };

  useEffect(() => {
    return () => {
      if (developTimerRef.current) clearTimeout(developTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const triggerFlash = () => setFlashKey((k) => k + 1);

  const showCaptureToastMsg = (message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setCaptureToast(message);
    toastTimerRef.current = setTimeout(() => setCaptureToast(null), 1600);
  };

  // Mengambil satu foto dan menyimpannya sebagai thumbnail preview.
  // TIDAK langsung membuat composite / masuk ke layar konfirmasi —
  // itu hanya terjadi saat user menekan tombol konfirmasi (proceedToConfirm).
  //
  // `mirror` dicatat PER FOTO (bukan sekali untuk seluruh sesi) supaya user
  // bebas ganti kamera depan/belakang di antara jepretan untuk frame Double
  ///Triple — mis. foto 1 pakai kamera depan, foto 2 pakai kamera belakang —
  // dan tiap foto tetap di-flip dengan benar saat composite nanti.
  const handleCapture = useCallback((frameIndex, mirror = true) => {
    if (!webcamRef.current) return;
    const currentFrame = FRAMES[frameIndex];

    // Cegah pengambilan foto melebihi jumlah yang dibutuhkan frame
    if (capturedPhotos.length >= currentFrame.maxPhotos) return;

    const imageSrc = webcamRef.current.getScreenshot();
    triggerFlash();

    const newPhotos = [...capturedPhotos, { src: imageSrc, mirror }];
    setCapturedPhotos(newPhotos);
    showCaptureToastMsg(`Foto ${newPhotos.length} berhasil diambil!`);
  }, [webcamRef, capturedPhotos]);

  // Dipanggil saat user menekan tombol "Gunakan Foto Ini" setelah semua
  // foto yang dibutuhkan frame sudah diambil. Baru di sinilah composite
  // dibuat dan layar konfirmasi/print ditampilkan.
  //
  // Info mirror sudah menempel di masing-masing capturedPhotos (lihat
  // handleCapture), jadi compositor tinggal membaca flag mirror milik
  // tiap foto sendiri-sendiri — tidak perlu lagi satu flag global di sini.
  const proceedToConfirm = useCallback((frameIndex) => {
    const currentFrame = FRAMES[frameIndex];
    if (capturedPhotos.length < currentFrame.maxPhotos) return;

    setShowConfirmDialog(true);
    startDeveloping();
    generateCompositedImage(capturedPhotos, currentFrame, (compositedSrc) => {
      setPhotoSrc(compositedSrc);
    });
  }, [capturedPhotos]);

  const retakePhoto = () => {
    setPhotoSrc(null);
    setCapturedPhotos([]);
    setShowConfirmDialog(false);
  };

  const confirmPhoto = () => {
    setShowConfirmDialog(false);
  };

  return {
    photoSrc,
    capturedPhotos,
    showConfirmDialog,
    flashKey,
    captureToast,
    isDeveloping,
    handleCapture,
    proceedToConfirm,
    retakePhoto,
    confirmPhoto,
    setShowConfirmDialog
  };
}