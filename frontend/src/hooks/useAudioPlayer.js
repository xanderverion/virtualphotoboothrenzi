import { useState } from 'react';

export function useAudioPlayer() {
  const [playingId, setPlayingId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const handlePlayAudio = (id, audioUrl) => {
    if (playingId === id && audioElement) {
      audioElement.pause();
      setPlayingId(null);
      return;
    }

    if (audioElement) {
      audioElement.pause();
    }

    const audio = new Audio(audioUrl);

    setAudioProgress(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
    };

    audio.ontimeupdate = () => {
      setAudioCurrentTime(audio.currentTime);
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.play();
    setAudioElement(audio);
    setPlayingId(id);

    audio.onended = () => {
      setPlayingId(null);
      setAudioProgress(0);
      setAudioCurrentTime(0);
    };
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      setPlayingId(null);
    }
    setAudioProgress(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);
  };

  return {
    playingId,
    audioProgress,
    audioCurrentTime,
    audioDuration,
    handlePlayAudio,
    stopAudio
  };
}