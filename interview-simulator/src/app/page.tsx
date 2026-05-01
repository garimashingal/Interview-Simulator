import Link from "next/link";
import { Brain, Zap, Target, TrendingUp, Mic, Star, ArrowRight, CheckCircle } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "RAG-Powered Evaluation",
    description: "Your answers are compared to gold-standard references from a curated knowledge base using vector semantic search.",
    color: "brand",
  },
  {
    icon: Mic,
    title: "Voice-First Interface",
    description: "Speak naturally — live captions appear in real-time as you talk. No typing required.",
    color: "accent",
  },
  {
    icon: Zap,
    title: "AI Skill Extraction",
    description: "Paste any Job Description — Gemini extracts and normalizes skills instantly to tailor your interview.",
    color: "emerald",
  },
  {
    icon: Target,
    title: "Targeted Questioning",
    description: "Questions are retrieved from a vector database matching your exact JD requirements.",
    color: "violet",
  },
  {
    icon: TrendingUp,
    title: "Structured Feedback",
    description: "Receive a 1–10 score, your strengths, missed concepts, and a refined perfect answer.",
    color: "amber",
  },
  {
    icon: Star,
    title: "Dynamic Library Growth",
    description: "New skills are automatically detected and added to the knowledge base using AI generation.",
    color: "rose",
  },
];

const colorMap: Record<string, string> = {
  brand:   "bg-brand-500/10 border-brand-500/20 text-brand-400",
  accent:  "bg-accent-500/10 border-accent-500/20 text-accent-400",
  emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
  violet:  "bg-violet-500/10 border-violet-500/20 text-violet-400",
  amber:   "bg-amber-500/10 border-amber-500/20 text-amber-400",
  rose:    "bg-rose-500/10 border-rose-500/20 text-rose-400",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen animated-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-brand">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">Interview<span className="text-brand-400">Simulator</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white px-4 py-2 rounded-xl hover:bg-surface-700 transition-all"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl transition-all shadow-glow-brand"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-accent-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="max-w-4xl mx-auto relative page-enter">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-xs text-brand-300 mb-6">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Powered by Gemini 2.5 Flash-Lite + MongoDB Vector Search
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Ace Every
            <span className="block gradient-text">Technical Interview</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload a Job Description. Speak your answers. Get AI-powered, RAG-based feedback with
            scores, skill gaps, and refined perfect answers — completely voice-first.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-glow-brand hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] text-sm"
            >
              Start Practicing Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-2xl transition-all text-sm"
            >
              Sign In
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-slate-500">
            {["No credit card required", "Free Web Speech API", "Real-time feedback"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to <span className="gradient-text">interview smarter</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            A professional-grade platform that simulates real interview conditions with cutting-edge AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="glass rounded-2xl p-6 hover:border-brand-500/30 transition-all duration-300 group hover:-translate-y-1"
            >
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-4 ${colorMap[color]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-white mb-2 text-sm">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer strip */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center glass rounded-3xl p-12 border border-brand-500/20">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to level up?</h2>
          <p className="text-slate-400 mb-8 text-sm">Join thousands of engineers practicing with AI-powered interviews.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-2xl transition-all shadow-glow-brand text-sm"
          >
            Get Started — It&apos;s Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-surface-700 py-8 text-center text-slate-500 text-xs">
        © 2026 Interview Simulator · Built with Next.js, Gemini AI & MongoDB Atlas
      </footer>
    </div>
  );
}
