"use client";

import { useState } from "react";
import { 
  Truck, 
  Clock, 
  CheckCircle2, 
  Search,
  MessageSquare,
  X,
  Sparkles,
  Plus,
  Package,
  Hash,
  Building2
} from "lucide-react";
import StatusCard from "@/components/StatusCard";

const SHIPMENTS: any[] = [];

export default function ShippingPage() {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const [formData, setFormData] = useState({ id: "", customer: "", company: "Yurtiçi", trackNo: "" });

  const handleInformCustomer = (customer: string) => {
    setSelectedCustomer(customer);
    setIsAiModalOpen(true);
  };

  const handleSaveKargo = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.id && formData.customer && formData.trackNo) {
      setStatus({
        type: "success",
        title: "Kargo Eklendi",
        message: "Kargo bilgileri başarıyla sisteme kaydedildi."
      });
      setIsAddModalOpen(false);
      setFormData({ id: "", customer: "", company: "Yurtiçi", trackNo: "" });
    } else {
      setStatus({
        type: "error",
        title: "Eksik Bilgi",
        message: "Lütfen tüm zorunlu alanları doldurunuz."
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Kargo Takibi</h1>
        
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bal-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Kargo ara..." 
              className="input-field pl-10 py-2.5 text-xs bg-white border border-bal-border w-64"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-12 h-12 bg-bal-primary text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Aktif Kargo", val: 0, icon: Truck, color: "text-bal-accent" },
          { label: "Geciken", val: 0, icon: Clock, color: "text-bal-danger", isDanger: true },
          { label: "Bugün Teslim", val: 0, icon: CheckCircle2, color: "text-bal-success" },
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
      <div className="space-y-4">
        {SHIPMENTS.length === 0 ? (
          <div className="card p-12 text-center space-y-4 border-dashed border-2">
            <div className="bg-bal-surface p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-bal-text-muted">
              <Truck size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-bal-primary">Kargo Kaydı Yok</h3>
              <p className="text-sm font-bold text-bal-text-muted">Aktif kargo takibi yapmak için yeni kayıt ekleyin.</p>
            </div>
          </div>
        ) : SHIPMENTS.map((shipment) => (
          <div 
            key={shipment.id} 
            className={`card flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all ${
              shipment.delayed ? "border-bal-danger/30 bg-bal-danger/[0.01]" : ""
            }`}
          >
            <div className="flex items-center gap-6 flex-1">
              <div className="w-12 h-12 bg-bal-surface rounded-xl flex items-center justify-center text-bal-accent shadow-sm border border-bal-border/30">
                <Truck size={24} />
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center gap-8 flex-1">
                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-tighter">{shipment.id}</div>
                  <div className="font-black text-sm text-bal-text-main">{shipment.customer}</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Kargo</div>
                  <div className="text-xs font-bold text-bal-primary">{shipment.company}</div>
                </div>
                <div className="hidden lg:block space-y-0.5">
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Tahmini Teslim</div>
                  <div className="text-xs font-bold text-bal-text-main">{shipment.date}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-none border-bal-surface/50">
              <span className={`badge ${
                shipment.delayed ? "badge-danger" : "badge-success"
              }`}>
                {shipment.status}
              </span>
              
              {shipment.delayed && (
                <button 
                  onClick={() => handleInformCustomer(shipment.customer)}
                  className="btn-primary text-xs flex items-center gap-2 px-5 py-2.5 shadow-md shadow-bal-primary/10"
                >
                  <MessageSquare size={14} />
                  <span>Bilgi Ver</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Kargo Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-bal-border animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-6 top-6 text-bal-text-muted hover:text-bal-danger transition-colors"
            >
              <X size={24} />
            </button>

            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-bal-primary">Yeni Kargo Kaydı</h2>
                <p className="text-xs font-bold text-bal-text-muted uppercase tracking-widest">Sipariş ve kargo bilgilerini eşleştirin</p>
              </div>

              <form onSubmit={handleSaveKargo} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Sipariş ID</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                      <input 
                        required
                        type="text" 
                        value={formData.id}
                        onChange={(e) => setFormData({...formData, id: e.target.value})}
                        placeholder="#0000"
                        className="input-field pl-12 bg-bal-surface/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Kargo Firması</label>
                    <select 
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="input-field bg-bal-surface/30 font-bold"
                    >
                      <option value="Yurtiçi">Yurtiçi Kargo</option>
                      <option value="MNG">MNG Kargo</option>
                      <option value="Aras">Aras Kargo</option>
                      <option value="PTT">PTT Kargo</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Müşteri Adı</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.customer}
                      onChange={(e) => setFormData({...formData, customer: e.target.value})}
                      placeholder="Ad Soyad"
                      className="input-field pl-12 bg-bal-surface/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Takip Numarası</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.trackNo}
                      onChange={(e) => setFormData({...formData, trackNo: e.target.value})}
                      placeholder="TR000000000"
                      className="input-field pl-12 bg-bal-surface/30"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl border border-bal-border font-black text-bal-text-muted hover:bg-bal-surface transition-all"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-bal-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-bal-primary/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Modal */}
      {isAiModalOpen && (
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
              <button onClick={() => setIsAiModalOpen(false)} className="p-2 bg-bal-surface rounded-full hover:bg-bal-border/30 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-bal-surface/50 p-6 rounded-xl border border-bal-accent/10">
              <p className="text-sm font-bold text-bal-text-main leading-relaxed italic">
                "Merhaba {selectedCustomer}, kargonuz bölgesel yoğunluk nedeniyle kısa bir gecikme yaşıyor. Yarın elinizde olmasını bekliyoruz. Anlayışınız için teşekkür ederiz! 😊"
              </p>
            </div>
            
            <button className="w-full btn-primary py-4 text-sm uppercase tracking-widest font-black">
              Mesajı Gönder
            </button>
          </div>
        </div>
      )}

      {/* Status Card */}
      {status && (
        <StatusCard 
          status={status.type}
          title={status.title}
          message={status.message}
          onConfirm={() => setStatus(null)}
        />
      )}
    </div>
  );
}

