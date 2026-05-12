"use client";

import { Bot, User } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function Navbar() {
  const { kurumAdi } = useAuth();

  return (
    <nav className="h-16 bg-bal-primary text-white flex items-center justify-between px-6 md:px-10 sticky top-0 z-50 shadow-md">
      <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        <div className="bg-white/10 p-1.5 rounded-lg">
          <Bot size={24} />
        </div>
        <span className="text-xl font-black tracking-tight">{kurumAdi || "KoopPilot"}</span>
      </Link>
      
      <div className="hidden md:block text-xs font-bold text-white/50 uppercase tracking-widest">
        {kurumAdi || "KoopPilot"} Operasyon Paneli
      </div>
      
      <div className="flex items-center gap-4">
        <Link href="/profil" className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5 hover:bg-white/20 transition-all">
          <User size={14} />
          <span className="text-[10px] font-black uppercase">Profil</span>
        </Link>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
          <div className="w-2.5 h-2.5 bg-[#F0C060] rounded-full shadow-[0_0_10px_#F0C060]" />
          <span className="text-[10px] font-black uppercase">AI Aktif</span>
        </div>
      </div>
    </nav>
  );
}


