import { useState, useRef, useEffect } from 'react';
import { useAlert } from '../contexts/AlertContext';

// Pilih mimeType terbaik yang benar-benar didukung browser saat ini.
// iOS Safari umumnya hanya mendukung audio/mp4, Chrome/Android mendukung audio/webm.
const getSupportedMimeType = () => {
  const candidates = [
    'audio/mp4',
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/aac',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

export function useAudioRecorder() {
  const { showAlert } = useAlert();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const mimeTypeRef = useRef('');

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      mimeTypeRef.current = mimeType;

      const mediaRecorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Gunakan mimeType ASLI yang dipakai recorder (bukan hardcode),
        // supaya Blob benar-benar cocok dengan isinya di semua device.
        const actualType =
          mediaRecorder.mimeType || mimeTypeRef.current || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualType });
        setAudioBlob(blob);
        clearInterval(timerRef.current);
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      showAlert("Tidak dapat mengakses mikrofon. Pastikan Anda telah memberikan izin mikrofon pada browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const clearAudio = () => {
    setAudioBlob(null);
  };

  // Cleanup: kalau komponen unmount (mis. user menekan tombol "Kembali" atau
  // pindah step/route) SAAT masih merekam, hentikan MediaRecorder + semua
  // track mic secara paksa. Tanpa ini, stream mic bisa tetap aktif di
  // background walau UI-nya sudah tidak ada (indikator "mic in use" browser
  // tidak hilang, dan rekaman berikutnya bisa tabrakan dengan stream lama).
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.stop();
        recorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    clearAudio
  };
}