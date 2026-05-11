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
        response += "Bu hafta Bal satışları çok iyi gidiyor! Tam 42 adet satıldı. Harika!";
      } else if (query.toLowerCase().includes("stok") || query.toLowerCase().includes("domates")) {
        response += "Domates azalmış (12kg kalmış). İstersen hemen 80kg sipariş verebiliriz.";
      } else {
        response += "Her şey yolunda! İşler tıkırında gidiyor.";
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
            <span>Gemini Hazırladı</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-bal-primary leading-tight">
            Günaydın! Bugün <span className="underline decoration-bal-accent underline-offset-8 decoration-4">{DASHBOARD_STATS.newOrders} yeni sipariş</span> var. 
            Domates stoğu kritik seviyede. 2 kargo gecikiyor.
          </h1>
        </div>
      </section>

      {/* Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Yeni Siparişler", val: DASHBOARD_STATS.newOrders, sub: `Dün: ${DASHBOARD_STATS.yesterdayOrders}`, icon: ShoppingBag },
          { label: "Kargolanan", val: DASHBOARD_STATS.shipped, sub: `${DASHBOARD_STATS.waitingOrders} bekliyor`, icon: Truck },
          { label: "Stok Uyarısı", val: DASHBOARD_STATS.stockWarnings, sub: "Kritik ürün", icon: AlertTriangle, isWarning: true },
          { label: "Müşteri Mesajı", val: DASHBOARD_STATS.messages, sub: `${DASHBOARD_STATS.autoReplied} otomatik yanıt`, icon: MessageSquare },
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
          <div className="space-y-4">
            {RECENT_ORDERS.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-bal-surface transition-colors border-b border-bal-surface last:border-0">
                <div className="space-y-1">
                  <div className="text-sm font-black text-bal-text-main">{order.customer}</div>
                  <div className="text-[10px] text-bal-text-muted font-bold uppercase tracking-tight">{order.product} <span className="mx-1">·</span> {order.id}</div>
                </div>
                <span className={`badge ${
                  order.statusColor === 'success' ? 'badge-success' : 
                  order.statusColor === 'warning' ? 'badge-warning' : 
                  'badge-danger'
                }`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Stok Durumu */}
        <section className="card">
          <h3 className="text-lg font-black text-bal-primary mb-6">Stok Durumu</h3>
          <div className="space-y-6">
            {STOCK_STATUS.map((item) => {
              const percentage = (item.level / 100) * 100;
              let barColor = "bg-bal-success";
              if (percentage < 25) barColor = "bg-bal-danger";
              else if (percentage < 50) barColor = "bg-bal-accent";

              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-bal-text-main">
                    <span>{item.name}</span>
                    <span className="text-bal-text-muted">{item.quantity}</span>
                  </div>
                  <div className="h-2.5 w-full bg-bal-surface rounded-full overflow-hidden border border-bal-border/30">
                    <div 
                      className={`h-full ${barColor} transition-all duration-1000`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
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
