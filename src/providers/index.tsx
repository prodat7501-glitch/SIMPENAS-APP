"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { QueryProvider } from "./QueryProvider";
import { ToastContainer } from "@/components/ui/toast";
import { TemplateProvider } from "./TemplateProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <QueryProvider>
        <TemplateProvider>
          {children}
          <ToastContainer />
        </TemplateProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
