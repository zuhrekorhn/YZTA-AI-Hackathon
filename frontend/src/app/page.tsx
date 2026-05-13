"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getDashboardOrders, getDashboardProducts, getDashboardSummary, managerChat } from "@/lib/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import type { DashboardOrderResponse, DashboardSummaryResponse, ProductResponse } from "@/lib/types";

const MANAGER_SESSION_ID = "manager-web-session";

function getStatusColor(status: string): "success" | "warning" | "danger" {
  const normalized = status.toLowerCase();
  if (normalized.includes("teslim")) return "success";
  if (normalized.includes("haz") || normalized.includes("bek")) return "warning";
  return "danger";
}

function getStockPercent(stock: number, threshold: number): number {
  if (threshold <= 0) return 100;
  return Math.min((stock / (threshold * 2)) * 100, 100);
}

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [orders, setOrders] = useState<DashboardOrderResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);

  const stats = useMemo(() => {
    const shipped = orders.filter((o) => o.status.toLowerCase().includes("teslim") || o.status.toLowerCase().includes("yolda")).length;
    const waiting = orders.filter((o) => o.status.toLowerCase().includes("haz") || o.status.toLowerCase().includes("bek")).length;
    return {
      newOrders: summary?.total_orders_today ?? 0,
      shipped,
      waiting,
      stockWarnings: summary?.critical_stocks_count ?? 0,
      messages: summary?.pending_messages_count ?? 0,
      delayed: summary?.delayed_orders_count ?? 0,
    };
  }, [orders, summary]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaryData, ordersData, productsData] = await Promise.all([
          getDashboardSummary(),
          getDashboardOrders(),
          getDashboardProducts(),
        ]);
        if (!mounted) return;
        setSummary(summaryData);
        setOrders(ordersData.slice(0, 6));
        setProducts(productsData.slice(0, 6));
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Veriler yüklenemedi");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsTyping(true);
    setAiResponse(null);
    try {
      const response = await managerChat(MANAGER_SESSION_ID, query);
      setAiResponse(response.reply);
    } catch (err) {
      setAiResponse(err instanceof Error ? err.message : "AI yanıtı alınamadı.");
    } finally {
      setIsTyping(false);
    }
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
            Günaydın! Bugün <span className="underline decoration-bal-accent underline-offset-8 decoration-4">{stats.newOrders} yeni sipariş</span> var. 
            {stats.stockWarnings > 0 ? `${stats.stockWarnings} kritik stok` : "Kritik stok yok"} ve {stats.delayed} geciken kargo görünüyor.
          </h1>
        </div>
      </section>

      {error && (
        <ErrorState message={error} />
      )}

      {/* Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Yeni Siparişler", val: stats.newOrders, sub: "Bugün", icon: ShoppingBag },
          { label: "Kargolanan", val: stats.shipped, sub: `${stats.waiting} bekliyor`, icon: Truck },
          { label: "Stok Uyarısı", val: stats.stockWarnings, sub: "Kritik ürün", icon: AlertTriangle, isWarning: true },
          { label: "Müşteri Mesajı", val: stats.messages, sub: "Yanıt bekleyen", icon: MessageSquare },
        ].map((stat, i) => (
          <div key={i} className="bg-bal-surface/50 p-8 rounded-3xl border border-bal-border hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-black text-bal-text-muted uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={22} className={stat.isWarning ? "text-bal-danger" : "text-bal-accent"} />
            </div>
            <div>
              <div className={`text-4xl font-black ${stat.isWarning ? "text-bal-danger" : "text-bal-text-main"}`}>{stat.val}</div>
              <div className="text-sm text-bal-text-muted font-bold mt-2">{stat.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* AI Asistanı Card - Moved Up */}
      <section className="card bg-gradient-to-br from-white to-bal-surface/30 border-2 border-bal-accent/20 shadow-xl shadow-bal-accent/5">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-tr from-bal-accent to-blue-500 p-3 rounded-2xl text-white shadow-lg">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-bal-primary tracking-tight">AI Asistanı</h3>
            <p className="text-xs font-bold text-bal-text-muted mt-1">İşletmenizin verileri hakkında sorular sorun</p>
          </div>
        </div>
        
        <form onSubmit={handleAskAI} className="relative">
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn: Bu hafta en çok ne sattım?"
            className="input-field pr-20 py-4 text-base bg-white border-2 border-bal-border focus:border-bal-accent/50 focus:ring-4 focus:ring-bal-accent/10 shadow-inner rounded-2xl transition-all"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-bal-accent to-blue-500 text-white px-6 rounded-xl font-bold shadow-md hover:shadow-lg hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center"
          >
            <Send size={20} />
          </button>
        </form>

        {(isTyping || aiResponse) && (
          <div className="mt-6 bg-white p-6 rounded-2xl border border-bal-border shadow-sm animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-4">
              <Sparkles size={24} className="text-bal-accent shrink-0 mt-1" />
              <div className="space-y-4 w-full">
                <p className="text-base font-bold text-bal-text-main leading-relaxed">
                  {isTyping ? "Veriler analiz ediliyor..." : aiResponse}
                </p>
                {!isTyping && (
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-bal-accent uppercase tracking-[0.2em] bg-bal-accent/10 w-fit px-3 py-1.5 rounded-full">
                    <Database size={12} />
                    <span>Gerçek zamanlı yanıt</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>


      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Son Siparişler */}
        <section className="card">
          <h3 className="text-lg font-black text-bal-primary mb-6">Son Siparişler</h3>
          <div className="space-y-4">
            {loading && <LoadingState message="Siparişler yükleniyor..." />}
            {!loading && orders.length === 0 && <EmptyState message="Sipariş bulunamadı." />}
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-bal-surface transition-colors border-b border-bal-surface last:border-0">
                <div className="space-y-1">
                  <div className="text-sm font-black text-bal-text-main">{order.customer_name}</div>
                  <div className="text-[10px] text-bal-text-muted font-bold uppercase tracking-tight">{order.product ?? "Ürün yok"} <span className="mx-1">·</span> #{order.id}</div>
                </div>
                <span className={`badge ${
                  getStatusColor(order.status) === "success" ? "badge-success" : 
                  getStatusColor(order.status) === "warning" ? "badge-warning" : 
                  "badge-danger"
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
            {loading && <LoadingState message="Stok verileri yükleniyor..." />}
            {!loading && products.length === 0 && <EmptyState message="Ürün bulunamadı." />}
            {products.map((item) => {
              const isCritical = item.stock <= item.critical_threshold;
              const percentage = getStockPercent(item.stock, item.critical_threshold);
              let barColor = isCritical ? "bg-red-500" : "bg-green-500";
              let textColor = isCritical ? "text-red-600" : "text-bal-text-muted";
              let stockLabel = isCritical ? `${item.stock} ${item.unit} (KRİTİK)` : `${item.stock} ${item.unit}`;

              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-black text-bal-text-main">
                    <span className={isCritical ? "text-red-600" : ""}>{item.name}</span>
                    <span className={textColor}>{stockLabel}</span>
                  </div>
                  <div className="h-2.5 w-full bg-bal-surface rounded-full overflow-hidden border border-bal-border/30">
                    <div 
                      className={`h-full ${barColor} transition-all duration-1000 shadow-sm`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

    </div>
  );
}
