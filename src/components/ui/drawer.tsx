"use client";

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: "left" | "right";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className,
  side = "right",
}: DrawerProps) {
  const isRight = side === "right";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex overflow-hidden">
          {/* Overlay background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer content panel */}
          <motion.div
            initial={{ x: isRight ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRight ? "100%" : "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className={cn(
              "fixed top-0 bottom-0 z-10 w-full max-w-md bg-card shadow-xl p-6 text-foreground flex flex-col justify-between",
              isRight
                ? "right-0 border-l border-border"
                : "left-0 border-r border-border",
              className,
            )}
          >
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-sm font-bold leading-none text-foreground">
                  {title || "Drawer"}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content body */}
              <div className="text-xs text-muted-foreground flex-1">
                {children}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
