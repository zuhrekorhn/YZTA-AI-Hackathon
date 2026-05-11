import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KoopPilot | Karabük Organik Kooperatifi",
  description: "Yapay Zeka Destekli Operasyon Asistanı",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.className} bg-warm-bg text-primary-plum`}>
        <Navbar />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-4 pb-24 md:pb-4 md:p-8 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
