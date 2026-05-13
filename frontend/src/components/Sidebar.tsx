"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Box, 
  Truck, 
  MessageSquare,
  User,
  LogOut
} from "lucide-react";
import { logout } from "@/lib/api";

const navItems = [
  { name: "Ana Sayfa", href: "/", icon: LayoutDashboard },
  { name: "Siparişler", href: "/siparisler", icon: ShoppingBag },
  { name: "Stok", href: "/stok", icon: Box },
  { name: "Kargo", href: "/kargo", icon: Truck },
  { name: "Müşteri", href: "/sohbet", icon: MessageSquare },
  { name: "Profil", href: "/profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-bal-bg flex-col py-6 sticky top-20 h-[calc(100vh-80px)] justify-between">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-bold transition-all border-l-4 ${
                  isActive 
                    ? "border-bal-accent text-bal-primary bg-bal-surface" 
                    : "border-transparent text-bal-text-muted hover:bg-bal-surface/50"
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-6 mt-auto pb-4">
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-bal-danger border-2 border-bal-danger/20 rounded-xl hover:bg-bal-danger/10 transition-all"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-bal-border h-20 px-2 flex items-center justify-around z-50">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 transition-all ${
                isActive ? "text-bal-accent" : "text-bal-text-muted opacity-50"
              }`}
            >
              <item.icon size={22} />
              <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
