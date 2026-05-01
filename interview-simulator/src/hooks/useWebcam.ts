"use client";
import { useEffect, useRef, useState, useCallback } from "react";

interface UseWebcamReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  isActive: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  error: string | null;
  startWebcam: () => Promise<void>;
  stopWebcam: () => void;
  toggleMute: () => void;
  toggleCamera: () => void;
}

export function useWebcam(): UseWebcamReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startWebcam = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: true,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setIsActive(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Camera/mic access denied");
    }
  }, []);

  const stopWebcam = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current = null;
    setStream(null);
    setIsActive(false);
  }, []);

  const toggleMute = useCallback(() => {
    const audioTracks = streamRef.current?.getAudioTracks() ?? [];
    audioTracks.forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((prev) => !prev);
  }, []);

  const toggleCamera = useCallback(() => {
    const videoTracks = streamRef.current?.getVideoTracks() ?? [];
    videoTracks.forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((prev) => !prev);
  }, []);

  useEffect(() => () => stopWebcam(), [stopWebcam]);

  return { videoRef, stream, isActive, isMuted, isCameraOff, error, startWebcam, stopWebcam, toggleMute, toggleCamera };
}
