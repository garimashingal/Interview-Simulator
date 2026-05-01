"use client";
import { Bell, Search, User } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useSession } from "next-auth/react";
import Image from "next/image";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-14 flex items-center px-6 gap-4 border-b border-surface-700 bg-surface-800/40 backdrop-blur-sm">
      {/* Search */}
      <div className="flex-1 max-w-sm relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
        <input
          type="search"
          placeholder="Search sessions..."
          className="w-full bg-surface-700/50 border border-surface-600 rounded-xl pl-9 pr-4 py-1.5 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <ThemeToggle />
        <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-surface-700 transition-all relative">
          <Bell className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 ml-1 pl-3 border-l border-surface-700">
          {session?.user?.image ? (
            <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full ring-2 ring-brand-500/30" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center border border-brand-500/30">
              <User className="w-3.5 h-3.5 text-brand-400" />
            </div>
          )}
          {session?.user?.name && (
            <span className="text-sm text-slate-300 hidden md:block">{session.user.name.split(" ")[0]}</span>
          )}
        </button>
      </div>
    </header>
  );
}
