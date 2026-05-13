"use client";

import React, { useEffect, useState } from "react";
import { Send, User, Bot, RefreshCw } from "lucide-react";
import { customerChat } from "@/lib/api";

interface Props {
  params: Promise<{ slug: string }>;
}

function makeSessionId() {
  return `cust_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function Page({ params }: Props) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug;
  const storageKey = `customer_chat_session_${slug}`;
  const nameKey = `customer_chat_name_${slug}`;

  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === "undefined") return makeSessionId();
    return window.localStorage.getItem(storageKey) ?? makeSessionId();
  });

  const [name, setName] = useState<string>(() => {
    if (typeof window === "undefined") return "Müşteri";
    return window.localStorage.getItem(nameKey) ?? "Müşteri";
  });

  const [messages, setMessages] = useState<{ id: number; sender: "customer" | "manager" | "ai"; text: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // persist session id + name
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, sessionId);
    window.localStorage.setItem(nameKey, name);
  }, [sessionId, name, storageKey, nameKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const startNewChat = () => {
    const nextSessionId = makeSessionId();
    setSessionId(nextSessionId);
    setMessages([]);
    setDraft("");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, nextSessionId);
      window.localStorage.removeItem(nameKey);
    }
    setName("Müşteri");
  };

  useEffect(() => {
    async function loadHistory() {
      if (typeof window === "undefined" || !sessionId) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"}/chat/customer/${encodeURIComponent(slug)}/sessions/${encodeURIComponent(sessionId)}/messages`);
        if (!response.ok) return;
        const history: Array<{ sender_type: "customer" | "manager" | "ai"; content: string }> = await response.json();
        type HistoryItem = { sender_type: "customer" | "manager" | "ai"; content: string };
        setMessages(
          (history as HistoryItem[]).map((item: HistoryItem, index: number) => ({
            id: Date.now() + index,
            sender: item.sender_type === "manager" ? "manager" : item.sender_type === "ai" ? "ai" : "customer",
            text: item.content,
          }))
        );
      } catch {
        // Ignore history loading errors; chat can still continue locally.
      }
    }

    loadHistory();
  }, [slug, sessionId]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || isSending) return;

    const outbound = { id: Date.now(), sender: "customer" as const, text };
    setMessages((p) => [...p, outbound]);
    setDraft("");
    setIsSending(true);

    try {
      const res = await customerChat(slug, sessionId, text, name || "Müşteri");
      setMessages((p) => [...p, { id: Date.now() + 1, sender: "ai", text: res.reply }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sunucu hatası";
      setMessages((p) => [...p, { id: Date.now() + 1, sender: "ai", text: msg }]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full max-w-4xl h-[calc(100vh-24px)] md:h-[calc(100vh-64px)] bg-white rounded-3xl shadow-lg border border-bal-border overflow-hidden mx-auto flex flex-col">
      <header className="px-4 md:px-6 py-4 border-b border-bal-border bg-gradient-to-r from-[#5A3010] to-[#7A4A1A] text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-black">{slug} destek hattı</h2>
            <p className="text-xs md:text-sm text-white/80">Canlı müşteri sohbeti</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startNewChat}
              className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-2 text-[11px] font-black uppercase tracking-wide hover:bg-white/18 transition-all"
            >
              <RefreshCw size={12} />
              Yeni Sohbet
            </button>
            <div className="hidden md:flex items-center gap-2 text-[11px] font-black uppercase tracking-wide bg-white/15 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-green-300" />
              Çevrimiçi
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 md:px-6 py-3 border-b border-bal-border bg-[#FCF8EF]">
        <label className="text-xs font-black text-bal-text-muted uppercase tracking-wide">Görünen adınız</label>
        <div className="mt-2 flex items-center gap-2 bg-white border border-bal-border rounded-xl px-3">
          <User size={16} className="text-bal-text-muted" />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adınız"
            className="w-full bg-transparent py-2.5 outline-none text-sm font-semibold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-6 bg-[linear-gradient(180deg,#f8f3e8_0%,#fdfbf6_100%)] space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-bal-text-muted text-sm font-semibold py-12">
            Mesaj göndererek sohbete başlayın.
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[88%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                m.sender === "customer"
                  ? "bg-[#5A3010] text-white rounded-br-md"
                  : m.sender === "manager"
                    ? "bg-[#FFF6E8] border border-bal-border text-bal-text-main rounded-bl-md"
                    : "bg-white border border-bal-border text-bal-text-main rounded-bl-md"
              }`}
            >
              <div className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{m.text}</div>
              <div className="mt-1.5 text-[10px] font-black opacity-70 flex items-center gap-1">
                {m.sender === "customer" ? <User size={10} /> : <Bot size={10} />}
                {m.sender === "customer" ? "Siz" : m.sender === "manager" ? "Yönetici" : "KoopAI"}
              </div>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border border-bal-border text-bal-text-muted rounded-2xl rounded-bl-md px-4 py-3 text-sm font-semibold animate-pulse">
              KoopAI yazıyor...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 md:p-4 border-t border-bal-border bg-white">
        <div className="flex items-center gap-2 md:gap-3 bg-[#F6EFE1] border border-bal-border rounded-2xl px-3 md:px-4 py-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-1 bg-transparent outline-none text-sm md:text-base font-semibold text-bal-text-main placeholder:text-bal-text-muted"
          />
          <button
            type="submit"
            disabled={isSending || !draft.trim()}
            className="w-10 h-10 rounded-xl bg-[#5A3010] text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
