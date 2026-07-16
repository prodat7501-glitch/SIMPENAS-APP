"use client";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useDocumentTemplate } from "@/providers/TemplateProvider";
export function TemplateHeader() {
  const template = useDocumentTemplate();
  return <header className="grid grid-cols-[64px_1fr_64px] items-center border-b-[3px] border-double border-black pb-3" style={{ textAlign: template.alignment }}><Image src={template.logo} alt="Logo instansi" width={56} height={56} className="h-14 w-14 object-contain" /><div><h1 className="text-base font-black tracking-wide uppercase">{template.kopSurat}</h1><p className="mt-1 text-[10px] italic text-gray-500">{template.alamat}</p></div><span aria-hidden /></header>;
}
export function TemplateFooter() {
  const template = useDocumentTemplate();
  return <footer className="mt-auto border-t border-black pt-2 text-[10px] text-gray-500" style={{ textAlign: template.alignment }}>{template.footer}</footer>;
}
export function DocumentTemplate({ children, includeHeader = true }: { children: ReactNode; includeHeader?: boolean }) {
  const template = useDocumentTemplate();
  const style: CSSProperties = { padding: `${template.margin}mm`, fontFamily: template.font, textAlign: "left" };
  return <div className="flex min-h-full flex-1 flex-col gap-6 -m-[20mm] print:m-0" style={style}>{includeHeader && <TemplateHeader />}<div className="flex-1">{children}</div><TemplateFooter /></div>;
}
export function useTemplateDocumentStyle(): CSSProperties {
  const template = useDocumentTemplate();
  return { padding: `${template.margin}mm`, fontFamily: template.font };
}
