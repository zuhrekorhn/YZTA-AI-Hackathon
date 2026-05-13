"use client";

import { Bot } from "lucide-react";
import { logout } from "@/lib/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [businessName, setBusinessName] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Önce localden hızlıca göster
    const localName = window.localStorage.getItem("koopai_business_name");
    if (localName) setBusinessName(localName);

    // Sonra DB'den güncelini çek
    import("@/lib/api").then(({ getProfile }) => {
      getProfile().then(data => {
        if (data && data.name) {
          setBusinessName(data.name);
          window.localStorage.setItem("koopai_business_name", data.name);
        }
      }).catch(() => {});
    });
  }, [pathname]);

  return (
    <nav className="h-20 bg-bal-primary text-white flex items-center justify-between px-6 md:px-10 sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-3">
        <div className="bg-white/10 p-1.5 rounded-lg">
          <Bot size={24} />
        </div>
        <span className="text-xl font-black tracking-tight">KoopAI</span>
      </div>
      
      <div className="hidden md:flex items-center gap-4">
        <div className="text-xs font-bold text-white/50 uppercase tracking-widest">{businessName ?? "İşletme yok"}</div>
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/5">
          <div className="w-2.5 h-2.5 bg-[#F0C060] rounded-full shadow-[0_0_10px_#F0C060]" />
          <span className="text-[10px] font-black uppercase">AI Aktif</span>
        </div>
        {businessName ? (
          <div className="flex items-center gap-2">
            {/* Profil and Çıkış moved to Sidebar */}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded hover:bg-white/20">Giriş</Link>
            <Link href="/register" className="text-xs font-bold bg-white/10 px-3 py-1.5 rounded hover:bg-white/20">Kayıt</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
