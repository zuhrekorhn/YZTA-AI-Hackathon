"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  Package,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  Calendar,
  Phone,
  ShoppingCart
} from "lucide-react";
import { getDashboardOrders, updateOrderStatus, getDashboardProducts } from "@/lib/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import type { DashboardOrderResponse, ProductResponse } from "@/lib/types";

function getStatusColor(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  const normalized = status.toLowerCase();
  if (normalized.includes("teslim")) return "success";
  if (normalized.includes("haz") || normalized.includes("bek")) return "warning";
  if (normalized.includes("kargo") || normalized.includes("yol")) return "info";
  if (normalized.includes("iptal")) return "danger";
  return "neutral";
}

function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

export default function OrdersPage() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Hepsi");
  const [orders, setOrders] = useState<DashboardOrderResponse[]>([]);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Modal & Message Card States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageCard, setMessageCard] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Order Form State
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    product_id: "",
    quantity: "1",
    estimated_delivery: ""
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ordersData, productsData] = await Promise.all([
        getDashboardOrders(),
        getDashboardProducts()
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veriler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = orders;
    
    // Status Filter
    if (statusFilter !== "Hepsi") {
      result = result.filter(o => o.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Search Filter
    const q = search.trim().toLowerCase();
    if (!q) return result;
    
    return result.filter((order) =>
      order.customer_name.toLowerCase().includes(q) ||
      (order.product ?? "").toLowerCase().includes(q) ||
      String(order.id).includes(q) ||
      order.status.toLowerCase().includes(q)
    );
  }, [orders, search, statusFilter]);

  const handleStatusUpdate = async (orderId: number, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status } : order)));
      setMessageCard({ type: "success", text: `Sipariş durumu "${status}" olarak güncellendi.` });
    } catch (err) {
      setMessageCard({ type: "error", text: err instanceof Error ? err.message : "Sipariş durumu güncellenemedi" });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone || undefined,
        product_id: parseInt(formData.product_id),
        quantity: parseFloat(formData.quantity),
        estimated_delivery: formData.estimated_delivery || undefined
      };
      
      // MOCK BACKEND CALL - Frontend Only
      const newOrder: DashboardOrderResponse = {
        id: Math.floor(Math.random() * 1000) + 1000,
        customer_name: payload.customer_name,
        customer_phone: payload.customer_phone || null,
        product: products.find(p => p.id === payload.product_id)?.name || "Ürün",
        quantity: payload.quantity,
        status: "hazırlanıyor",
        cargo_tracking_no: null,
        estimated_delivery: payload.estimated_delivery || null,
        created_at: new Date().toISOString()
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setOrders(prev => [newOrder, ...prev]);

      setMessageCard({ type: "success", text: "Sipariş başarıyla oluşturuldu." });
      setIsModalOpen(false);
      setFormData({
        customer_name: "",
        customer_phone: "",
        product_id: "",
        quantity: "1",
        estimated_delivery: ""
      });
      // We don't call loadData() because we didn't save it to backend.
    } catch (err) {
      setMessageCard({ type: "error", text: err instanceof Error ? err.message : "Sipariş oluşturulamadı." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = ["Hepsi", "hazırlanıyor", "kargoya verildi", "yolda", "teslim edildi", "iptal"];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-bal-primary">Siparişler</h1>
          <p className="text-[10px] font-bold text-bal-text-muted uppercase tracking-widest mt-1">
            {filteredOrders.length} kayıt listeleniyor
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 px-6"
        >
          <Plus size={18} />
          <span>Yeni Sipariş</span>
        </button>
      </div>

      {error && (
        <ErrorState message={error} />
      )}

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-text-muted" size={18} />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="İsim, ürün veya ID ara..." 
            className="input-field pl-12 bg-white border border-bal-border shadow-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-bal-border shadow-sm">
          <div className="pl-3 text-bal-text-muted">
            <Filter size={16} />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm font-bold text-bal-text-main focus:ring-0 py-2 pr-8"
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading && <LoadingState message="Siparişler yükleniyor..." />}
        {!loading && filteredOrders.length === 0 && <EmptyState message="Filtreye uygun sipariş bulunamadı." />}

        {filteredOrders.map((order) => {
          const isExpanded = expandedId === order.id;
          const statusColor = getStatusColor(order.status);
          
          return (
            <div 
              key={order.id} 
              className={`card p-0 overflow-hidden transition-all duration-300 ${isExpanded ? "ring-2 ring-bal-accent/10 shadow-lg" : ""}`}
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-bal-surface/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-6">
                  <div className="text-[10px] font-black text-bal-text-muted font-mono">#{order.id}</div>
                  <div>
                    <div className="text-base font-black text-bal-text-main">{order.customer_name}</div>
                    <div className="text-[10px] font-bold text-bal-text-muted uppercase tracking-widest">{order.product ?? "Ürün Yok"}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`badge ${
                    statusColor === "success" ? "badge-success" : 
                    statusColor === "warning" ? "badge-warning" : 
                    statusColor === "info" ? "bg-blue-100 text-blue-600 border-blue-200" :
                    statusColor === "danger" ? "badge-danger" :
                    "bg-gray-100 text-gray-600 border-gray-200"
                  } border`}>
                    {order.status}
                  </span>
                  <div className="text-bal-text-muted">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 bg-bal-surface/20 border-t border-bal-border/50 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid md:grid-cols-2 gap-8 pt-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-bal-text-muted uppercase tracking-widest">
                          <Phone size={12} />
                          <span>Müşteri Telefonu</span>
                        </div>
                        <p className="text-sm font-bold text-bal-text-main">
                          {order.customer_phone ?? "-"}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-bal-text-muted uppercase tracking-widest">
                          <ShoppingCart size={12} />
                          <span>Miktar</span>
                        </div>
                        <p className="text-sm font-bold text-bal-text-main">
                          {order.quantity} adet
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-bal-text-muted uppercase tracking-widest">
                        <Package size={12} />
                        <span>Kargo Takip / ETA</span>
                      </div>
                      <p className="text-sm font-mono font-black text-bal-primary">
                        {order.cargo_tracking_no ?? "-"} · {order.estimated_delivery ? formatDateLabel(order.estimated_delivery) : "-"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Buttons */}
                  <div className="mt-8">
                    <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest mb-3">
                      Durumu Güncelle
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {["hazırlanıyor", "kargoya verildi", "yolda", "teslim edildi", "iptal"].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusUpdate(order.id, s)}
                          disabled={updatingOrderId === order.id || order.status === s}
                          className={`flex-1 min-w-[120px] px-3 py-2.5 rounded-xl border font-bold text-[11px] uppercase tracking-wider transition-all disabled:opacity-50 ${
                            order.status === s 
                              ? "bg-bal-primary text-white border-bal-primary shadow-md" 
                              : "bg-white text-bal-text-muted border-bal-border hover:bg-bal-surface hover:text-bal-primary"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-bal-border flex items-center justify-between bg-bal-surface/30">
              <h2 className="text-xl font-black text-bal-primary">Yeni Sipariş Ekle</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-bal-surface rounded-full text-bal-text-muted"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Müşteri Adı Soyadı</label>
                  <input 
                    required
                    type="text" 
                    placeholder="Örn: Ahmet Yılmaz"
                    className="input-field"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Telefon</label>
                  <input 
                    type="tel" 
                    placeholder="05xx..."
                    className="input-field"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Miktar</label>
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="input-field"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Ürün Seçimi</label>
                  <select 
                    required
                    className="input-field"
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                  >
                    <option value="">Ürün seçiniz...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Tahmini Teslimat</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-text-muted" size={16} />
                    <input 
                      type="date" 
                      className="input-field pl-12"
                      value={formData.estimated_delivery}
                      onChange={(e) => setFormData({...formData, estimated_delivery: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-bal-border font-bold text-bal-text-muted hover:bg-bal-surface transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 btn-primary px-8"
                >
                  {isSubmitting ? "Ekleniyor..." : "Siparişi Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Card (Success/Error) */}
      {messageCard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
              messageCard.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {messageCard.type === "success" ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
            </div>
            <h3 className="text-lg font-black text-bal-text-main mb-2">
              {messageCard.type === "success" ? "Başarılı!" : "Bir Hata Oluştu"}
            </h3>
            <p className="text-sm text-bal-text-muted mb-6">
              {messageCard.text}
            </p>
            <button 
              onClick={() => setMessageCard(null)}
              className="w-full py-3 rounded-xl bg-bal-primary text-white font-bold hover:opacity-90 transition-all"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
