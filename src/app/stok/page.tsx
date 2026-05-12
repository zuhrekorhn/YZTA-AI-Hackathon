"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  X,
  Package,
  Layers,
  Zap,
  Trash2,
  DollarSign
} from "lucide-react";
import { INVENTORY_ITEMS as MOCK_INVENTORY } from "@/constants/mockData";
import StatusCard from "@/components/StatusCard";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | "confirm"; title: string; message: string } | null>(null);

  const [formData, setFormData] = useState({ name: "", stock: "", threshold: "", unit: "adet", unitCost: "" });

  useEffect(() => {
    const saved = localStorage.getItem("inventory");
    if (saved) {
      setItems(JSON.parse(saved));
    } else {
      setItems([]);
    }
  }, []);

  const saveToLocalStorage = (newItems: any[]) => {
    localStorage.setItem("inventory", JSON.stringify(newItems));
    setItems(newItems);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.stock && formData.unitCost) {
      let updatedItems;
      if (editingItem) {
        updatedItems = items.map(item => 
          item.id === editingItem.id 
            ? { ...item, ...formData, stock: Number(formData.stock), threshold: Number(formData.threshold), unitCost: Number(formData.unitCost) } 
            : item
        );
      } else {
        const newItem = {
          id: Date.now(),
          ...formData,
          stock: Number(formData.stock),
          threshold: Number(formData.threshold),
          unitCost: Number(formData.unitCost)
        };
        updatedItems = [...items, newItem];
      }

      saveToLocalStorage(updatedItems);
      
      setStatus({
        type: "success",
        title: editingItem ? "Güncelleme Başarılı" : "Ekleme Başarılı",
        message: editingItem ? "Ürün bilgileri başarıyla güncellendi." : "Yeni ürün başarıyla stoğa eklendi."
      });
      setShowAddModal(false);
      setEditingItem(null);
      setFormData({ name: "", stock: "", threshold: "", unit: "adet", unitCost: "" });
    } else {
      setStatus({
        type: "error",
        title: "Hata",
        message: "Lütfen zorunlu alanları doldurun."
      });
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingId(id);
    setStatus({
      type: "confirm",
      title: "Emin misiniz?",
      message: "Bu ürünü stoktan silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
    });
  };

  const handleDelete = () => {
    const updatedItems = items.filter(item => item.id !== deletingId);
    saveToLocalStorage(updatedItems);
    setStatus({
      type: "success",
      title: "Silindi",
      message: "Ürün stoktan başarıyla kaldırıldı."
    });
    setDeletingId(null);
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      stock: item.stock.toString(),
      threshold: item.threshold.toString(),
      unit: item.unit,
      unitCost: item.unitCost?.toString() || ""
    });
    setShowAddModal(true);
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Stok Yönetimi</h1>
        <button 
          onClick={() => {
            setEditingItem(null);
            setFormData({ name: "", stock: "", threshold: "", unit: "adet", unitCost: "" });
            setShowAddModal(true);
          }}
          className="btn-accent flex items-center gap-2 text-sm"
        >
          <Plus size={18} />
          <span>Ürün Ekle</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full card p-12 text-center space-y-4 border-dashed border-2">
            <div className="bg-bal-surface p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-bal-text-muted">
              <Layers size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-bal-primary">Stokta Ürün Yok</h3>
              <p className="text-sm font-bold text-bal-text-muted">Ürün ekleyerek stoğunuzu yönetmeye başlayabilirsiniz.</p>
            </div>
          </div>
        ) : items.map((item) => {


          const isCritical = item.stock < item.threshold;
          const percentage = Math.min((item.stock / (item.threshold * 2)) * 100, 100);
          
          let barColor = "bg-bal-success";
          if (percentage < 25) barColor = "bg-bal-danger";
          else if (percentage < 50) barColor = "bg-bal-accent";
          
          return (
            <div 
              key={item.id} 
              className={`card flex flex-col justify-between transition-all hover:shadow-lg ${
                isCritical ? "border-bal-danger/30 bg-bal-danger/[0.02]" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-bal-text-main">{item.name}</h3>
                  <div className="flex gap-4 mt-2">
                    <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-[0.2em]">Kritik Eşik: {item.threshold} {item.unit}</div>
                    <div className="text-[10px] font-black text-bal-accent uppercase tracking-[0.2em]">Birim Maliyet: {item.unitCost} TL</div>
                  </div>
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
                  <button 
                    onClick={() => openEdit(item)}
                    className="flex-1 px-6 py-3 rounded-xl bg-white border border-bal-border text-xs font-black text-bal-text-muted hover:bg-bal-surface transition-all"
                  >
                    Düzenle
                  </button>
                  <button 
                    onClick={() => confirmDelete(item.id)}
                    className="px-6 py-3 rounded-xl bg-bal-danger/10 border border-bal-danger/20 text-xs font-black text-bal-danger hover:bg-bal-danger hover:text-white transition-all flex items-center gap-2"
                  >
                    <Trash2 size={14} />
                    <span>Sil</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl border border-bal-border animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-6 top-6 text-bal-text-muted hover:text-bal-danger transition-colors"
            >
              <X size={24} />
            </button>

            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-bal-primary">{editingItem ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}</h2>
                <p className="text-xs font-bold text-bal-text-muted uppercase tracking-widest">Stok ve maliyet bilgilerini giriniz</p>
              </div>

              <form onSubmit={handleSave} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Ürün Adı</label>
                  <div className="relative">
                    <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Ürün ismini giriniz"
                      className="input-field pl-12 bg-bal-surface/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Stok Miktarı</label>
                  <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="number" 
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="input-field pl-12 bg-bal-surface/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Kritik Eşik</label>
                  <div className="relative">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="number" 
                      value={formData.threshold}
                      onChange={(e) => setFormData({...formData, threshold: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="input-field pl-12 bg-bal-surface/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Birim Maliyet (TL)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="number" 
                      value={formData.unitCost}
                      onChange={(e) => setFormData({...formData, unitCost: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="input-field pl-12 bg-bal-surface/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Birim</label>
                  <select 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="input-field bg-bal-surface/30 font-bold"
                  >
                    <option value="adet">Adet</option>
                    <option value="kg">KG</option>
                    <option value="L">Litre</option>
                    <option value="paket">Paket</option>
                    <option value="kavanoz">Kavanoz</option>
                    <option value="teneke">Teneke</option>
                  </select>
                </div>

                <div className="col-span-2 flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-4 rounded-2xl border border-bal-border font-black text-bal-text-muted hover:bg-bal-surface transition-all"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-bal-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-bal-primary/20 hover:opacity-90 active:scale-95 transition-all"
                  >
                    {editingItem ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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
            Satış hızınıza göre <span className="font-black text-bal-primary">bazı ürünlerin</span> stoğu <span className="font-black text-bal-danger">yakın zamanda</span> tükenebilir. Mevcut lojistik sürelerini hesapladığımda en kısa sürede sipariş vermeniz önerilir.
          </p>
          <button className="flex items-center gap-2 text-xs font-black text-bal-accent hover:underline transition-all uppercase tracking-widest">
            Tedarikçi ile Görüş <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Status Card */}
      {status && (
        <StatusCard 
          status={status.type}
          title={status.title}
          message={status.message}
          onConfirm={() => {
            if (status.type === "confirm") {
              handleDelete();
            } else {
              setStatus(null);
            }
          }}
          onCancel={status.type === "confirm" ? () => setStatus(null) : undefined}
        />
      )}
    </div>
  );
}

