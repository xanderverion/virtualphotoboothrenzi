import { useState, useRef, useCallback, useEffect } from 'react';

// Bitrate audio eksplisit. Tanpa ini, browser (terutama Chrome-based)
// sering pakai default yang cukup rendah (~24-32kbps Opus) — jauh di
// bawah kualitas wajar untuk suara ucapan — sehingga hasil rekaman
// terdengar berdesir/kurang jernih. 128kbps adalah bitrate standar untuk
// voice recording yang jernih tanpa bikin file jadi terlalu besar.
const AUDIO_BITS_PER_SECOND = 128_000;

// Batas bitrate video minimal & maksimal yang masuk akal untuk rekaman
// wajah/ucapan (bukan konten gerak cepat seperti olahraga).
const MIN_VIDEO_BITRATE = 4_000_000;
const MAX_VIDEO_BITRATE = 10_000_000;
// Perkiraan "bit per piksel per frame" yang wajar untuk video wajah/ucapan
// gerakan sedang, di codec VP8/VP9/H.264 kualitas medium-tinggi.
const BITS_PER_PIXEL_PER_FRAME = 0.12;

// videoConstraints.width/height di StepVideoCapture.jsx cuma "ideal" (hint),
// bukan batas keras — HP sering tetap memberi resolusi kamera JAUH lebih
// tinggi dari yang diminta. Kalau videoBitsPerSecond di-hardcode rendah
// (mis. 2.5Mbps) sementara resolusi aktual tinggi, hasil encode jadi
// blocky/pecah terutama saat ada gerakan — walau live preview (stream
// mentah, tidak terkompresi) terlihat normal-normal saja. Makanya bitrate
// dihitung DINAMIS dari resolusi & frame rate aktual yang device benar-benar
// berikan (track.getSettings()), bukan angka tetap.
const computeVideoBitrate = (stream) => {
  const [videoTrack] = stream.getVideoTracks();
  const settings = videoTrack?.getSettings?.() || {};
  const width = settings.width || 1280;
  const height = settings.height || 720;
  const frameRate = settings.frameRate || 30;

  const estimated = width * height * frameRate * BITS_PER_PIXEL_PER_FRAME;
  const bitrate = Math.min(MAX_VIDEO_BITRATE, Math.max(MIN_VIDEO_BITRATE, Math.round(estimated)));

  console.log(`[useVideoRecorder] recording ${width}x${height}@${frameRate}fps -> videoBitsPerSecond=${bitrate}`);
  return bitrate;
};

// Batas durasi video ucapan, mengikuti konvensi "video 10 detik" di brief.
const MAX_DURATION = 30;

// Pilih mimeType terbaik yang benar-benar didukung browser saat ini,
// sama pendekatannya dengan useAudioRecorder.js.
const getSupportedMimeType = () => {
  const candidates = [
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

/**
 * useVideoRecorder — merekam video+audio dari sebuah MediaStream yang sudah
 * aktif (biasanya stream dari <Webcam audio /> lewat onUserMedia). Otomatis
 * berhenti saat mencapai MAX_DURATION.
 *
 * @param {React.RefObject<MediaStream>} streamRef - ref yang menyimpan stream aktif
 */
export function useVideoRecorder(streamRef) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const mimeTypeRef = useRef('');
  // Simpan videoUrl terbaru di ref juga, supaya cleanup effect (yang cuma
  // jalan sekali saat mount/unmount) selalu bisa revoke URL yang BENAR-BENAR
  // terakhir dibuat, bukan closure lama dari render pertama.
  const videoUrlRef = useRef(null);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
  }, []);

  const startRecording = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;

    const mimeType = getSupportedMimeType();
    mimeTypeRef.current = mimeType;

    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: AUDIO_BITS_PER_SECOND,
      videoBitsPerSecond: computeVideoBitrate(stream),
    });
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const actualType = recorder.mimeType || mimeTypeRef.current || 'video/webm';
      const blob = new Blob(chunksRef.current, { type: actualType });
      const url = URL.createObjectURL(blob);
      setVideoBlob(blob);
      setVideoUrl(url);
      videoUrlRef.current = url;
      setRecordingTime(0);
    };

    recorder.start();
    setIsRecording(true);
    setRecordingTime(0);

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        const next = prev + 1;
        if (next >= MAX_DURATION) {
          // Panggil langsung lewat ref, bukan stopRecording() (closure lama)
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          setIsRecording(false);
          clearInterval(timerRef.current);
          return MAX_DURATION;
        }
        return next;
      });
    }, 1000);
  }, [streamRef]);

  const clearVideo = useCallback(() => {
    if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    videoUrlRef.current = null;
    setVideoBlob(null);
    setVideoUrl(null);
    setRecordingTime(0);
  }, []);

  // Cleanup: kalau komponen unmount SAAT masih merekam (mis. user menekan
  // "Kembali" di tengah rekaman video), hentikan MediaRecorder secara paksa
  // supaya tidak nyangkut jalan di background, lalu revoke object URL
  // terakhir yang pernah dibuat supaya tidak bocor memory.
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
      }
      if (videoUrlRef.current) URL.revokeObjectURL(videoUrlRef.current);
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    maxDuration: MAX_DURATION,
    videoBlob,
    videoUrl,
    startRecording,
    stopRecording,
    clearVideo,
  };
}