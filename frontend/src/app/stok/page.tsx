"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Save,
  Package,
  Trash2
} from "lucide-react";
import { getDashboardProducts, predictStockout, updateProductStock } from "@/lib/api";
import { EmptyState, ErrorState, LoadingState } from "@/components/AsyncState";
import type { ProductResponse, StockPredictionResponse } from "@/lib/types";

function getStockPercent(stock: number, threshold: number): number {
  if (threshold <= 0) return 100;
  return Math.min((stock / (threshold * 2)) * 100, 100);
}

export default function InventoryPage() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [predictionMap, setPredictionMap] = useState<Record<string, StockPredictionResponse>>({});
  const [updatingProductId, setUpdatingProductId] = useState<number | null>(null);

  // Modal & Message Card States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageCard, setMessageCard] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  // Product Form State (For Edit and Add)
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    stock: "0",
    unit: "Adet",
    price: "0",
    critical_threshold: "0"
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const productData = await getDashboardProducts();
      setProducts(productData);

      const predictionEntries = await Promise.all(
        productData.map(async (product) => {
          try {
            const prediction = await predictStockout(product.name);
            return [product.name, prediction] as const;
          } catch {
            return [product.name, {
              product: product.name,
              current_stock: product.stock,
              unit: product.unit,
              avg_daily_sales: 0,
              days_until_stockout: null,
              recommended_order: 0,
              status: "VERİ YOK",
              message: "Tahmin verisi alınamadı.",
            }] as const;
          }
        })
      );

      setPredictionMap(Object.fromEntries(predictionEntries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Stok verileri yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const criticalCount = useMemo(() => products.filter((product) => product.stock <= product.critical_threshold).length, [products]);

  const topPrediction = useMemo(() => {
    const predictions = Object.values(predictionMap).filter((p) => !p.error && p.status !== "VERİ YOK");
    if (predictions.length === 0) return null;

    return predictions.sort((a, b) => {
      const aVal = a.days_until_stockout ?? Number.POSITIVE_INFINITY;
      const bVal = b.days_until_stockout ?? Number.POSITIVE_INFINITY;
      return aVal - bVal;
    })[0];
  }, [predictionMap]);

  const handleAddStock = async (product: ProductResponse, increment: number) => {
    setUpdatingProductId(product.id);
    setError(null);
    const nextStock = product.stock + increment;
    try {
      await updateProductStock(product.id, nextStock);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: nextStock, status: nextStock <= p.critical_threshold ? "KRİTİK" : "NORMAL" } : p)));
      
      try {
        const nextPrediction = await predictStockout(product.name);
        setPredictionMap((prev) => ({ ...prev, [product.name]: nextPrediction }));
      } catch (err) {
        console.error("Tahmin güncellenemedi", err);
      }
      
      setMessageCard({ type: "success", text: `"${product.name}" stoku ${increment} artırıldı.` });
    } catch (err) {
      setMessageCard({ type: "error", text: err instanceof Error ? err.message : "Stok güncellenemedi" });
    } finally {
      setUpdatingProductId(null);
    }
  };

  const handleApplyRecommendation = async (product: ProductResponse) => {
    const prediction = predictionMap[product.name];
    if (!prediction || !prediction.recommended_order) return setError("Öneri bulunamadı.");
    const amount = Math.max(1, Math.round(prediction.recommended_order));
    await handleAddStock(product, amount);
  };

  const openDeleteConfirm = (product: ProductResponse) => {
    setDeleteConfirmId(product.id);
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      setProducts(prev => prev.filter(p => p.id !== deleteConfirmId));
      setMessageCard({ type: "success", text: "Ürün başarıyla silindi." });
    } catch (err) {
      setMessageCard({ type: "error", text: "Silme işlemi sırasında bir hata oluştu." });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setFormData({
      name: "",
      stock: "0",
      unit: "Adet",
      price: "0",
      critical_threshold: "10"
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product: ProductResponse) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      stock: String(product.stock),
      unit: product.unit,
      price: String(product.price),
      critical_threshold: String(product.critical_threshold)
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // MOCK API CALL for Add/Edit
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
      
      const payload: ProductResponse = {
        id: editingProductId || Math.floor(Math.random() * 1000) + 1000,
        name: formData.name,
        stock: parseInt(formData.stock) || 0,
        unit: formData.unit || "Adet",
        price: parseFloat(formData.price) || 0,
        critical_threshold: parseInt(formData.critical_threshold) || 0,
        status: parseInt(formData.stock) <= parseInt(formData.critical_threshold) ? "KRİTİK" : "NORMAL"
      };

      if (editingProductId) {
        setProducts(prev => prev.map(p => p.id === editingProductId ? payload : p));
        setMessageCard({ type: "success", text: "Ürün başarıyla güncellendi." });
      } else {
        setProducts(prev => [payload, ...prev]);
        setMessageCard({ type: "success", text: "Yeni ürün başarıyla eklendi." });
      }
      
      setIsModalOpen(false);
    } catch (err) {
      setMessageCard({ type: "error", text: "İşlem sırasında bir hata oluştu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-bal-primary">Stok Yönetimi</h1>
          <p className="text-[10px] font-bold text-bal-text-muted uppercase tracking-widest mt-1">
            {criticalCount > 0 ? `${criticalCount} kritik ürün bulunuyor` : "Tüm ürünlerin stok durumu iyi"}
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="btn-primary flex items-center gap-2 px-6"
        >
          <Plus size={18} />
          <span>Yeni Ürün</span>
        </button>
      </div>

      {error && (
        <ErrorState message={error} />
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {loading && <LoadingState message="Stok verileri yükleniyor..." />}
        {!loading && products.length === 0 && <EmptyState message="Ürün bulunamadı." />}

        {products.map((item) => {
          const isCritical = item.stock <= item.critical_threshold;
          const percentage = getStockPercent(item.stock, item.critical_threshold);
          const prediction = predictionMap[item.name];
          
          let barColor = "bg-green-500";
          if (percentage < 25) barColor = "bg-red-500";
          else if (percentage < 50) barColor = "bg-yellow-500";
          if (isCritical) barColor = "bg-red-500"; // Enforce red if critical
          
          return (
            <div 
              key={item.id} 
              className={`card flex flex-col justify-between transition-all ${
                isCritical ? "border-red-500/30 bg-red-50" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className={`text-xl font-black ${isCritical ? "text-red-700" : "text-bal-text-main"}`}>{item.name}</h3>
                    <button 
                      onClick={() => openDeleteConfirm(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                    >
                      <Trash2 size={14} /> Sil
                    </button>
                  </div>
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-[0.2em] mt-2">Kritik Eşik: {item.critical_threshold} {item.unit}</div>
                </div>
                {isCritical && (
                  <div className="bg-red-500 p-2.5 rounded-xl text-white shadow-lg animate-pulse">
                    <AlertTriangle size={20} />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-black text-bal-text-main">
                    <span>Mevcut Stok:</span>
                    <span className={isCritical ? "text-red-600" : "text-green-600"}>
                      {item.stock} {item.unit}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-bal-text-muted">
                    <span>Birim Fiyatı:</span>
                    <span>₺{item.price}</span>
                  </div>
                  <div className="h-3 w-full bg-white rounded-full overflow-hidden border border-bal-border/50 shadow-inner">
                    <div 
                      className={`h-full transition-all duration-1000 shadow-sm ${barColor}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {prediction && (
                  <div className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest bg-white/60 p-3 rounded-xl border border-bal-border/40">
                    {prediction.status} · {prediction.days_until_stockout ?? "-"} gün · Öneri: {prediction.recommended_order} {item.unit}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => openEditModal(item)}
                      className="btn-accent text-xs py-2 px-4 flex items-center gap-1.5"
                    >
                      <Edit2 size={14} /> Düzenle
                    </button>
                    <button
                      onClick={() => handleAddStock(item, 10)}
                      disabled={updatingProductId === item.id}
                      className="btn-accent text-xs py-2 px-4 disabled:opacity-50"
                    >
                      +10 Stok
                    </button>
                    <button
                      onClick={() => handleAddStock(item, 50)}
                      disabled={updatingProductId === item.id}
                      className="btn-primary bg-bal-text-main text-xs py-2 px-4 disabled:opacity-50"
                    >
                      +50 Stok
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    {prediction && prediction.recommended_order > 0 && (
                      <button onClick={() => handleApplyRecommendation(item)} disabled={updatingProductId === item.id} className="text-xs font-bold px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors border border-green-200">
                        Uygula ({Math.round(prediction.recommended_order)})
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Analizi Panel */}
      <section className="card bg-gradient-to-br from-white to-bal-accent/5 border-2 border-bal-accent/10 shadow-xl shadow-bal-accent/5 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-tr from-bal-accent to-blue-500 p-2.5 rounded-xl text-white shadow-md">
            <Sparkles size={20} />
          </div>
          <h3 className="text-lg font-black text-bal-primary">AI Stok Analizi</h3>
        </div>
        
        <div className="bg-white/80 p-6 rounded-xl border border-bal-border/50 shadow-sm space-y-4">
          <p className="text-sm font-bold text-bal-text-main leading-relaxed">
            {topPrediction ? (
              <>
                Geçmiş satış hızına göre <span className="font-black text-bal-primary">{topPrediction.product}</span> stoğunu <span className="font-black text-bal-danger">{topPrediction.days_until_stockout ?? "-"} gün içinde</span> tüketebilirsiniz. 
                Bugün için önerilen ek sipariş miktarı <span className="font-black text-bal-success">{topPrediction.recommended_order} {topPrediction.unit}</span>.
              </>
            ) : (
              "Yeterli tahmin verisi bulunamadı."
            )}
          </p>
          {topPrediction && topPrediction.recommended_order > 0 && (
            <button
              onClick={() => {
                const product = products.find((p) => p.name === topPrediction.product);
                if (product) void handleAddStock(product, Math.max(10, Math.round(topPrediction.recommended_order)));
              }}
              className="flex items-center gap-2 text-xs font-black text-bal-accent hover:underline transition-all uppercase tracking-widest mt-2"
            >
              Önerilen Stoğu Uygula <ArrowRight size={16} />
            </button>
          )}
        </div>
      </section>

      {/* Product Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-bal-border flex items-center justify-between bg-gradient-to-r from-bal-surface/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-bal-primary p-2 rounded-xl text-white shadow-sm">
                  <Package size={20} />
                </div>
                <h2 className="text-xl font-black text-bal-primary">
                  {editingProductId ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}
                </h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-bal-surface rounded-full text-bal-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Ürün Adı</label>
                <input 
                  required
                  type="text" 
                  placeholder="Örn: Bal, Sabun"
                  className="input-field border-2 focus:border-bal-primary"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Başlangıç Stoğu</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    className="input-field border-2 focus:border-bal-primary"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Birim</label>
                  <select 
                    required
                    className="input-field border-2 focus:border-bal-primary"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  >
                    <option value="Adet">Adet</option>
                    <option value="Kg">Kg</option>
                    <option value="Lt">Lt</option>
                    <option value="Gram">Gram</option>
                    <option value="Kutu">Kutu</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Birim Fiyat (₺)</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    step="0.01"
                    className="input-field border-2 focus:border-bal-primary"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-danger uppercase tracking-widest">Kritik Eşik</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    className="input-field border-2 focus:border-bal-danger/50"
                    value={formData.critical_threshold}
                    onChange={(e) => setFormData({...formData, critical_threshold: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-bal-border font-bold text-bal-text-muted hover:bg-bal-surface hover:text-bal-text-main transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 bg-bal-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200 border-t-4 border-t-red-500">
            <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner bg-red-100 text-red-600">
              <Trash2 size={40} />
            </div>
            <h3 className="text-xl font-black text-bal-text-main mb-3">Silme Onayı</h3>
            <p className="text-sm text-bal-text-muted mb-8 leading-relaxed">
              Bu ürünü silmek istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-4 rounded-2xl border-2 border-bal-border text-bal-text-muted font-black hover:bg-bal-surface transition-all"
              >
                İPTAL
              </button>
              <button 
                onClick={handleDeleteProduct}
                className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-black hover:opacity-90 shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                TAMAM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Card (Success/Error) */}
      {messageCard && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 text-center animate-in zoom-in-95 duration-200 border-t-4 border-t-bal-primary">
            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-inner ${
              messageCard.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            }`}>
              {messageCard.type === "success" ? <CheckCircle2 size={40} /> : <AlertCircle size={40} />}
            </div>
            <h3 className="text-xl font-black text-bal-text-main mb-3">
              {messageCard.type === "success" ? "Başarılı!" : "Bir Hata Oluştu"}
            </h3>
            <p className="text-sm text-bal-text-muted mb-8 leading-relaxed">
              {messageCard.text}
            </p>
            <button 
              onClick={() => setMessageCard(null)}
              className="w-full py-4 rounded-2xl bg-bal-primary text-white font-black hover:opacity-90 shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              TAMAM
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
