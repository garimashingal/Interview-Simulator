"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ChevronRight, Brain } from "lucide-react";
import { useWebSpeech } from "@/hooks/useWebSpeech";
import { useWebcam } from "@/hooks/useWebcam";
import { useInterviewStore } from "@/store/interviewStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";

export default function InterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const {
    session, currentQuestion, currentQuestionIndex,
    setSession, nextQuestion, addAnswer, setIsLoading,
    captions, setCaptions, isSpeaking, setIsSpeaking, isListening, setIsListening,
  } = useInterviewStore();

  const [phase, setPhase] = useState<"loading" | "speaking" | "listening" | "thinking" | "done">("loading");
  const [transcript, setTranscript] = useState("");
  const [evaluations, setEvaluations] = useState<Record<string, unknown>[]>([]);
  const answerStartRef = useRef<number>(Date.now());

  const { videoRef, isActive, isMuted, isCameraOff, startWebcam, toggleMute, toggleCamera } = useWebcam();

  const { speak, cancelSpeech, startListening, stopListening, isSupported } = useWebSpeech({
    onInterimResult: (text) => setCaptions(text),
    onFinalResult: (text) => setTranscript((prev) => prev + " " + text),
  });

  // 1. Load session on mount
  useEffect(() => {
    async function loadSession() {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      if (data.session) {
        setSession(data.session);
        setPhase("speaking");
      }
    }
    loadSession();
    startWebcam();
  }, [sessionId]); // eslint-disable-line

  // 2. When question changes, speak it
  useEffect(() => {
    if (!currentQuestion || phase !== "speaking") return;
    setIsSpeaking(true);
    speak(currentQuestion.question, () => {
      setIsSpeaking(false);
      setPhase("listening");
      setTranscript("");
      setCaptions("");
      answerStartRef.current = Date.now();
      startListening();
    });
  }, [currentQuestion, phase]); // eslint-disable-line

  // 3. Submit answer
  const handleSubmitAnswer = async () => {
    stopListening();
    setPhase("thinking");
    const durationSecs = Math.round((Date.now() - answerStartRef.current) / 1000);
    const finalText = transcript.trim();

    addAnswer({
      questionId: currentQuestion!._id,
      question: currentQuestion!.question,
      transcript: finalText,
      durationSecs,
      recordedAt: new Date().toISOString(),
    });

    // Evaluate via API
    const evalRes = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion!._id, transcript: finalText, sessionId }),
    });
    const evalData = await evalRes.json();
    if (evalData.evaluation) setEvaluations((prev) => [...prev, evalData.evaluation]);

    // Check if last question
    const isLast = currentQuestionIndex >= (session?.questions.length ?? 0) - 1;
    if (isLast) {
      await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      router.push(`/results/${sessionId}?evals=${encodeURIComponent(JSON.stringify(evaluations))}`);
    } else {
      nextQuestion();
      setPhase("speaking");
    }
  };

  const handleEndEarly = async () => {
    cancelSpeech();
    stopListening();
    await fetch(`/api/sessions/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    router.push(`/dashboard`);
  };

  const totalQuestions = session?.questions.length ?? 0;
  const progress = totalQuestions ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Progress bar */}
      <div className="w-full h-1 bg-surface-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-500 to-accent-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Question <span className="text-white font-semibold">{currentQuestionIndex + 1}</span> of {totalQuestions}</span>
        <Badge variant={phase === "listening" ? "accent" : phase === "speaking" ? "brand" : "neutral"} dot>
          {phase === "loading" ? "Loading…" : phase === "speaking" ? "AI Speaking" : phase === "listening" ? "Your Turn" : phase === "thinking" ? "Evaluating…" : "Done"}
        </Badge>
      </div>

      {/* Main: Video feeds */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* AI Interviewer */}
        <div className="relative rounded-2xl overflow-hidden bg-surface-800 flex items-center justify-center border border-surface-700">
          <div className={`relative ${isSpeaking ? "pulse-ring" : ""}`}>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-glow-brand">
              <Brain className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3">
            <div className="glass rounded-xl px-3 py-2 text-xs text-slate-300 text-center">
              AI Interviewer {isSpeaking ? "— speaking…" : ""}
            </div>
          </div>
        </div>

        {/* User webcam */}
        <div className="relative rounded-2xl overflow-hidden bg-surface-800 border border-surface-700">
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
              Camera off
            </div>
          )}
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          {isCameraOff && (
            <div className="absolute inset-0 bg-surface-800 flex items-center justify-center">
              <VideoOff className="w-10 h-10 text-slate-600" />
            </div>
          )}
        </div>
      </div>

      {/* Current question */}
      <AnimatePresence mode="wait">
        {currentQuestion && (
          <motion.div
            key={currentQuestion._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl p-5 border border-white/10"
          >
            <div className="flex items-start gap-3">
              <Badge variant="brand" className="flex-shrink-0 mt-0.5">Q{currentQuestionIndex + 1}</Badge>
              <p className="text-white font-medium text-sm leading-relaxed">{currentQuestion.question}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live captions */}
      {captions && phase === "listening" && (
        <div className="glass rounded-xl px-4 py-2.5 border border-white/5">
          <p className="caption-text">{captions}</p>
        </div>
      )}

      {/* Control bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-xl border transition-all ${isMuted ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-surface-700 border-surface-600 text-slate-300 hover:text-white"}`}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-xl border transition-all ${isCameraOff ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-surface-700 border-surface-600 text-slate-300 hover:text-white"}`}
          >
            {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex gap-2">
          {phase === "listening" && (
            <Button variant="primary" size="md" onClick={handleSubmitAnswer} rightIcon={<ChevronRight className="w-4 h-4" />}>
              Submit Answer
            </Button>
          )}
          {phase === "thinking" && <Spinner />}
          <Button variant="danger" size="md" onClick={handleEndEarly} leftIcon={<PhoneOff className="w-4 h-4" />}>
            End
          </Button>
        </div>
      </div>
    </div>
  );
}
