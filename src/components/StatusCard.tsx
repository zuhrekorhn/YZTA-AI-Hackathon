"use client";

import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface StatusCardProps {
  status: "success" | "error" | "confirm";
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function StatusCard({ status, title, message, onConfirm, onCancel }: StatusCardProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-bal-border animate-in zoom-in-95 duration-300">
        <div className="flex flex-col items-center text-center space-y-4">
          {status === "success" && (
            <div className="bg-bal-success/10 p-4 rounded-2xl text-bal-success">
              <CheckCircle2 size={48} />
            </div>
          )}
          {status === "error" && (
            <div className="bg-bal-danger/10 p-4 rounded-2xl text-bal-danger">
              <XCircle size={48} />
            </div>
          )}
          {status === "confirm" && (
            <div className="bg-bal-accent/10 p-4 rounded-2xl text-bal-accent">
              <AlertCircle size={48} />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-xl font-black text-bal-primary">{title}</h3>
            <p className="text-sm font-bold text-bal-text-muted leading-relaxed">
              {message}
            </p>
          </div>

          <div className="flex w-full gap-3 pt-4">
            {status === "confirm" && onCancel && (
              <button
                onClick={onCancel}
                className="flex-1 py-3 px-6 rounded-xl border border-bal-border font-black text-bal-text-muted hover:bg-bal-surface transition-all"
              >
                İptal
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-6 rounded-xl font-black text-white transition-all active:scale-95 ${
                status === "error" ? "bg-bal-danger" : "bg-bal-primary"
              }`}
            >
              {status === "confirm" ? "Evet, Sil" : "Tamam"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
