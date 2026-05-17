"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/Providers";
import { Button } from "../ui/Button";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-700 transition-all ${className}`}
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </Button>
  );
}
