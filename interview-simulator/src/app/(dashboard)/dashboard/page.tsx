"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Clock, CheckCircle, TrendingUp, Brain, ArrowRight, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface SessionSummary {
  _id: string;
  status: string;
  difficulty: string;
  questionCount: number;
  extractedSkills: { normalizedName: string }[];
  createdAt: string;
  completedAt?: string;
}

const statCards = [
  { label: "Sessions", icon: Brain, value: "—", color: "text-brand-400" },
  { label: "Avg Score", icon: TrendingUp, value: "—", color: "text-emerald-400" },
  { label: "Completed", icon: CheckCircle, value: "—", color: "text-accent-400" },
  { label: "Practice Time", icon: Clock, value: "—", color: "text-amber-400" },
];

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((d) => { setSessions(d.sessions ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const completed = sessions.filter((s) => s.status === "completed").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Track your interview progress</p>
        </div>
        <Link href="/interview/setup">
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
            New Interview
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, icon: Icon, value, color }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="glass" padding="md">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-2xl font-bold ${color}`}>
                {label === "Completed" ? completed : label === "Sessions" ? sessions.length : value}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Start */}
      <Card variant="highlight" padding="lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <Brain className="w-6 h-6 text-brand-400 animate-pulse-slow" />
            </div>
            <div>
              <p className="font-semibold text-white">Ready for your next interview?</p>
              <p className="text-slate-400 text-sm">Upload a JD and start a voice-first AI session</p>
            </div>
          </div>
          <Link href="/interview/setup">
            <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Start Now
            </Button>
          </Link>
        </div>
      </Card>

      {/* Session history */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Recent Sessions</h2>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading…</div>
        ) : sessions.length === 0 ? (
          <Card variant="bordered" className="text-center py-12">
            <Brain className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No sessions yet. Start your first interview!</p>
            <Link href="/interview/setup" className="mt-4 inline-block">
              <Button variant="outline" size="sm">Start Interview</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <motion.div key={s._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card variant="bordered" padding="md">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant={s.status === "completed" ? "success" : "warning"} dot>
                          {s.status}
                        </Badge>
                        <Badge variant="neutral">{s.difficulty}</Badge>
                        <Badge variant="neutral">{s.questionCount} questions</Badge>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {s.extractedSkills.slice(0, 5).map((sk) => (
                          <span key={sk.normalizedName} className="text-xs bg-surface-700 text-slate-300 px-2 py-0.5 rounded-full">
                            {sk.normalizedName}
                          </span>
                        ))}
                        {s.extractedSkills.length > 5 && (
                          <span className="text-xs text-slate-500">+{s.extractedSkills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                      <Link href={`/results/${s._id}`} className="mt-1 inline-block">
                        <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3 h-3" />}>
                          Results
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
