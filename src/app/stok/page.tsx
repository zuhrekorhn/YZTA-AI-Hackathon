"use client";

import { 
  Plus, 
  AlertTriangle, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import { INVENTORY_ITEMS } from "@/constants/mockData";

export default function InventoryPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Stok Yönetimi</h1>
        <button className="btn-accent flex items-center gap-2 text-sm">
          <Plus size={18} />
          <span>Ürün Ekle</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {INVENTORY_ITEMS.map((item) => {
          const isCritical = item.stock < item.threshold;
          const percentage = Math.min((item.stock / (item.threshold * 2)) * 100, 100);
          
          let barColor = "bg-bal-success";
          if (percentage < 25) barColor = "bg-bal-danger";
          else if (percentage < 50) barColor = "bg-bal-accent";
          
          return (
            <div 
              key={item.id} 
              className={`card flex flex-col justify-between transition-all ${
                isCritical ? "border-bal-danger/30 bg-bal-danger/[0.02]" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-bal-text-main">{item.name}</h3>
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-[0.2em] mt-2">Kritik Eşik: {item.threshold} {item.unit}</div>
                </div>
                {isCritical && (
                  <div className="bg-bal-danger p-2.5 rounded-xl text-white shadow-lg animate-pulse">
                    <AlertTriangle size={20} />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-black text-bal-text-main">
                    <span>Mevcut Stok:</span>
                    <span className={isCritical ? "text-bal-danger" : "text-bal-success"}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-bal-surface rounded-full overflow-hidden border border-bal-border/30">
                    <div 
                      className={`h-full transition-all duration-1000 ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 btn-accent text-xs py-3">Sipariş Ver</button>
                  <button className="px-6 py-3 rounded-xl bg-white border border-bal-border text-xs font-black text-bal-text-muted hover:bg-bal-surface transition-all">Düzenle</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Analizi Panel */}
      <section className="card bg-bal-accent/5 border-2 border-bal-accent/10 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-bal-accent p-2 rounded-xl text-white">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-black text-bal-primary">AI Stok Analizi</h3>
        </div>
        
        <div className="bg-white/80 p-6 rounded-xl border border-bal-border/50 shadow-sm space-y-4">
          <p className="text-sm font-bold text-bal-text-main leading-relaxed">
            Geçen haftaki satış hızına göre <span className="font-black text-bal-primary">Domates</span> stoğunu <span className="font-black text-bal-danger">3 gün içinde</span> tüketeceksiniz. Mevcut lojistik sürelerini hesapladığımda bugün <span className="font-black text-bal-success">80 kg</span> sipariş vermeniz önerilir.
          </p>
          <button className="flex items-center gap-2 text-xs font-black text-bal-accent hover:underline transition-all uppercase tracking-widest">
            Tedarikçi ile Görüş <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}
