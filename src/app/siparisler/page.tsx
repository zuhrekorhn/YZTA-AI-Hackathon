"use client";

import { useState } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  MapPin, 
  Package
} from "lucide-react";

const MOCK_ORDERS = [
  { 
    id: "#1847", customer: "Ayşe Yılmaz", product: "Süzme Bal", date: "Bugün", status: "Kargoda", statusColor: "success",
    address: "Atatürk Mah. Karanfil Sok. Karabük", trackNo: "YT123456789"
  },
  { 
    id: "#1846", customer: "Mehmet Demir", product: "Kuru İncir", date: "Bugün", status: "Bekliyor", statusColor: "warning",
    address: "Yenişehir Mah. Özlem Cad. Safranbolu", trackNo: "-"
  },
  { 
    id: "#1845", customer: "Fatma Çelik", product: "Zeytinyağı", date: "Dün", status: "Gecikiyor", statusColor: "danger",
    address: "Cumhuriyet Mah. Gül Sok. Eskipazar", trackNo: "MNG987654321"
  },
];

export default function OrdersPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Siparişler</h1>
        <button className="w-12 h-12 bg-bal-primary text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all">
          <Plus size={24} />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-text-muted" size={18} />
        <input 
          type="text" 
          placeholder="İsim veya ürün ara..." 
          className="input-field pl-12 bg-white border border-bal-border shadow-sm"
        />
      </div>

      <div className="space-y-3">
        {MOCK_ORDERS.map((order) => {
          const isExpanded = expandedId === order.id;
          
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
                  <div className="text-[10px] font-black text-bal-text-muted font-mono">{order.id}</div>
                  <div>
                    <div className="text-base font-black text-bal-text-main">{order.customer}</div>
                    <div className="text-[10px] font-bold text-bal-text-muted uppercase tracking-widest">{order.product}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <span className={`badge ${
                    order.statusColor === 'success' ? 'badge-success' : 
                    order.statusColor === 'warning' ? 'badge-warning' : 
                    'badge-danger'
                  }`}>
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
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-bal-text-muted uppercase tracking-widest">
                        <MapPin size={12} />
                        <span>Teslimat Adresi</span>
                      </div>
                      <p className="text-sm font-bold text-bal-text-main leading-relaxed">
                        {order.address}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-bal-text-muted uppercase tracking-widest">
                        <Package size={12} />
                        <span>Kargo Takip No</span>
                      </div>
                      <p className="text-sm font-mono font-black text-bal-primary">
                        {order.trackNo}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 flex gap-3">
                    <button className="btn-primary flex-1 text-sm">Faturayı Yazdır</button>
                    <button className="px-4 py-2.5 rounded-xl bg-white border border-bal-border font-bold text-xs text-bal-text-muted hover:bg-bal-surface transition-all">Siparişi Düzenle</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
