"use client";

import { useState, useEffect } from "react";
import { 
  Send, 
  Bot, 
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { getCustomerSessions, getSessionMessages, managerToCustomer, managerAskAI } from "@/lib/api";
import type { CustomerSessionSummary, ChatMessageItem } from "@/lib/types";

interface ChatMessage {
  id: number;
  sender: "customer" | "manager" | "ai";
  text: string;
  messageType?: "customer_to_ai" | "manager_to_customer" | "manager_to_ai";
}

type TabType = "customer-chat" | "ai-assistant";

export default function ChatPage() {
  // Customer sessions & chat
  const [sessions, setSessions] = useState<CustomerSessionSummary[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Manager interaction
  const [activeTab, setActiveTab] = useState<TabType>("ai-assistant");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [customerDraft, setCustomerDraft] = useState("");
  const [isCustomerSending, setIsCustomerSending] = useState(false);

  // Load customer sessions on mount + polling
  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 8000);
    return () => clearInterval(interval);
  }, []);

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const res = await getCustomerSessions();
      setSessions(res);
    } catch (e) {
      console.error("Failed to load sessions:", e);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function openSession(sessionId: string | null) {
    setSelectedSession(sessionId);
    setMessages([]);
    if (!sessionId) return;

    try {
      const items = await getSessionMessages(sessionId);
      const mapped = items
        .map((m) => ({
          id: Date.now() + Math.random() * 1000,
          sender: m.sender_type as "customer" | "manager" | "ai",
          text: m.content,
          messageType: m.message_type as "customer_to_ai" | "manager_to_customer" | "manager_to_ai",
        }))
        .filter((m) => m.messageType === "customer_to_ai" || m.messageType === "manager_to_customer") as ChatMessage[];
      setMessages(mapped);
    } catch (e) {
      console.error("Failed to load messages:", e);
    }
  }

  // Manager sends to customer directly
  async function handleSendToCustomer(e: React.FormEvent) {
    e.preventDefault();
    const message = customerDraft.trim();
    if (!message || isCustomerSending || !selectedSession) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "manager",
        text: message,
        messageType: "manager_to_customer",
      },
    ]);
    setCustomerDraft("");
    setIsCustomerSending(true);

    try {
      await managerToCustomer(selectedSession, message);
      await loadSessions();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          sender: "ai",
          text: err instanceof Error ? err.message : "Mesaj gönderilemedi.",
          messageType: "manager_to_ai",
        },
      ]);
    } finally {
      setIsCustomerSending(false);
    }
  }

  // Manager asks AI in separate session
  async function handleAskAI(e: React.FormEvent) {
    e.preventDefault();
    const message = draft.trim();
    if (!message || isSending) return;

    setAiMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "manager",
        text: message,
        messageType: "manager_to_ai",
      },
    ]);
    setDraft("");
    setIsSending(true);

    try {
      const aiSessionId = "manager-ai-assistant";
      const response = await managerAskAI(aiSessionId, message);
      setAiMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: response.reply,
          messageType: "manager_to_ai",
        },
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "ai",
          text: err instanceof Error ? err.message : "Yanıt alınamadı.",
          messageType: "manager_to_ai",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-112px)] flex bg-white rounded-2xl shadow-md border border-bal-border overflow-hidden animate-in fade-in duration-500">
      {/* Left Panel: Customer Sessions */}
      <div className="w-full md:w-[350px] border-r border-bal-border flex flex-col">
        <div className="p-6 border-b border-bal-border">
          <h2 className="text-xl font-black text-bal-primary mb-1">Müşteri Sohbetleri</h2>
          <p className="text-xs font-bold text-bal-text-muted">Bekleyen müşteri soruları</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-black">Gelen Sohbetler</div>
            <button
              onClick={() => loadSessions()}
              className="p-2 rounded hover:bg-bal-surface/20 transition-all"
              disabled={loadingSessions}
            >
              <RefreshCw size={16} className={loadingSessions ? "animate-spin" : ""} />
            </button>
          </div>

          {loadingSessions && <div className="text-xs text-bal-text-muted">Yükleniyor...</div>}

          {sessions.length === 0 && !loadingSessions && (
            <div className="text-xs text-bal-text-muted">Bekleyen sohbet yok.</div>
          )}

          <ul className="space-y-2">
            {sessions.map((s) => (
              <li
                key={s.session_id}
                onClick={() => {
                  openSession(s.session_id);
                  setActiveTab("customer-chat");
                }}
                className={`p-3 rounded cursor-pointer border transition-all ${
                  selectedSession === s.session_id
                    ? "border-bal-primary bg-bal-primary/5"
                    : "border-transparent hover:bg-bal-surface/5"
                }`}
              >
                <div className="text-sm font-black">{s.title ?? s.session_id}</div>
                <div className="text-xs text-bal-text-muted truncate">{s.last_message}</div>
                <div className="text-[10px] text-bal-text-muted mt-1">
                  {new Date(s.created_at).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Panel: Chat Interface with Tabs */}
      <div className="flex-1 flex flex-col">
        {/* Tab Selector */}
        <div className="flex border-b border-bal-border bg-bal-surface/5 shrink-0">
          <button
            onClick={() => setActiveTab("customer-chat")}
            className={`flex-1 px-4 py-3 text-sm font-black transition-all border-b-2 ${
              activeTab === "customer-chat"
                ? "border-bal-primary text-bal-primary"
                : "border-transparent text-bal-text-muted hover:text-bal-text-main"
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <MessageSquare size={16} />
              <span>Müşteri Sohbeti</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("ai-assistant")}
            className={`flex-1 px-4 py-3 text-sm font-black transition-all border-b-2 ${
              activeTab === "ai-assistant"
                ? "border-bal-primary text-bal-primary"
                : "border-transparent text-bal-text-muted hover:text-bal-text-main"
            }`}
          >
            <div className="flex items-center gap-2 justify-center">
              <Bot size={16} />
              <span>AI Asistanı</span>
            </div>
          </button>
        </div>

        {/* Customer Chat Tab */}
        {activeTab === "customer-chat" && (
          <>
            <div className="h-16 px-6 border-b border-bal-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-sm text-bal-text-main">
                  {selectedSession ? "Müşteri ile Konuşma" : "Müşteri Seçin"}
                </h3>
                {selectedSession && (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-bal-success rounded-full" />
                    <span className="text-[9px] font-black text-bal-text-muted uppercase tracking-widest">
                      Aktif
                    </span>
                  </div>
                )}
              </div>
            </div>

            {!selectedSession ? (
              <div className="flex-1 flex items-center justify-center text-center">
                <div>
                  <MessageSquare size={48} className="mx-auto text-bal-text-muted/30 mb-3" />
                  <p className="text-bal-text-muted font-bold">Müşteri sohbeti seçin</p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-bal-surface/10">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === "customer" ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={
                          msg.sender === "customer"
                            ? "bubble-customer max-w-[85%] md:max-w-[70%]"
                            : "bubble-manager max-w-[85%] md:max-w-[70%]"
                        }
                      >
                        <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                      </div>
                      {msg.sender === "manager" && (
                        <div className="mt-2 text-[8px] font-black text-bal-text-muted uppercase flex items-center gap-1">
                          <MessageSquare size={10} />
                          Yönetici Tarafından
                        </div>
                      )}
                    </div>
                  ))}
                  {isCustomerSending && (
                    <div className="flex items-center gap-2 text-xs font-bold text-bal-text-muted">
                      <MessageSquare size={14} />
                      Mesaj gönderiyor...
                    </div>
                  )}
                </div>

                <form
                  onSubmit={handleSendToCustomer}
                  className="p-6 bg-white border-t border-bal-border shrink-0"
                >
                  <div className="flex items-center gap-3 bg-bal-surface/50 rounded-xl px-4 py-1.5 border border-bal-border/30">
                    <input
                      type="text"
                      value={customerDraft}
                      onChange={(e) => setCustomerDraft(e.target.value)}
                      placeholder="Müşteriye mesaj gönderin..."
                      className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 text-bal-text-main font-bold"
                      disabled={!selectedSession}
                    />
                    <button
                      type="submit"
                      className="text-bal-primary p-2 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                      disabled={isCustomerSending || !customerDraft.trim() || !selectedSession}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}

        {/* AI Assistant Tab */}
        {activeTab === "ai-assistant" && (
          <>
            <div className="h-16 px-6 border-b border-bal-border flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-black text-sm text-bal-text-main">KoopAI Asistanı</h3>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-bal-success rounded-full" />
                  <span className="text-[9px] font-black text-bal-text-muted uppercase tracking-widest">
                    Çevrimiçi
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-bal-surface/10">
              {aiMessages.length === 0 && (
                <div className="text-center text-bal-text-muted mt-8">
                  <Bot size={48} className="mx-auto opacity-20 mb-3" />
                  <p className="font-bold">AI asistanınız hazır</p>
                  <p className="text-xs mt-1">Operasyon soruları sorun</p>
                </div>
              )}
              {aiMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "manager" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={
                      msg.sender === "manager"
                        ? "bubble-manager max-w-[85%] md:max-w-[70%]"
                        : "bubble-ai max-w-[85%] md:max-w-[70%]"
                    }
                  >
                    <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                  </div>
                  {msg.sender === "ai" && (
                    <div className="mt-2 text-[8px] font-black text-bal-text-muted uppercase flex items-center gap-1">
                      <Bot size={10} />
                      AI Tarafından Yanıtlandı
                    </div>
                  )}
                  {msg.sender === "manager" && (
                    <div className="mt-2 text-[8px] font-black text-bal-text-muted uppercase flex items-center gap-1">
                      <MessageSquare size={10} />
                      Siz
                    </div>
                  )}
                </div>
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-xs font-bold text-bal-text-muted">
                  <Bot size={14} />
                  AI yanıtlanıyor...
                </div>
              )}
            </div>

            <form onSubmit={handleAskAI} className="p-6 bg-white border-t border-bal-border shrink-0">
              <div className="flex items-center gap-3 bg-bal-surface/50 rounded-xl px-4 py-1.5 border border-bal-border/30">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="AI'ya soru sorun..."
                  className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 text-bal-text-main font-bold"
                />
                <button
                  type="submit"
                  className="text-bal-primary p-2 hover:bg-white rounded-lg transition-all disabled:opacity-30"
                  disabled={isSending || !draft.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
