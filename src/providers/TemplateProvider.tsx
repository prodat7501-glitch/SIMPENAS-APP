"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTemplateStore, type TemplateConfig } from "@/stores/template.store";

const TemplateContext = createContext<TemplateConfig | null>(null);

export function TemplateProvider({ children }: { children: ReactNode }) {
  const config = useTemplateStore((state) => state.config);
  return <TemplateContext.Provider value={config}>{children}</TemplateContext.Provider>;
}

export function useDocumentTemplate() {
  const value = useContext(TemplateContext);
  if (!value) throw new Error("useDocumentTemplate harus digunakan di dalam TemplateProvider.");
  return value;
}
