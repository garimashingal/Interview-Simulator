"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, FileText, Wand2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { ExtractedSkill, SessionConfig } from "@/types/interview";

const difficultyOptions = [
  { value: "easy", label: "Easy", desc: "Fundamental concepts" },
  { value: "medium", label: "Medium", desc: "Real-world application" },
  { value: "hard", label: "Hard", desc: "FAANG-level depth" },
] as const;

export default function SetupPage() {
  const router = useRouter();
  const [jdText, setJdText] = useState("");
  const [skills, setSkills] = useState<ExtractedSkill[]>([]);
  const [config, setConfig] = useState<SessionConfig>({ difficulty: "medium", questionCount: 5, enableCaptions: true });
  const [step, setStep] = useState<"upload" | "config" | "ready">("upload");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleExtract = async () => {
    if (!jdText.trim()) return;
    setIsExtracting(true);
    setError(null);
    try {
      const res = await fetch("/api/jd/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Extraction failed");
      setSkills(data.skills ?? []);
      setStep("config");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract skills");
    }
    setIsExtracting(false);
  };

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText, skills, config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create session");
      router.push(`/interview/${data.sessionId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start interview");
      setIsStarting(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setJdText(ev.target?.result as string ?? "");
    reader.readAsText(file);
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">New Interview Session</h1>
        <p className="text-slate-400 text-sm mt-1">Upload a Job Description to get started</p>
      </div>

      {/* Step 1: JD Upload */}
      <Card variant="glass" className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step !== "upload" ? "bg-emerald-500 text-white" : "bg-brand-500 text-white"}`}>
            {step !== "upload" ? "✓" : "1"}
          </div>
          <h2 className="font-semibold text-white text-sm">Paste or Upload Job Description</h2>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${isDragging ? "border-brand-500 bg-brand-500/5" : "border-surface-600 hover:border-surface-500"}`}
        >
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here, or drag & drop a .txt file..."
            className="w-full h-40 bg-transparent text-sm text-slate-300 placeholder-slate-600 resize-none focus:outline-none font-mono"
          />
          {isDragging && (
            <div className="absolute inset-0 bg-brand-500/10 rounded-xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-brand-400 animate-bounce" />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{jdText.length} characters</span>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExtract}
            isLoading={isExtracting}
            disabled={jdText.trim().length < 50}
            leftIcon={<Wand2 className="w-3.5 h-3.5" />}
          >
            Extract Skills
          </Button>
        </div>
      </Card>

      {/* Step 2: Skills + Config */}
      {step !== "upload" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Card variant="glass">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === "ready" ? "bg-emerald-500 text-white" : "bg-brand-500 text-white"}`}>2</div>
              <h2 className="font-semibold text-white text-sm">Extracted Skills</h2>
              <span className="text-xs text-slate-500 ml-auto">{skills.length} found</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <Badge key={skill.normalizedName} variant={skill.isNew ? "new" : "brand"}>
                  {skill.normalizedName}
                  {skill.isNew && <span className="text-xs opacity-60"> · new</span>}
                </Badge>
              ))}
            </div>
          </Card>

          <Card variant="glass">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">3</div>
              <h2 className="font-semibold text-white text-sm">Interview Settings</h2>
            </div>

            <div className="space-y-5">
              {/* Difficulty */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {difficultyOptions.map(({ value, label, desc }) => (
                    <button
                      key={value}
                      onClick={() => setConfig((c) => ({ ...c, difficulty: value }))}
                      className={`p-3 rounded-xl border text-left transition-all ${config.difficulty === value ? "border-brand-500 bg-brand-500/10 text-brand-300" : "border-surface-600 text-slate-400 hover:border-surface-500"}`}
                    >
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs opacity-70">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count */}
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Number of Questions: <span className="text-white">{config.questionCount}</span></label>
                <input
                  type="range" min={3} max={10} value={config.questionCount}
                  onChange={(e) => setConfig((c) => ({ ...c, questionCount: +e.target.value }))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1"><span>3</span><span>10</span></div>
              </div>

              {/* Captions toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-slate-300">Live Captions</div>
                  <div className="text-xs text-slate-500">Show real-time speech transcription</div>
                </div>
                <button
                  onClick={() => setConfig((c) => ({ ...c, enableCaptions: !c.enableCaptions }))}
                  className={`w-10 h-5 rounded-full transition-all ${config.enableCaptions ? "bg-brand-500" : "bg-surface-600"}`}
                >
                  <span className={`block w-4 h-4 bg-white rounded-full transition-transform mx-0.5 ${config.enableCaptions ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </Card>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
          )}

          <Button variant="primary" size="lg" onClick={handleStart} isLoading={isStarting} className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
            Start Interview
          </Button>
        </motion.div>
      )}
    </div>
  );
}
