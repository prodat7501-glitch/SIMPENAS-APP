import type { UserSession } from "@/stores/auth.store";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import type { Pegawai } from "@/modules/pegawai/pegawai.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import type { Spj } from "@/modules/keuangan/keuangan.schema";
import type { UnitKerja } from "@/modules/unit-kerja/unit-kerja.schema";

const FINANCE_UNIT_KEYWORDS = ["keuangan"];

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

export const resolveCurrentPegawai = (
  user: UserSession | null,
  pegawais: Pegawai[],
) => {
  if (!user) return null;

  if (user.pegawaiId) {
    const byId = pegawais.find((item) => item.id === user.pegawaiId);
    if (byId) return byId;
  }

  const name = normalize(user.name);
  const byName = pegawais.find((item) => normalize(item.nama) === name);
  if (byName) return byName;

  const candidates = pegawais.filter(
    (item) => item.status === "Aktif" && item.roleAplikasi === user.role,
  );
  return candidates.length === 1 ? candidates[0] : null;
};

export const isFinanceUnit = (unit?: Pick<UnitKerja, "nama"> | null) => {
  if (!unit) return false;
  const name = normalize(unit.nama);
  return FINANCE_UNIT_KEYWORDS.some((keyword) => name.includes(keyword));
};

export const isFinanceUnitUser = (
  user: UserSession | null,
  currentPegawai: Pegawai | null,
  units: UnitKerja[],
) => {
  if (!user) return false;
  if (user.role === "Administrator") {
    return true;
  }
  if (user.role !== "Sub Bagian Keuangan") return false;

  const unit = units.find((item) => item.id === currentPegawai?.unitKerjaId);
  return currentPegawai ? isFinanceUnit(unit) : true;
};

export const isPegawaiInNotaDinas = (
  pegawaiId: string | undefined,
  nota?: NotaDinas | null,
) => {
  if (!pegawaiId || !nota) return false;
  return nota.lampiran.some((item) => item.pegawaiId === pegawaiId);
};

export const canAccessSptByNotaDinas = (
  pegawaiId: string | undefined,
  spt: Spt,
  notas: NotaDinas[],
) => {
  const nota = notas.find((item) => item.id === spt.notaDinasId);
  return (
    isPegawaiInNotaDinas(pegawaiId, nota) ||
    spt.personil.some((item) => item.pegawaiId === pegawaiId)
  );
};

export const canAccessSppdByNotaDinas = (
  pegawaiId: string | undefined,
  sppd: Sppd,
  spts: Spt[],
  notas: NotaDinas[],
) => {
  const spt = spts.find((item) => item.id === sppd.sptId);
  if (!spt) {
    return sppd.personil.some((item) => item.pegawaiId === pegawaiId);
  }
  return canAccessSptByNotaDinas(pegawaiId, spt, notas);
};

export const canAccessLaporanByNotaDinas = (
  pegawaiId: string | undefined,
  laporan: Laporan,
  sppds: Sppd[],
  spts: Spt[],
  notas: NotaDinas[],
) => {
  const spt =
    spts.find((item) => item.id === laporan.sptId) ||
    spts.find(
      (item) =>
        item.id === sppds.find((sppd) => sppd.id === laporan.sppdId)?.sptId,
    );
  if (spt) return canAccessSptByNotaDinas(pegawaiId, spt, notas);
  return laporan.pelaksanaId === pegawaiId;
};

export const canAccessSpjByNotaDinas = (
  pegawaiId: string | undefined,
  spj: Spj,
  reports: Laporan[],
  sppds: Sppd[],
  spts: Spt[],
  notas: NotaDinas[],
) => {
  const laporan = reports.find((item) => item.id === spj.laporanId);
  if (laporan) {
    return canAccessLaporanByNotaDinas(pegawaiId, laporan, sppds, spts, notas);
  }

  const sppd = sppds.find((item) => item.id === spj.sppdId);
  if (sppd) return canAccessSppdByNotaDinas(pegawaiId, sppd, spts, notas);

  return false;
};
