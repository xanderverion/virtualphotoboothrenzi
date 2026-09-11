import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FRAMES } from '../constants/frames';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { usePhotoCapture } from '../hooks/usePhotoCapture';
import { useAlert } from '../contexts/AlertContext';

import StepInfo from '../components/capture/StepInfo';
import StepChooseType from '../components/capture/StepChooseType';
import StepCamera from '../components/capture/StepCamera';
import StepVideoCapture from '../components/capture/StepVideoCapture';
import StepWishes from '../components/capture/StepWishes';
import StepVoiceCapture from '../components/capture/StepVoiceCapture';
import StepAudioCaption from '../components/capture/StepAudioCaption';
import StepUploadAndSuccess from '../components/capture/StepUploadAndSuccess';

import { supabase } from '../lib/supabaseClient';

// Tentukan ekstensi file berdasarkan mimeType asli dari Blob audio/video,
// supaya nama file & contentType selalu cocok dengan isi sebenarnya
// (mis. iPhone merekam audio/mp4, Android merekam audio/webm).
const getExtensionFromMime = (mimeType, fallback = 'webm') => {
  if (!mimeType) return fallback;
  if (mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('aac')) return 'aac';
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('webm')) return 'webm';
  return fallback;
};

export default function Capture() {
  const { showAlert } = useAlert();

  // Navigation State
  const [step, setStep] = useState(1);

  // Data State
  const [name, setName] = useState('');
  const [contentType, setContentType] = useState(() => new URLSearchParams(window.location.search).get('type') || null); // null | 'photo' | 'video' | 'voice' | 'wishes'
  const [frameIndex, setFrameIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [message, setMessage] = useState(''); // teks wishes mandiri
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoOrientation, setVideoOrientation] = useState('portrait');
  const [uploading, setUploading] = useState(false);
  const [publishMode, setPublishMode] = useState('public');

  // Refs
  const webcamRef = useRef(null);

  // Custom Hooks
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    clearAudio
  } = useAudioRecorder();

  const {
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
  } = usePhotoCapture(webcamRef);

  const handleVideoNext = (blob, orientation) => {
    setVideoBlob(blob);
    setVideoUrl(URL.createObjectURL(blob));
    setVideoOrientation(orientation || 'portrait');
    setStep(4);
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      const id = Date.now().toString();
      let photoUrl = null;
      let uploadedVideoUrl = null;
      let audioUrl = null;

      // Wishes mandiri: cukup nama + pesan, tidak butuh foto/video/audio.
      if (contentType === 'wishes') {
        if (!name || !message.trim()) {
          showAlert('Nama dan pesan wishes wajib diisi.');
          setUploading(false);
          return;
        }

        const { error: insertError } = await supabase.from('entries').insert({
          id,
          name,
          type: 'wishes',
          frame: FRAMES[0].id,
          caption: message.trim(),
          photo_url: '',
          video_url: '',
          audio_url: '',
          is_public: publishMode === 'public',
          timestamp: new Date().toISOString(),
        });

        if (insertError) throw insertError;
        setStep(5);
        return;
      }

      // Upload foto ke Supabase Storage (flow foto)
      if (contentType === 'photo' && photoSrc) {
        const res = await fetch(photoSrc);
        const blob = await res.blob();
        const photoPath = `photo-${id}.jpg`;

        const { error: photoError } = await supabase.storage
          .from('Photos')
          .upload(photoPath, blob, { contentType: 'image/jpeg' });

        if (photoError) throw photoError;

        const { data: photoPublicUrl } = supabase.storage
          .from('Photos')
          .getPublicUrl(photoPath);

        photoUrl = photoPublicUrl.publicUrl;
      }

      // Upload video ke Supabase Storage (flow video) — bucket 'Videos'
      // harus dibuat dulu di Supabase Storage dengan akses publik seperti 'Photos'.
      if (contentType === 'video' && videoBlob) {
        const mimeType = videoBlob.type || 'video/webm';
        const ext = getExtensionFromMime(mimeType, 'webm');
        const videoPath = `video-${id}.${ext}`;

        const { error: videoError } = await supabase.storage
          .from('Videos')
          .upload(videoPath, videoBlob, { contentType: mimeType });

        if (videoError) throw videoError;

        const { data: videoPublicUrl } = supabase.storage
          .from('Videos')
          .getPublicUrl(videoPath);

        uploadedVideoUrl = videoPublicUrl.publicUrl;
      }

      // Upload audio ke Supabase Storage.
      // Untuk contentType === 'voice', ini JUGA konten utamanya (wajib ada,
      // divalidasi di bawah). Untuk foto & video, audio ini opsional (caption suara).
      if (audioBlob) {
        const mimeType = audioBlob.type || 'audio/webm';
        const ext = getExtensionFromMime(mimeType, 'webm');
        const audioPath = `audio-${id}.${ext}`;

        const { error: audioError } = await supabase.storage
          .from('Audio')
          .upload(audioPath, audioBlob, { contentType: mimeType });

        if (audioError) throw audioError;

        const { data: audioPublicUrl } = supabase.storage
          .from('Audio')
          .getPublicUrl(audioPath);

        audioUrl = audioPublicUrl.publicUrl;
      }

      if (
        !name ||
        (contentType === 'photo' && !photoUrl) ||
        (contentType === 'video' && !uploadedVideoUrl) ||
        (contentType === 'voice' && !audioUrl)
      ) {
        showAlert('Nama dan konten wajib diisi.');
        setUploading(false);
        return;
      }

      // Insert row ke tabel entries
      const { error: insertError } = await supabase.from('entries').insert({
        id,
        name,
        type: contentType,
        frame: contentType === 'photo' ? FRAMES[frameIndex].id : (contentType === 'video' ? videoOrientation : FRAMES[0].id),
        caption: caption || '',
        photo_url: photoUrl || '',
        video_url: uploadedVideoUrl || '',
        audio_url: audioUrl || '',
        is_public: publishMode === 'public',
        timestamp: new Date().toISOString(),
      });

      if (insertError) throw insertError;

      setStep(5);
    } catch (err) {
      console.error(err);
      showAlert('Terjadi kesalahan saat mengunggah.');
    } finally {
      setUploading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 }
  };

  // Photo memiliki step tambahan (preview), sedangkan yang lain langsung ke publish
  const progressSteps =
    contentType === 'photo' ? [1, 2, 3, 4] : [1, 2, 4];

  const activeStep = (step === 2 && contentType === 'photo' && showConfirmDialog) ? 3 : step;

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full mx-auto p-4 relative">
      {/* Progress Bars */}
      {step < 5 && (step !== 1 || contentType) && (
        <div className="flex gap-2 mb-2 mt-4 relative z-10 w-full">
          {progressSteps.map((i) => (
            <div key={i} className="h-1 flex-1 rounded-full overflow-hidden bg-maroon/20">
              <div
                className={`h-full transition-all duration-500 ease-out ${i <= activeStep ? 'bg-maroon' : 'bg-transparent'}`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex-1 relative flex items-center justify-center py-4">
        <AnimatePresence mode="wait">
          {step === 1 && !contentType && (
            <StepChooseType
              onSelect={(type) => setContentType(type)}
              pageVariants={pageVariants}
            />
          )}

          {step === 1 && contentType && (
            <StepInfo
              name={name}
              setName={setName}
              contentType={contentType}
              setContentType={setContentType}
              frameIndex={frameIndex}
              setFrameIndex={setFrameIndex}
              onNext={() => setStep(2)}
              onBack={() => setContentType(null)}
              pageVariants={pageVariants}
            />
          )}

          {step === 2 && contentType === 'photo' && (
            <StepCamera
              frameIndex={frameIndex}
              webcamRef={webcamRef}
              photoSrc={photoSrc}
              capturedPhotos={capturedPhotos}
              showConfirmDialog={showConfirmDialog}
              flashKey={flashKey}
              captureToast={captureToast}
              isDeveloping={isDeveloping}
              handleCapture={handleCapture}
              proceedToConfirm={proceedToConfirm}
              retakePhoto={retakePhoto}
              confirmPhoto={() => {
                confirmPhoto();
                setStep(4);
              }}
              onBack={() => setStep(1)}
              pageVariants={pageVariants}
            />
          )}

          {step === 2 && contentType === 'video' && (
            <StepVideoCapture
              onNext={handleVideoNext}
              onBack={() => setStep(1)}
              pageVariants={pageVariants}
            />
          )}

          {step === 2 && contentType === 'wishes' && (
            <StepWishes
              message={message}
              setMessage={setMessage}
              onNext={() => setStep(4)}
              onBack={() => setStep(1)}
              pageVariants={pageVariants}
            />
          )}

          {step === 2 && contentType === 'voice' && (
            <StepVoiceCapture
              audioBlob={audioBlob}
              isRecording={isRecording}
              recordingTime={recordingTime}
              startRecording={startRecording}
              stopRecording={stopRecording}
              clearAudio={clearAudio}
              caption={caption}
              setCaption={setCaption}
              onNext={() => setStep(4)}
              onBack={() => setStep(1)}
              pageVariants={pageVariants}
            />
          )}

          {/* Step 3 (Audio Caption) dihilangkan agar langsung ke Step 4 */}

          {(step === 4 || step === 5) && (
            <StepUploadAndSuccess
              step={step}
              uploading={uploading}
              handleUpload={handleUpload}
              onBack={() => {
                if (contentType === 'photo') {
                  setShowConfirmDialog(true);
                }
                setStep(2);
              }}
              pageVariants={pageVariants}
              contentType={contentType}
              photoSrc={photoSrc}
              videoUrl={videoUrl}
              videoOrientation={videoOrientation}
              name={name}
              setName={setName}
              caption={caption}
              setCaption={setCaption}
              message={message}
              publishMode={publishMode}
              setPublishMode={setPublishMode}
              audioBlob={audioBlob}
              isRecording={isRecording}
              recordingTime={recordingTime}
              startRecording={startRecording}
              stopRecording={stopRecording}
              clearAudio={clearAudio}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}