"use client";

import { useState } from "react";
import { 
  Truck, 
  Clock, 
  CheckCircle2, 
  Search,
  MessageSquare,
  X,
  Sparkles
} from "lucide-react";
import { SHIPMENTS } from "@/constants/mockData";

export default function ShippingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const handleInformCustomer = (customer: string) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Kargo Takibi</h1>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bal-text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Kargo ara..." 
            className="input-field pl-10 py-2.5 text-xs bg-white border border-bal-border w-64"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Aktif Kargo", val: 82, icon: Truck, color: "text-bal-accent" },
          { label: "Geciken", val: 3, icon: Clock, color: "text-bal-danger", isDanger: true },
          { label: "Bugün Teslim", val: 12, icon: CheckCircle2, color: "text-bal-success" },
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
        {SHIPMENTS.map((shipment) => (
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

      {/* AI Modal */}
      {isModalOpen && (
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
    </div>
  );
}
