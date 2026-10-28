"use client";

import React from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

// Zustand Store for Toast Notifications
export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (
    message: string,
    type?: ToastMessage["type"],
    duration?: number,
  ) => void;
  removeToast: (id: string) => void;
}

let toastSequence = 0;

const createToastId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `toast-${crypto.randomUUID()}`;
  }

  toastSequence += 1;
  return `toast-${Date.now()}-${toastSequence}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
};

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = "info", duration = 3000) => {
    const id = createToastId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

// Toast Container Component
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const config = {
    success: {
      icon: CheckCircle,
      badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      border: "border-emerald-500/30 dark:border-emerald-500/20",
      accent: "bg-emerald-500",
      title: "Berhasil",
    },
    error: {
      icon: AlertCircle,
      badge: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
      border: "border-red-500/30 dark:border-red-500/20",
      accent: "bg-red-500",
      title: "Perhatian / Gagal",
    },
    warning: {
      icon: AlertTriangle,
      badge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
      border: "border-amber-500/30 dark:border-amber-500/20",
      accent: "bg-amber-500",
      title: "Peringatan",
    },
    info: {
      icon: Info,
      badge: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
      border: "border-blue-500/30 dark:border-blue-500/20",
      accent: "bg-blue-500",
      title: "Informasi",
    },
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-4 inset-x-4 sm:left-auto sm:right-4 z-[9999] flex flex-col gap-2.5 sm:w-full sm:max-w-md pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const itemConfig = config[t.type] || config.info;
          const Icon = itemConfig.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -15,
                transition: { duration: 0.15 },
              }}
              className={cn(
                "relative flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border text-xs pointer-events-auto bg-card/95 backdrop-blur-md text-foreground transition-all overflow-hidden",
                itemConfig.border,
              )}
            >
              {/* Left Accent Bar */}
              <div
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-1",
                  itemConfig.accent,
                )}
              />

              <div
                className={cn(
                  "p-2 rounded-xl border shrink-0 flex items-center justify-center mt-0.5",
                  itemConfig.badge,
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0 pr-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-0.5">
                  {itemConfig.title}
                </p>
                <p className="font-semibold text-foreground text-xs leading-relaxed break-words">
                  {t.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer transition shrink-0"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
