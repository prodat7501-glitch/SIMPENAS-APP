"use client";

import React from "react";
import { create } from "zustand";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "./button";

export type ConfirmVariant = "danger" | "warning" | "info" | "success";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
}

export interface AlertOptions {
  title: string;
  message: string;
  confirmText?: string;
  variant?: ConfirmVariant;
}

interface ConfirmState {
  isOpen: boolean;
  isAlertOnly: boolean;
  options: ConfirmOptions;
  resolver: ((value: boolean) => void) | null;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
  close: (result: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  isAlertOnly: false,
  options: {
    title: "",
    message: "",
    confirmText: "Lanjutkan",
    cancelText: "Batal",
    variant: "info",
  },
  resolver: null,
  confirm: (options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        isAlertOnly: false,
        options: {
          confirmText: options.variant === "danger" ? "Ya, Hapus" : "Lanjutkan",
          cancelText: "Batal",
          variant: "info",
          ...options,
        },
        resolver: resolve,
      });
    });
  },
  alert: (options: AlertOptions) => {
    return new Promise<void>((resolve) => {
      set({
        isOpen: true,
        isAlertOnly: true,
        options: {
          confirmText: "Mengerti",
          variant: "info",
          ...options,
        },
        resolver: () => resolve(),
      });
    });
  },
  close: (result: boolean) => {
    const resolver = get().resolver;
    if (resolver) {
      resolver(result);
    }
    set({
      isOpen: false,
      resolver: null,
    });
  },
}));

export const useConfirm = () => {
  const confirm = useConfirmStore((state) => state.confirm);
  const alert = useConfirmStore((state) => state.alert);
  return { confirm, alert };
};

export function ConfirmDialogContainer() {
  const { isOpen, isAlertOnly, options, close } = useConfirmStore();

  const variantIcons = {
    danger: options.confirmText?.toLowerCase().includes("hapus")
      ? Trash2
      : AlertTriangle,
    warning: AlertCircle,
    info: Info,
    success: CheckCircle2,
  };

  const variantStyles = {
    danger: {
      badge: "bg-red-500/10 text-red-500 border-red-500/20",
      button: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm",
    },
    warning: {
      badge: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      button: "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-sm",
    },
    info: {
      badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      button: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm",
    },
    success: {
      badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      button: "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm",
    },
  };

  const currentVariant = options.variant || "info";
  const IconComponent = variantIcons[currentVariant];
  const styling = variantStyles[currentVariant];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => close(false)}
            className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === "Escape") close(false);
              if (e.key === "Enter" && isAlertOnly) close(true);
            }}
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ type: "spring", duration: 0.25 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 sm:p-7 z-10 text-foreground overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              type="button"
              onClick={() => close(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Content with Icon */}
            <div className="flex items-start gap-4">
              <div
                className={`p-3 rounded-2xl border flex items-center justify-center shrink-0 ${styling.badge}`}
              >
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="flex-1 pr-4">
                <h3
                  id="confirm-dialog-title"
                  className="text-base font-bold text-foreground leading-snug"
                >
                  {options.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  {options.message}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-border/60">
              {!isAlertOnly && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => close(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer hover:bg-muted"
                >
                  {options.cancelText || "Batal"}
                </Button>
              )}
              <button
                type="button"
                onClick={() => close(true)}
                autoFocus
                className={`px-4 py-2 text-xs font-semibold rounded-xl cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${styling.button}`}
              >
                {options.confirmText || "Lanjutkan"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
