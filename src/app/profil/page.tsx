"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  Save,
  User,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatusCard from "@/components/StatusCard";

export default function ProfilePage() {
  const { kurumAdi } = useAuth();
  const [status, setStatus] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    taxNo: "",
    manager: "",
    employeeCount: ""
  });


  useEffect(() => {
    if (kurumAdi) {
      const savedCount = localStorage.getItem("employeeCount") || "";
      setFormData(prev => ({ ...prev, name: kurumAdi, employeeCount: savedCount }));
    }
  }, [kurumAdi]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("kurumAdi", formData.name);
    localStorage.setItem("employeeCount", formData.employeeCount);
    setStatus({
      type: "success",
      title: "Profil Güncellendi",
      message: "Şirket bilgileri başarıyla kaydedildi."
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-bal-primary">Şirket Profili</h1>
        <div className="flex items-center gap-2 bg-bal-success/10 px-4 py-2 rounded-xl text-bal-success border border-bal-success/20">
          <ShieldCheck size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Hesap Durumu: Aktif</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Visual Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card text-center p-8 space-y-4 border-2 border-bal-accent/10">
            <div className="w-24 h-24 bg-bal-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-bal-primary">
              <Building2 size={48} />
            </div>
            <div>
              <h2 className="text-xl font-black text-bal-primary">{formData.name}</h2>
              <p className="text-xs font-bold text-bal-text-muted uppercase tracking-widest mt-1">Kurumsal Kullanıcı</p>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h3 className="text-xs font-black text-bal-text-muted uppercase tracking-[0.2em]">Sistem Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-bal-text-muted">Çalışan Sayısı</span>
                <span className="text-sm font-black text-bal-primary">{formData.employeeCount || "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-bal-text-muted">Hesap Türü</span>
                <span className="text-sm font-black text-bal-success">Yönetici</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-bal-text-muted">AI Desteği</span>
                <span className="text-sm font-black text-bal-accent">Aktif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="card p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Kurum Adı</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field pl-12 bg-bal-surface/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Yetkili Kişi</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.manager}
                    onChange={(e) => setFormData({...formData, manager: e.target.value})}
                    className="input-field pl-12 bg-bal-surface/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">E-posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field pl-12 bg-bal-surface/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="input-field pl-12 bg-bal-surface/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Vergi Numarası</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                  <input 
                    required
                    type="text" 
                    value={formData.taxNo}
                    onChange={(e) => setFormData({...formData, taxNo: e.target.value})}
                    className="input-field pl-12 bg-bal-surface/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Çalışan Sayısı</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-bal-accent" size={18} />
                  <input 
                    required
                    type="number" 
                    value={formData.employeeCount}
                    onChange={(e) => setFormData({...formData, employeeCount: e.target.value})}
                    className="input-field pl-12 bg-bal-surface/30"
                    placeholder="0"
                  />
                </div>
              </div>


              <div className="col-span-full space-y-2">
                <label className="text-[10px] font-black text-bal-text-muted uppercase tracking-widest ml-1">Adres</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-bal-accent" size={18} />
                  <textarea 
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="input-field pl-12 pt-3 bg-bal-surface/30 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button 
                type="submit"
                className="bg-bal-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-bal-primary/20 hover:opacity-90 active:scale-95 transition-all"
              >
                <Save size={20} />
                <span>Değişiklikleri Kaydet</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {status && (
        <StatusCard 
          status={status.type}
          title={status.title}
          message={status.message}
          onConfirm={() => {
            setStatus(null);
            if (status.type === "success") window.location.reload();
          }}
        />
      )}
    </div>
  );
}
