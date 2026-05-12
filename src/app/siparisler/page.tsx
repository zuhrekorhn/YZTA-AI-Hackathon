"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  MapPin, 
  Package,
  X,
  User,
  ShoppingBag,
  DollarSign,
  Layers,
  Edit2
} from "lucide-react";
import StatusCard from "@/components/StatusCard";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [status, setStatus] = useState<{ type: "success" | "error" | "confirm"; title: string; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState({ 
    customer: "", 
    productId: "", 
    quantity: "1", 
    address: "",
    paymentAmount: "0" 
  });

  useEffect(() => {
    // Load Inventory
    const savedInv = localStorage.getItem("inventory");
    if (savedInv) setInventory(JSON.parse(savedInv));

    // Load Orders
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Auto-calculate payment amount
  useEffect(() => {
    const product = inventory.find(p => p.id === Number(formData.productId));
    if (product && formData.quantity) {
      const total = Number(formData.quantity) * (product.unitCost || 0);
      setFormData(prev => ({ ...prev, paymentAmount: total.toString() }));
    }
  }, [formData.productId, formData.quantity, inventory]);

  const saveOrders = (newOrders: any[]) => {
    localStorage.setItem("orders", JSON.stringify(newOrders));
    setOrders(newOrders);
  };


  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const product = inventory.find(p => p.id === Number(formData.productId));
    
    if (!product) {
      setStatus({ type: "error", title: "Ürün Seçilmedi", message: "Lütfen listeden bir ürün seçiniz." });
      return;
    }

    const qty = Number(formData.quantity);
    if (qty > product.stock) {
      setStatus({ 
        type: "error", 
        title: "Yetersiz Stok", 
        message: `Seçilen üründen stokta sadece ${product.stock} ${product.unit} bulunmaktadır.` 
      });
      return;
    }

    let newOrders;
    if (editingOrder) {
      newOrders = orders.map(o => o.id === editingOrder.id ? { ...o, ...formData, id: editingOrder.id, product: product.name } : o);
    } else {
      const newOrder = {
        id: `#${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        product: product.name,
        date: "Bugün",
        status: "Bekliyor",
        statusColor: "warning",
        trackNo: "-"
      };
      newOrders = [newOrder, ...orders];
      
      // Update Stock
      const updatedInv = inventory.map(p => p.id === product.id ? { ...p, stock: p.stock - qty } : p);
      localStorage.setItem("inventory", JSON.stringify(updatedInv));
      setInventory(updatedInv);
    }

    saveOrders(newOrders);
    setStatus({
      type: "success",
      title: "Başarılı",
      message: editingOrder ? "Sipariş güncellendi." : "Yeni sipariş oluşturuldu ve stok düşüldü."
    });
    setShowAddModal(false);
    setEditingOrder(null);
    setFormData({ customer: "", productId: "", quantity: "1", address: "", paymentAmount: "0" });
  };

  const openEdit = (order: any) => {
    setEditingOrder(order);
    const prod = inventory.find(p => p.name === order.product);
    setFormData({
      customer: order.customer,
      productId: prod ? prod.id.toString() : "",
      quantity: order.quantity.toString(),
      address: order.address,
      paymentAmount: order.paymentAmount.toString()
    });
    setShowAddModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Siparişler</h1>
        <button 
          onClick={() => {
            setEditingOrder(null);
            setFormData({ customer: "", productId: "", quantity: "1", address: "", paymentAmount: "0" });
            setShowAddModal(true);
          }}
          className="w-12 h-12 bg-bal-primary text-white rounded-xl flex items-center justify-center shadow-md active:scale-95 transition-all"
        >
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
        {orders.length === 0 ? (
          <div className="card p-12 text-center space-y-4 border-dashed border-2">
            <div className="bg-bal-surface p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto text-bal-text-muted">
              <Package size={32} />
            </div>
            <div>
              <h3 className="text-lg font-black text-bal-primary">Henüz Sipariş Yok</h3>
              <p className="text-sm font-bold text-bal-text-muted">Yeni bir sipariş ekleyerek başlayabilirsiniz.</p>
            </div>
          </div>
        ) : orders.map((order) => {
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
                    <div className="text-[10px] font-bold text-bal-text-muted uppercase tracking-widest">{order.product} ({order.quantity} adet)</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-black text-bal-accent">{order.paymentAmount} TL</div>
                    <div className="text-[9px] font-bold text-bal-text-muted uppercase tracking-tighter">Ödenen Tutar</div>
                  </div>
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
                    <button 
                      onClick={() => openEdit(order)}
                      className="px-4 py-2.5 rounded-xl bg-white border border-bal-border font-bold text-xs text-bal-text-muted hover:bg-bal-surface transition-all flex items-center gap-2"
                    >
                      <Edit2 size={14} />
                      <span>Siparişi Düzenle</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Order Modal */}
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
                <h2 className="text-2xl font-black text-bal-primary">{editingOrder ? "Siparişi Düzenle" : "Yeni Sipariş Ekle"}</h2>
                <p className="text-xs font-bold text-bal-text-muted uppercase tracking-widest">Ürün stoğuna göre sipariş oluşturun</p>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Müşteri Adı</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Ürün Seçin</label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                      <select 
                        required
                        value={formData.productId}
                        onChange={(e) => setFormData({...formData, productId: e.target.value})}
                        className="input-field pl-12 bg-bal-surface/30 font-bold"
                      >
                        <option value="">Seçiniz...</option>
                        {inventory.map(item => (
                          <option key={item.id} value={item.id}>{item.name} (Mevcut: {item.stock})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Miktar</label>
                    <div className="relative">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                      <input 
                        required
                        type="number" 
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        onFocus={(e) => e.target.select()}
                        className="input-field pl-12 bg-bal-surface/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Ödeme Tutarı (TL)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                    <input 
                      required
                      type="number" 
                      value={formData.paymentAmount}
                      onChange={(e) => setFormData({...formData, paymentAmount: e.target.value})}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="input-field pl-12 bg-bal-surface/30 font-black text-bal-accent"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Teslimat Adresi</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-bal-accent" size={18} />
                    <textarea 
                      required
                      rows={3}
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="Tam adres..."
                      className="input-field pl-12 pt-3 bg-bal-surface/30 resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
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
                    {editingOrder ? "Güncelle" : "Siparişi Onayla"}
                  </button>
                </div>
              </form>
            </div>
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
