import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Simulator — AI-Powered Mock Interviews",
  description:
    "Voice-first, RAG-powered interview simulation platform. Upload a JD, practice with AI, and get structured feedback to ace your next technical interview.",
  keywords: ["interview simulator", "AI mock interview", "technical interview prep", "RAG", "job description"],
  authors: [{ name: "Interview Simulator" }],
  openGraph: {
    title: "Interview Simulator",
    description: "AI-powered voice-first technical interview preparation platform.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-surface-900 text-slate-100 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
