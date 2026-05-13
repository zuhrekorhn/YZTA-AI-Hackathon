"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginBusiness } from "@/lib/api";
import { Bot, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginBusiness(email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-bal-accent rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo Section */}
        <div className="text-center mb-8 space-y-3">
          <div className="mx-auto w-16 h-16 bg-bal-primary rounded-2xl flex items-center justify-center shadow-xl shadow-bal-primary/20 rotate-3">
            <div className="-rotate-3">
              <Bot size={32} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-bal-primary tracking-tight">KoopAI</h1>
            <p className="text-sm font-bold text-bal-text-muted mt-1 uppercase tracking-widest">Yönetim Paneli Girişi</p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white">
          <form onSubmit={submit} className="space-y-6">
            
            {/* Greeting / Error */}
            <div className="text-center">
              <h2 className="text-xl font-black text-bal-text-main">Hoş Geldiniz!</h2>
              {error ? (
                <div className="mt-3 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl animate-in shake">
                  {error}
                </div>
              ) : (
                <p className="mt-2 text-xs text-bal-text-muted">Devam etmek için bilgilerinizi girin.</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest pl-1">Email Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-text-muted" size={18} />
                  <input 
                    required
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="ornek@koopai.com" 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-bal-border rounded-2xl focus:border-bal-primary focus:ring-4 focus:ring-bal-primary/10 transition-all font-bold text-bal-text-main placeholder:font-normal" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pl-1 pr-1">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Şifre</label>
                  <a href="#" className="text-[10px] font-black text-bal-accent hover:underline">Şifremi Unuttum</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-text-muted" size={18} />
                  <input 
                    required
                    type="password"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••" 
                    className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-bal-border rounded-2xl focus:border-bal-primary focus:ring-4 focus:ring-bal-primary/10 transition-all font-bold text-bal-text-main placeholder:font-normal tracking-widest" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading} 
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-bal-primary to-blue-900 text-white py-4 rounded-2xl font-black text-sm shadow-lg hover:shadow-xl hover:opacity-95 active:scale-95 disabled:opacity-50 transition-all"
            >
              {loading ? "Giriş Yapılıyor..." : (
                <>
                  <span>Giriş Yap</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div className="pt-2 text-center">
              <span className="text-xs text-bal-text-muted">Hesabınız yok mu? </span>
              <a href="/register" className="text-xs font-black text-bal-primary hover:underline">
                Hemen oluşturun
              </a>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-bal-text-muted uppercase tracking-widest opacity-60">
          <Sparkles size={12} />
          <span>Yapay Zeka Destekli Sistem</span>
        </div>
      </div>
    </div>
  );
}
