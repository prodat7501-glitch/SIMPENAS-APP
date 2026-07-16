"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingOverlay({
  isOpen,
  message,
}: {
  isOpen: boolean;
  message?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-busy="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xs text-white pointer-events-auto"
        >
          <div className="flex flex-col items-center gap-3">
            <Loader2
              aria-hidden="true"
              className="w-10 h-10 text-primary animate-spin"
            />
            {message && (
              <p className="text-xs font-bold text-slate-200 tracking-wide">
                {message}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
