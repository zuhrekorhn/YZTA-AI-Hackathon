"use client";

import { useState } from "react";
import { 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  AlertTriangle, 
  MessageSquare,
  Send,
  Database,
  Bot
} from "lucide-react";
import { DASHBOARD_STATS, RECENT_ORDERS, STOCK_STATUS } from "@/constants/mockData";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsTyping(true);
    setAiResponse(null);
    setTimeout(() => {
      let response = "Merhaba! Hemen bakıyorum... ";
      if (query.toLowerCase().includes("sat")) {
        response += "Bu hafta satışlarınız %15 artış gösterdi! Harika!";
      } else if (query.toLowerCase().includes("stok")) {
        response += "Bazı ürünlerinizin stoğu azalmış görünüyor. İsterseniz hemen tedarik listesi hazırlayabilirim.";
      } else {
        response += "Şu an için her şey yolunda görünüyor.";
      }

      setAiResponse(response);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Warm Greeting */}
      <section className="bg-white p-8 rounded-2xl border border-bal-border relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-bal-accent font-bold text-xs uppercase tracking-widest">
            <Sparkles size={14} />
            <span>Sistem Özeti</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-bal-primary leading-tight">
            Hoş geldiniz! <span className="underline decoration-bal-accent underline-offset-8 decoration-4">Operasyonlar</span> sorunsuz devam ediyor. 
            Verimlilik artışı için AI asistanını kullanabilirsiniz.
          </h1>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Yeni Siparişler", val: 0, sub: `Dün: 0`, icon: ShoppingBag },
          { label: "Kargolanan", val: 0, sub: `0 bekliyor`, icon: Truck },
          { label: "Stok Uyarısı", val: 0, sub: "Tüm stoklar normal", icon: AlertTriangle, isWarning: false },
          { label: "Müşteri Mesajı", val: 0, sub: `0 otomatik yanıt`, icon: MessageSquare },
        ].map((stat, i) => (
          <div key={i} className="bg-bal-surface/50 p-6 rounded-2xl border border-bal-border hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={18} className={stat.isWarning ? "text-bal-danger" : "text-bal-accent"} />
            </div>
            <div>
              <div className={`text-3xl font-black ${stat.isWarning ? "text-bal-danger" : "text-bal-text-main"}`}>{stat.val}</div>
              <div className="text-xs text-bal-text-muted font-bold mt-1">{stat.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Son Siparişler */}
        <section className="card">
          <h3 className="text-lg font-black text-bal-primary mb-6">Son Siparişler</h3>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
            <ShoppingBag size={48} className="text-bal-text-muted" />
            <p className="text-sm font-bold text-bal-text-muted">Henüz sipariş kaydı bulunmuyor.</p>
          </div>
        </section>

        {/* Stok Durumu */}
        <section className="card">
          <h3 className="text-lg font-black text-bal-primary mb-6">Stok Durumu</h3>
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-50">
            <AlertTriangle size={48} className="text-bal-text-muted" />
            <p className="text-sm font-bold text-bal-text-muted">Stok verisi bulunmuyor.</p>
          </div>
        </section>
      </div>


      {/* AI Asistanı Card */}
      <section className="card bg-bal-surface/30 border-2 border-bal-accent/10">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-bal-accent p-2 rounded-xl text-white">
            <Bot size={20} />
          </div>
          <h3 className="text-lg font-black text-bal-primary tracking-tight">AI Asistanı</h3>
        </div>
        
        <form onSubmit={handleAskAI} className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bir şey sor... Örn: Bu hafta en çok ne sattım?"
            className="input-field pr-16 bg-white border border-bal-border"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-bal-primary text-white px-4 rounded-lg hover:opacity-90 transition-all"
          >
            <Send size={18} />
          </button>
        </form>

        {(isTyping || aiResponse) && (
          <div className="mt-6 ai-answer-block animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="text-bal-accent mt-1 shrink-0" />
              <div className="space-y-3">
                <p className="text-sm font-bold text-bal-text-main leading-relaxed">
                  {isTyping ? "Veriler analiz ediliyor..." : aiResponse}
                </p>
                {!isTyping && (
                  <div className="flex items-center gap-1.5 text-[9px] font-black text-bal-accent uppercase tracking-[0.2em]">
                    <Database size={10} />
                    <span>Veritabanı sorgulandı · 1.2 sn</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
