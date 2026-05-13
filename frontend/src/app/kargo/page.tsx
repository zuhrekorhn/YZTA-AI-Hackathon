"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Truck, 
  Clock, 
  CheckCircle2, 
  Search,
  MessageSquare,
  X,
  Sparkles
} from "lucide-react";
import { getDashboardOrders, getDashboardSummary, managerChat, bulkNotify } from "@/lib/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import type { DashboardOrderResponse, DashboardSummaryResponse } from "@/lib/types";

const NOTIFY_SESSION_ID = "manager-notify-session";

function formatDateLabel(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

function isDelivered(status: string): boolean {
  return status.toLowerCase().includes("teslim");
}

function isInTransit(status: string): boolean {
  const normalized = status.toLowerCase();
  return normalized.includes("yolda") || normalized.includes("kargo") || normalized.includes("dagitim") || normalized.includes("dağıtım");
}

export default function ShippingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrderResponse | null>(null);
  const [draftMessage, setDraftMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendInfo, setSendInfo] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [reportMessages, setReportMessages] = useState<{
    order_id: number;
    customer: string;
    message: string;
  }[]>([]);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [orders, setOrders] = useState<DashboardOrderResponse[]>([]);
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ordersData, summaryData] = await Promise.all([
          getDashboardOrders(),
          getDashboardSummary(),
        ]);
        if (!mounted) return;
        setOrders(ordersData);
        setSummary(summaryData);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Kargo verileri yüklenemedi");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, []);

  const delayedOrderIds = useMemo(
    () => new Set((summary?.delayed_orders ?? []).map((item) => item.id)),
    [summary]
  );

  const shipmentRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders
      .filter((order) => order.cargo_tracking_no || isInTransit(order.status) || isDelivered(order.status))
      .filter((order) => {
        if (!q) return true;
        return (
          String(order.id).includes(q) ||
          order.customer_name.toLowerCase().includes(q) ||
          (order.cargo_tracking_no ?? "").toLowerCase().includes(q)
        );
      });
  }, [orders, search]);

  const stats = useMemo(() => {
    const inTransit = shipmentRows.filter((order) => isInTransit(order.status)).length;
    const delayed = shipmentRows.filter((order) => delayedOrderIds.has(order.id)).length;
    const today = new Date().toISOString().slice(0, 10);
    const todayDelivery = shipmentRows.filter((order) => order.estimated_delivery?.slice(0, 10) === today).length;
    return { inTransit, delayed, todayDelivery };
  }, [delayedOrderIds, shipmentRows]);

  const handleInformCustomer = (order: DashboardOrderResponse) => {
    setSelectedOrder(order);
    setDraftMessage(
      `Merhaba ${order.customer_name}, #${order.id} siparişinizin teslimatında gecikme görünüyor. Süreci yakından takip ediyoruz ve sizi güncel tutacağız.`
    );
    setSendInfo(null);
    setIsModalOpen(true);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkNotify = async () => {
    if (selectedIds.size === 0) return setSendInfo("Lütfen en az bir sipariş seçin.");
    setSendInfo("Toplu gönderim başlatıldı...");
    try {
      const ids = Array.from(selectedIds);
      const response = await bulkNotify(ids, "delay");
      setSendInfo(`${response.sent_count} müşteriye mesaj gönderildi.`);
      setReportMessages(response.messages ?? []);
      setIsReportOpen(true);
      // refresh data
      const [ordersData, summaryData] = await Promise.all([getDashboardOrders(), getDashboardSummary()]);
      setOrders(ordersData);
      setSummary(summaryData);
      setSelectedIds(new Set());
    } catch (err) {
      setSendInfo(err instanceof Error ? err.message : "Toplu gönderim başarısız");
    }
  };

  const selectAll = () => {
    setSelectedIds(new Set(shipmentRows.map((s) => s.id)));
  };

  const selectDelayed = () => {
    setSelectedIds(new Set(shipmentRows.filter((s) => delayedOrderIds.has(s.id)).map((s) => s.id)));
  };

  const handleSendMessage = async () => {
    if (!selectedOrder) return;
    setSendInfo("Gönderiliyor...");
    try {
      const managerPrompt = `Sipariş ID ${selectedOrder.id} için müşteriye gecikme bildirimi gönder. Mesaj içeriği: ${draftMessage}`;
      const response = await managerChat(NOTIFY_SESSION_ID, managerPrompt);
      setSendInfo(response.reply);
    } catch (err) {
      setSendInfo(err instanceof Error ? err.message : "Mesaj gönderilemedi");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Kargo Takibi</h1>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bal-text-muted" size={16} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kargo ara..." 
            className="input-field pl-10 py-2.5 text-xs bg-white border border-bal-border w-64"
          />
        </div>
      </div>

      {error && (
        <ErrorState message={error} />
      )}

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Aktif Kargo", val: stats.inTransit, icon: Truck, color: "text-bal-accent" },
          { label: "Geciken", val: stats.delayed, icon: Clock, color: "text-bal-danger", isDanger: true },
          { label: "Bugün Teslim", val: stats.todayDelivery, icon: CheckCircle2, color: "text-bal-success" },
        ].map((stat, i) => (
          <div key={i} className="card bg-bal-surface/30 flex items-center gap-4 border-bal-border/50">
            <div className={`p-3 rounded-xl bg-white shadow-sm ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">{stat.label}</div>
              <div className={`text-2xl font-black ${stat.isDanger ? "text-bal-danger" : "text-bal-text-main"}`}>{stat.val}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Shipment List */}
      <div className="flex items-center justify-end gap-3">
        <div className="text-xs text-bal-text-muted">Seçili: {selectedIds.size}</div>
        <div className="flex items-center gap-2">
          <button onClick={selectDelayed} className="text-xs px-3 py-2 border rounded">Sadece Gecikenleri Seç</button>
          <button onClick={selectAll} className="text-xs px-3 py-2 border rounded">Tümünü Seç</button>
          <button onClick={handleBulkNotify} className="btn-primary text-xs px-3 py-2">Gecikenlere Toplu Bilgi Ver</button>
        </div>
      </div>
      <div className="space-y-4">
        {loading && <LoadingState message="Kargo verileri yükleniyor..." />}
        {!loading && shipmentRows.length === 0 && <EmptyState message="Kargo kaydı bulunamadı." />}

        {shipmentRows.map((shipment) => {
          const delayed = delayedOrderIds.has(shipment.id);
          return (
          <div 
            key={shipment.id}
            className={`card flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
              delayed ? "border-bal-danger/30 bg-bal-danger/[0.01]" : ""
            }`}
          >
            <div className="flex items-center gap-6 flex-1">
              <input type="checkbox" checked={selectedIds.has(shipment.id)} onChange={() => toggleSelect(shipment.id)} className="w-4 h-4" />
              <div className="w-12 h-12 bg-bal-surface rounded-xl flex items-center justify-center text-bal-accent shadow-sm border border-bal-border/30">
                <Truck size={24} />
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center gap-8 flex-1">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-tighter">#{shipment.id}</div>
                  <div className="font-black text-sm text-bal-text-main">{shipment.customer_name}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Takip No</div>
                  <div className="text-xs font-bold text-bal-primary">{shipment.cargo_tracking_no ?? "-"}</div>
                </div>
                <div className="hidden lg:block space-y-0.5">
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Tahmini Teslim</div>
                  <div className="text-xs font-bold text-bal-text-main">{formatDateLabel(shipment.estimated_delivery)}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-none border-bal-surface/50">
              <span className={`badge ${
                delayed ? "badge-danger" : "badge-success"
              }`}>
                {shipment.status}
              </span>
              
              {delayed && (
                <button 
                  onClick={() => handleInformCustomer(shipment)}
                  className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5 shadow-md shadow-bal-primary/10"
                >
                  <MessageSquare size={14} />
                  <span>Bilgi Ver</span>
                </button>
              )}
            </div>
          </div>
        )})}
      </div>

      {/* AI Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-bal-text-main/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-8 space-y-6 animate-in zoom-in-95 duration-300 border border-bal-border">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-bal-accent font-black text-[10px] uppercase tracking-widest">
                  <Sparkles size={12} />
                  <span>AI Taslak Hazırladı</span>
                </div>
                <h3 className="text-xl font-black text-bal-primary">Müşteriyi Bilgilendir</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-bal-surface rounded-full hover:bg-bal-border/30 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-bal-surface/50 p-6 rounded-xl border border-bal-accent/10">
              <textarea
                value={draftMessage}
                onChange={(e) => setDraftMessage(e.target.value)}
                className="w-full min-h-28 text-sm font-bold text-bal-text-main leading-relaxed italic bg-transparent outline-none resize-none"
              />
            </div>

            {sendInfo && (
              <div className="text-xs font-bold text-bal-text-muted bg-bal-surface/60 p-3 rounded-xl border border-bal-border/40">
                {sendInfo}
              </div>
            )}
            
            <button onClick={handleSendMessage} className="w-full btn-primary py-4 text-sm uppercase tracking-widest font-black">
              Mesajı Gönder
            </button>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 bg-black/40 z-[120] flex items-center justify-center p-6">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-black">Toplu Gönderim Raporu</h3>
              <button onClick={() => setIsReportOpen(false)} className="text-sm text-bal-text-muted">Kapat</button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {reportMessages.length === 0 && <div className="text-sm text-bal-text-muted">Gönderilen mesaj bulunmuyor.</div>}
              {reportMessages.map((r) => (
                <div key={r.order_id} className="p-3 border rounded">
                  <div className="text-xs font-black text-bal-text-muted">Sipariş #{r.order_id} — {r.customer}</div>
                  <div className="mt-2 text-sm">{r.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
