"use client";

import { useState } from "react";
import { 
  Search, 
  Send, 
  Bot, 
  Sparkles, 
  Database,
  ArrowLeft,
  MessageSquare
} from "lucide-react";
import { CHATS, MESSAGES } from "@/constants/mockData";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(1);
  const [autopilot, setAutopilot] = useState(true);

  const activeChatData = CHATS.find(c => c.id === selectedChat);

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-112px)] flex bg-white rounded-2xl shadow-md border border-bal-border overflow-hidden animate-in fade-in duration-500">
      
      {/* LEFT: Conversation List */}
      <div className={`w-full md:w-[350px] border-r border-bal-border flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-6 border-b border-bal-border">
          <h2 className="text-xl font-black text-bal-primary mb-4">Mesajlar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-bal-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="Müşteri ara..." 
              className="input-field pl-10 py-2.5 text-xs bg-bal-surface/50"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {CHATS.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-5 flex items-center gap-4 cursor-pointer transition-all border-b border-bal-surface/30 ${
                selectedChat === chat.id ? "bg-bal-surface border-l-4 border-l-bal-accent" : "hover:bg-bal-surface/20"
              }`}
            >
              <div className="w-12 h-12 bg-bal-border/30 rounded-xl flex items-center justify-center text-bal-primary font-black shrink-0">
                {chat.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-black text-sm text-bal-text-main truncate">{chat.name}</span>
                  <span className="text-[9px] text-bal-text-muted font-bold uppercase">{chat.time}</span>
                </div>
                <p className="text-xs text-bal-text-muted font-bold truncate opacity-60">{chat.lastMsg}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Active Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <header className="h-16 px-6 border-b border-bal-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-bal-surface rounded-full text-bal-text-muted"
                >
                  <ArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="font-black text-sm text-bal-text-main">{activeChatData?.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-bal-success rounded-full" />
                    <span className="text-[9px] font-black text-bal-text-muted uppercase tracking-widest">Çevrimiçi</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[9px] font-black text-bal-text-muted uppercase tracking-widest">AI Otopilot</span>
                  <span className={`text-[9px] font-black uppercase ${autopilot ? "text-bal-success" : "text-gray-300"}`}>
                    {autopilot ? "Açık" : "Kapalı"}
                  </span>
                </div>
                <button 
                  onClick={() => setAutopilot(!autopilot)}
                  className={`w-11 h-6 rounded-full p-1 transition-all relative ${autopilot ? "bg-bal-accent" : "bg-bal-border/50"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-sm ${autopilot ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </header>

            {/* AI Autopilot Banner */}
            {autopilot && (
              <div className="autopilot-banner">
                AI tüm mesajları otomatik yanıtlıyor
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-bal-surface/10">
              {MESSAGES.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "ai" ? "items-end" : "items-start"}`}
                >
                  <div className={msg.sender === "ai" ? "bubble-ai max-w-[85%] md:max-w-[70%]" : "bubble-customer max-w-[85%] md:max-w-[70%]"}>
                    <p className="text-sm font-bold leading-relaxed">{msg.text}</p>
                  </div>
                  
                  {msg.sender === "ai" && (
                    <div className="mt-2 flex items-center gap-2">
                      {msg.tool && (
                        <span className="flex items-center gap-1 text-[8px] font-black text-bal-accent/40 uppercase bg-bal-accent/5 px-1.5 py-0.5 rounded">
                          <Database size={8} />
                          {msg.tool}
                        </span>
                      )}
                      <span className="text-[8px] font-black text-bal-text-muted uppercase flex items-center gap-1">
                        <Bot size={10} />
                        AI Tarafından Yanıtlandı
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-6 bg-white border-t border-bal-border shrink-0">
              <div className="flex items-center gap-3 bg-bal-surface/50 rounded-xl px-4 py-1.5 border border-bal-border/30">
                <input 
                  type="text" 
                  placeholder={autopilot ? "AI devrede, mesaj yazılamaz..." : "Mesajınızı yazın..."}
                  disabled={autopilot}
                  className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 disabled:opacity-50 text-bal-text-main font-bold"
                />
                <button className="text-bal-primary p-2 hover:bg-white rounded-lg transition-all disabled:opacity-30" disabled={autopilot}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10 space-y-4">
            <div className="bg-bal-surface p-6 rounded-2xl border border-bal-border text-bal-border">
              <MessageSquare size={48} />
            </div>
            <div>
              <h3 className="font-black text-bal-text-main">Sohbet Seçin</h3>
              <p className="text-xs font-bold text-bal-text-muted max-w-[200px] mx-auto opacity-60">Konuşmaya başlamak için soldan bir müşteri seçin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
