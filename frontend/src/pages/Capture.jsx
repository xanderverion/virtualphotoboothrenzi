import { useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";
import { FRAMES } from "../constants/frames";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { usePhotoCapture } from "../hooks/usePhotoCapture";
import { useAlert } from "../contexts/AlertContext";

import StepInfo from "../components/capture/StepInfo";
import StepChooseType from "../components/capture/StepChooseType";
import StepCamera from "../components/capture/StepCamera";
import StepVideoCapture from "../components/capture/StepVideoCapture";
import StepWishes from "../components/capture/StepWishes";
import StepVoiceCapture from "../components/capture/StepVoiceCapture";
import StepUploadAndSuccess from "../components/capture/StepUploadAndSuccess";

// Set URL API lu di .env (contoh: VITE_API_URL=https://api.domain.com)
const API_URL = import.meta.env.VITE_API_URL;

const cleanBlob = (blob) =>
  new Blob([blob], { type: (blob.type || "").split(";")[0].trim() });

export default function Capture() {
  const { showAlert } = useAlert();

  // Navigation State
  const [step, setStep] = useState(1);

  // Data State
  const [name, setName] = useState("");
  const [contentType, setContentType] = useState(
    () => new URLSearchParams(window.location.search).get("type") || null,
  ); // null | 'photo' | 'video' | 'voice' | 'wishes'
  const [frameIndex, setFrameIndex] = useState(0);
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState(""); // teks wishes mandiri
  const [videoBlob, setVideoBlob] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoOrientation, setVideoOrientation] = useState("portrait");
  const [uploading, setUploading] = useState(false);
  const [publishMode, setPublishMode] = useState("public");

  // Refs
  const webcamRef = useRef(null);

  // Custom Hooks
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    clearAudio,
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
    setShowConfirmDialog,
  } = usePhotoCapture(webcamRef);

  const handleVideoNext = (blob, orientation) => {
    setVideoBlob(blob);
    setVideoUrl(URL.createObjectURL(blob));
    setVideoOrientation(orientation || "portrait");
    setStep(4);
  };

  const handleUpload = async () => {
    if (!name.trim()) {
      showAlert("Nama wajib diisi.");
      return;
    }

    // Wishes mandiri: cukup nama + pesan, tidak butuh foto/video/audio.
    if (contentType === "wishes" && !message.trim()) {
      showAlert("Nama dan pesan wishes wajib diisi.");
      return;
    }

    // // Media utama wajib ada sesuai tipe konten
    // if (
    //   (contentType === "photo" && !photoSrc) ||
    //   (contentType === "video" && !videoBlob) ||
    //   (contentType === "voice" && !audioBlob)
    // ) {
    //   showAlert("Konten belum lengkap, silakan ulangi pengambilan.");
    //   return;
    // }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("name", name.trim());
      form.append("type", contentType);
      form.append("is_public", publishMode === "public");

      if (contentType === "wishes") {
        form.append("frame", FRAMES[0].id);
        form.append("caption", message.trim());
      } else {
        form.append(
          "frame",
          contentType === "photo"
            ? FRAMES[frameIndex].id
            : contentType === "video"
              ? videoOrientation
              : FRAMES[0].id,
        );
        form.append("caption", caption || "");
      }

      // Foto (flow foto)
      if (contentType === "photo" && photoSrc) {
        const blob = await (await fetch(photoSrc)).blob();
        form.append("photo", blob, "photo.jpg");
      }

      // Video (flow video)
      if (contentType === "video" && videoBlob) {
        form.append("video", cleanBlob(videoBlob), "video");
      }

      // Audio: konten utama untuk 'voice', opsional (caption suara) untuk foto & video
      if (contentType !== "wishes" && audioBlob) {
        form.append("audio", audioBlob, "audio");
      }

      // Jangan set Content-Type manual, axios + browser otomatis isi boundary-nya
      await axios.post(`${API_URL}/event-services/v1/entries`, form, {
        timeout: 120000, // video bisa lama di koneksi lambat
      });

      setStep(5);
    } catch (err) {
      console.error(err);
      const serverMessage = err.response?.data?.message;
      showAlert(serverMessage || "Terjadi kesalahan saat mengunggah.");
    } finally {
      setUploading(false);
    }
  };

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -20 },
  };

  // Photo memiliki step tambahan (preview), sedangkan yang lain langsung ke publish
  const progressSteps = contentType === "photo" ? [1, 2, 3, 4] : [1, 2, 4];

  const activeStep =
    step === 2 && contentType === "photo" && showConfirmDialog ? 3 : step;

  return (
    <div className="flex-1 min-h-0 flex flex-col w-full mx-auto p-4 relative">
      {/* Progress Bars */}
      {step < 5 && (step !== 1 || contentType) && (
        <div className="flex gap-2 mb-2 mt-4 relative z-10 w-full">
          {progressSteps.map((i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full overflow-hidden bg-maroon/20"
            >
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  i <= activeStep ? "bg-maroon" : "bg-transparent"
                }`}
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

          {step === 2 && contentType === "photo" && (
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

          {step === 2 && contentType === "video" && (
            <StepVideoCapture
              onNext={handleVideoNext}
              onBack={() => setStep(1)}
              pageVariants={pageVariants}
            />
          )}

          {step === 2 && contentType === "wishes" && (
            <StepWishes
              message={message}
              setMessage={setMessage}
              onNext={() => setStep(4)}
              onBack={() => setStep(1)}
              pageVariants={pageVariants}
            />
          )}

          {step === 2 && contentType === "voice" && (
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
                if (contentType === "photo") {
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
