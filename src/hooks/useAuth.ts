"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
  const router = useRouter();
  const [kurumAdi, setKurumAdi] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("kurumAdi");
    if (saved) {
      setKurumAdi(saved);
    }
    setIsLoading(false);
  }, []);

  const login = (name: string) => {
    localStorage.setItem("kurumAdi", name);
    setKurumAdi(name);
    router.push("/");
  };

  const logout = () => {
    localStorage.removeItem("kurumAdi");
    setKurumAdi(null);
    router.push("/login");
  };

  return { kurumAdi, login, logout, isLoading };
}
