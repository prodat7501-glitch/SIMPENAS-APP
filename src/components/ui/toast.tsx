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

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
    warning: AlertTriangle,
  };

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 inset-x-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2 sm:w-full sm:max-w-sm pointer-events-none"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: -20,
                transition: { duration: 0.15 },
              }}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl shadow-lg border text-xs font-semibold pointer-events-auto bg-card text-foreground border-border",
                t.type === "success" && "border-success/30",
                t.type === "error" && "border-danger/30",
                t.type === "warning" && "border-warning/30",
                t.type === "info" && "border-accent/30",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0",
                  t.type === "success" && "text-success",
                  t.type === "error" && "text-danger",
                  t.type === "warning" && "text-warning",
                  t.type === "info" && "text-accent",
                )}
              />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="p-0.5 rounded text-muted-foreground hover:bg-muted cursor-pointer"
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
