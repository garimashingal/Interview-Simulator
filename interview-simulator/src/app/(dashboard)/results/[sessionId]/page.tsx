"use client";
import { useSearchParams } from "next/navigation";
import { useMemo, Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Star, ArrowLeft, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import type { EvaluationResult } from "@/types/evaluation";

function ScoreRing({ score }: { score: number }) {
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 10) * circ;
  const color = score >= 8 ? "#10b981" : score >= 6 ? "#6366f1" : score >= 4 ? "#f59e0b" : "#ef4444";

  return (
    <svg width="140" height="140" className="-rotate-90">
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e293b" strokeWidth="10" />
      <circle
        cx="70" cy="70" r={radius} fill="none"
        stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="score-ring"
        style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
      />
      <text x="70" y="70" textAnchor="middle" dominantBaseline="middle" className="rotate-90" style={{ fontSize: "28px", fontWeight: 700, fill: "white", transform: "rotate(90deg)", transformOrigin: "70px 70px" }}>
        {score}
      </text>
      <text x="70" y="88" textAnchor="middle" className="rotate-90" style={{ fontSize: "11px", fill: "#94a3b8", transform: "rotate(90deg)", transformOrigin: "70px 70px" }}>
        /10
      </text>
    </svg>
  );
}

function QuestionCard({ result, index }: { result: EvaluationResult; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = result.score >= 8 ? "success" : result.score >= 6 ? "brand" : result.score >= 4 ? "warning" : "danger";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card variant="bordered" padding="md">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-700 flex items-center justify-center text-xs text-slate-400 font-semibold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium leading-relaxed mb-3">{result.question}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={scoreColor}>Score: {result.score}/10</Badge>
              <Badge variant="success">{result.strengths.length} strengths</Badge>
              {result.missedConcepts.length > 0 && (
                <Badge variant="warning">{result.missedConcepts.length} missed</Badge>
              )}
            </div>
          </div>
          <button onClick={() => setExpanded((e) => !e)} className="flex-shrink-0 text-slate-500 hover:text-white transition-colors p-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-4 space-y-4 border-t border-surface-700 pt-4">
            {/* Your answer */}
            <div>
              <p className="text-xs text-slate-500 mb-2">Your Answer</p>
              <p className="text-slate-400 text-sm font-mono bg-surface-900/50 rounded-xl p-3 leading-relaxed">{result.transcript}</p>
            </div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" />Strengths</p>
                <ul className="space-y-1">
                  {result.strengths.map((s, i) => <li key={i} className="text-emerald-300 text-sm flex items-start gap-2"><span className="text-emerald-500 mt-0.5">✓</span>{s}</li>)}
                </ul>
              </div>
            )}

            {/* Missed concepts */}
            {result.missedConcepts.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><XCircle className="w-3 h-3 text-amber-400" />Missed Concepts</p>
                <ul className="space-y-1">
                  {result.missedConcepts.map((m, i) => <li key={i} className="text-amber-300 text-sm flex items-start gap-2"><span className="text-amber-500 mt-0.5">✗</span>{m}</li>)}
                </ul>
              </div>
            )}

            {/* Refined answer */}
            <div>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Lightbulb className="w-3 h-3 text-brand-400" />Refined Perfect Answer</p>
              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 text-sm text-slate-300 leading-relaxed">{result.refinedAnswer}</div>
            </div>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const evalsRaw = searchParams.get("evals");
  const evaluations: EvaluationResult[] = useMemo(() => {
    try { return evalsRaw ? JSON.parse(decodeURIComponent(evalsRaw)) : []; }
    catch { return []; }
  }, [evalsRaw]);

  const avgScore = evaluations.length
    ? Math.round(evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length)
    : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />Back to Dashboard
      </Link>

      {/* Overall score */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Card variant="highlight" className="text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-brand-300 text-sm font-medium">
              <Star className="w-4 h-4" />Interview Complete
            </div>
            <ScoreRing score={avgScore} />
            <div>
              <p className="text-white font-bold text-2xl">Overall Score</p>
              <p className="text-slate-400 text-sm mt-1">
                {avgScore >= 8 ? "Excellent! You're interview-ready." : avgScore >= 6 ? "Good effort — review the missed concepts." : "Keep practicing to improve your depth."}
              </p>
            </div>
            <div className="flex gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-white">{evaluations.length}</p>
                <p className="text-xs text-slate-500">Questions</p>
              </div>
              <div className="w-px bg-surface-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-400">{evaluations.reduce((s, e) => s + e.strengths.length, 0)}</p>
                <p className="text-xs text-slate-500">Strengths</p>
              </div>
              <div className="w-px bg-surface-600" />
              <div>
                <p className="text-2xl font-bold text-amber-400">{evaluations.reduce((s, e) => s + e.missedConcepts.length, 0)}</p>
                <p className="text-xs text-slate-500">Missed</p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Per-question breakdown */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Question Breakdown</h2>
        <div className="space-y-3">
          {evaluations.length > 0
            ? evaluations.map((e, i) => <QuestionCard key={i} result={e} index={i} />)
            : <p className="text-slate-500 text-sm">No evaluations recorded.</p>
          }
        </div>
      </div>

      <div className="flex gap-3">
        <Link href="/interview/setup" className="flex-1">
          <Button variant="primary" className="w-full">Practice Again</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-sm">Loading results…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
