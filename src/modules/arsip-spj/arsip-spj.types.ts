import type { ArsipSpj } from "./arsip-spj.schema";

export interface ArsipSpjRow {
  notaDinasId: string;
  nomorNotaDinas: string;
  nomorSpt: string[];
  nomorSppd: string[];
  personil: string[];
  arsip?: ArsipSpj;
}

export interface UploadArsipSpjInput {
  notaDinasId: string;
  file: File;
  diunggahOleh: string;
}
