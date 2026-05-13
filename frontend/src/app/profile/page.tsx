"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/lib/api";
import { 
  Building2, 
  MapPin, 
  Users, 
  Phone, 
  Mail, 
  Briefcase, 
  ShieldCheck,
  Star,
  Settings,
  Bot,
  X,
  Save
} from "lucide-react";

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "",
    id: "",
    email: "",
    phone: "",
    address: "",
    taxNumber: "",
    employeeCount: "-",
    activeMembers: "-",
    rating: "-"
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ ...profileData });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const localName = window.localStorage.getItem("koopai_business_name") || "";
    const localId = window.localStorage.getItem("koopai_business_id") || "";

    const loadData = async () => {
      try {
        const data = await getProfile();
        setProfileData({
          name: data.name || localName,
          id: data.id || localId,
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          taxNumber: data.tax_number || "",
          employeeCount: data.employee_count || "-",
          activeMembers: data.active_members || "-",
          rating: data.rating || "-"
        });
      } catch (err) {
        setProfileData(prev => ({
          ...prev,
          name: localName,
          id: localId,
        }));
      }
    };
    loadData();
  }, []);

  const openEditModal = () => {
    setEditFormData({ ...profileData });
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setProfileData(editFormData);
      setIsEditModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-bal-primary">Profil & Ayarlar</h1>
          <p className="text-[10px] font-bold text-bal-text-muted uppercase tracking-widest mt-1">
            İşletme Bilgileri
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-bal-border text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-bal-accent/40 to-bal-primary/20" />
            <div className="relative z-10">
              <div className="w-24 h-24 mx-auto bg-white rounded-full p-2 shadow-lg mb-4">
                <div className="w-full h-full bg-bal-primary rounded-full flex items-center justify-center">
                  <Building2 size={40} className="text-white" />
                </div>
              </div>
              <h2 className="text-xl font-black text-bal-primary">{profileData.name}</h2>
              <div className="flex items-center justify-center gap-1.5 mt-2 text-bal-text-muted">
                <ShieldCheck size={14} className="text-bal-success" />
                <span className="text-xs font-bold uppercase tracking-widest">Doğrulanmış İşletme</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-bal-border space-y-4">
            <h3 className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest mb-4">Özet İstatistikler</h3>
            
            <div className="flex items-center justify-between py-2 border-b border-bal-surface last:border-0">
              <div className="flex items-center gap-3 text-bal-text-main">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Users size={16} /></div>
                <span className="text-sm font-bold">Çalışan Sayısı</span>
              </div>
              <span className="font-black text-bal-primary">{profileData.employeeCount}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-bal-surface last:border-0">
              <div className="flex items-center gap-3 text-bal-text-main">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Briefcase size={16} /></div>
                <span className="text-sm font-bold">Aktif Üye</span>
              </div>
              <span className="font-black text-bal-primary">{profileData.activeMembers}</span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-bal-surface last:border-0">
              <div className="flex items-center gap-3 text-bal-text-main">
                <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg"><Star size={16} /></div>
                <span className="text-sm font-bold">Müşteri Puanı</span>
              </div>
              <span className="font-black text-bal-primary">{profileData.rating}/5.0</span>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-bal-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-bal-primary">Genel Bilgiler</h3>
              <button onClick={openEditModal} className="text-[10px] font-black text-bal-accent uppercase tracking-widest flex items-center gap-1 hover:underline">
                <Settings size={14} /> Düzenle
              </button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Building2 size={12} /> İşletme Adı
                </label>
                <div className="text-sm font-bold text-bal-text-main p-3 bg-bal-surface rounded-xl border border-bal-border/50">
                  {profileData.name || "-"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> Sistem ID / Vergi No
                </label>
                <div className="text-sm font-bold text-bal-text-main p-3 bg-bal-surface rounded-xl border border-bal-border/50">
                  {profileData.taxNumber || "-"} (ID: {profileData.id || "-"})
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Mail size={12} /> E-Posta Adresi
                </label>
                <div className="text-sm font-bold text-bal-text-main p-3 bg-bal-surface rounded-xl border border-bal-border/50">
                  {profileData.email || "-"}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> Telefon
                </label>
                <div className="text-sm font-bold text-bal-text-main p-3 bg-bal-surface rounded-xl border border-bal-border/50">
                  {profileData.phone || "-"}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest flex items-center gap-2">
                  <MapPin size={12} /> Adres
                </label>
                <div className="text-sm font-bold text-bal-text-main p-3 bg-bal-surface rounded-xl border border-bal-border/50">
                  {profileData.address || "-"}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-bal-primary to-blue-900 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <h3 className="text-lg font-black flex items-center gap-2">
                <Star className="text-bal-accent" fill="currentColor" size={20} />
                Premium Plan
              </h3>
              <p className="text-sm opacity-80 max-w-md leading-relaxed">
                İşletmeniz şu anda <strong>KoopAI Premium</strong> özellikleri ile korunuyor. Yapay zeka asistanınız aktif olarak müşteri mesajlarını yanıtlıyor ve stok tahminleri üretiyor.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none -mb-10 -mr-10">
              <Bot size={200} />
            </div>
          </div>
        </div>

      </div>

      {/* Profile Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-bal-border flex items-center justify-between bg-gradient-to-r from-bal-surface/30 to-transparent">
              <div className="flex items-center gap-3">
                <div className="bg-bal-primary p-2 rounded-xl text-white shadow-sm">
                  <Settings size={20} />
                </div>
                <h2 className="text-xl font-black text-bal-primary">
                  Profili Düzenle
                </h2>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 hover:bg-bal-surface rounded-full text-bal-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">İşletme Adı</label>
                <input 
                  required
                  type="text" 
                  className="input-field border-2 focus:border-bal-primary w-full px-3 py-2 rounded-lg"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">E-Posta</label>
                  <input 
                    type="email" 
                    className="input-field border-2 focus:border-bal-primary w-full px-3 py-2 rounded-lg"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Telefon</label>
                  <input 
                    type="text" 
                    className="input-field border-2 focus:border-bal-primary w-full px-3 py-2 rounded-lg"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Çalışan Sayısı</label>
                  <input 
                    type="number"
                    min="0"
                    className="input-field border-2 focus:border-bal-primary w-full px-3 py-2 rounded-lg"
                    value={editFormData.employeeCount === "-" ? "" : editFormData.employeeCount}
                    onChange={(e) => setEditFormData({...editFormData, employeeCount: e.target.value || "-"}) }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Aktif Üye</label>
                  <input 
                    type="number"
                    min="0"
                    className="input-field border-2 focus:border-bal-primary w-full px-3 py-2 rounded-lg"
                    value={editFormData.activeMembers === "-" ? "" : editFormData.activeMembers}
                    onChange={(e) => setEditFormData({...editFormData, activeMembers: e.target.value || "-"}) }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest">Adres</label>
                <textarea 
                  className="input-field border-2 focus:border-bal-primary w-full px-3 py-2 rounded-lg resize-none h-20"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-bal-border font-bold text-bal-text-muted hover:bg-bal-surface hover:text-bal-text-main transition-all"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-2 bg-bal-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 px-6"
                >
                  <Save size={18} />
                  {isSubmitting ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
