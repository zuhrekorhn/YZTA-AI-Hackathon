"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerBusiness } from "@/lib/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await registerBusiness(name, email, password);
      router.push("/");
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow mt-8">
      <h2 className="text-2xl font-black mb-4">Kayıt Ol</h2>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="İşletme adı" className="w-full border px-3 py-2 rounded" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifre" type="password" className="w-full border px-3 py-2 rounded" />
        <div className="flex items-center justify-between">
          <button disabled={loading} className="bg-bal-primary text-white px-4 py-2 rounded">{loading ? "Kayıt..." : "Kayıt Ol"}</button>
          <a href="/login" className="text-sm text-bal-accent">Zaten hesabınız var mı?</a>
        </div>
      </form>
    </div>
  );
}
