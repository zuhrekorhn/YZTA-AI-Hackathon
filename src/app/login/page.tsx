"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Bot, Lock, Building2, ArrowRight } from "lucide-react";

export default function LoginPage() {

  const [kurumAdi, setKurumAdi] = useState("");
  const [sifre, setSifre] = useState("");
  const { login } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (kurumAdi.trim()) {
      login(kurumAdi);
    }
  };


  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="inline-flex bg-bal-primary p-4 rounded-3xl text-white shadow-xl shadow-bal-primary/20">
            <Bot size={48} />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-bal-primary tracking-tight">KoopPilot</h1>
            <p className="text-bal-text-muted font-bold">Kurumsal Giriş Paneli</p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2.5rem] border border-bal-border shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-bal-text-muted uppercase tracking-widest ml-1">Kurum Adı</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={20} />
                <input
                  required
                  type="text"
                  value={kurumAdi}
                  onChange={(e) => setKurumAdi(e.target.value)}
                  placeholder="Şirket isminizi giriniz"
                  autoComplete="off"
                  className="input-field pl-12 bg-bal-surface/30 border-bal-border/50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-bal-text-muted uppercase tracking-widest ml-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={20} />
                <input
                  required
                  type="password"
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="off"
                  className="input-field pl-12 bg-bal-surface/30 border-bal-border/50 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-bal-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-bal-primary/20"
          >
            <span>Sisteme Giriş Yap</span>
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-[10px] font-bold text-bal-text-muted uppercase tracking-[0.2em]">
          Yapay Zeka Destekli Operasyon Sistemi v2.0
        </p>
      </div>
    </div>
  );
}
