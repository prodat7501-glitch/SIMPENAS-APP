import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import { jabatanService } from "@/modules/jabatan/jabatan.service";
import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import type { PenandatanganSnapshot } from "@/modules/penandatangan/penandatangan.schema";
import { penandatanganService } from "@/modules/penandatangan/penandatangan.service";
import type { Spt } from "@/modules/spt/spt.schema";
import type { UserSession } from "@/stores/auth.store";
import { userAccountService } from "@/modules/user-account/user-account.service";

type OfficialIdentity = Pick<
  PenandatanganSnapshot,
  "nama" | "nip" | "jabatanPenandatangan" | "peran"
>;

const normalizeText = (value: string) =>
  value
    .toLocaleLowerCase("id-ID")
    .replace(/[^a-z0-9]/g, "")
    .trim();

const resolveActorPegawai = (user: UserSession) => {
  const pegawais = pegawaiService.getAll();
  return (
    pegawais.find((pegawai) => pegawai.id === user.pegawaiId) ??
    pegawais.find(
      (pegawai) => normalizeText(pegawai.nama) === normalizeText(user.name),
    ) ??
    null
  );
};

const getDocumentSigner = (
  penandatanganId: string,
  snapshot?: PenandatanganSnapshot | null,
): OfficialIdentity | null => {
  if (snapshot?.penandatanganId === penandatanganId) return snapshot;
  return (
    penandatanganService.getAll().find((item) => item.id === penandatanganId) ??
    null
  );
};

const getOfficialText = (official?: OfficialIdentity | null) =>
  `${official?.jabatanPenandatangan ?? ""} ${official?.peran ?? ""}`.toLocaleLowerCase(
    "id-ID",
  );

const actorMatchesOfficial = (
  user: UserSession,
  official?: OfficialIdentity | null,
) => {
  if (!official) return false;
  const pegawai = resolveActorPegawai(user);
  const actorNames = [user.name, pegawai?.nama ?? ""]
    .map(normalizeText)
    .filter(Boolean);
  const actorNips = [pegawai?.nip ?? ""].map(normalizeText).filter(Boolean);
  const officialName = normalizeText(official.nama);
  const officialNip = normalizeText(official.nip);

  return (
    actorNames.includes(officialName) ||
    (Boolean(officialNip) && actorNips.includes(officialNip))
  );
};

const getSecretaryPriority = (official: OfficialIdentity) => {
  const text = getOfficialText(official);
  if (!text.includes("sekretaris")) return 0;
  if (text.includes("plt") || text.includes("pelaksana tugas")) return 3;
  if (text.includes("plh") || text.includes("pelaksana harian")) return 2;
  return 1;
};

const getActorSecretaryPriority = (user: UserSession) => {
  const pegawai = resolveActorPegawai(user);
  const jabatan = jabatanService
    .getAll()
    .find((item) => item.id === pegawai?.jabatanId);
  const text = jabatan?.nama.toLocaleLowerCase("id-ID") ?? "";

  if (!text.includes("sekretaris") || text.includes("sekretaris ppk")) {
    return 0;
  }
  if (text.includes("plt") || text.includes("pelaksana tugas")) return 3;
  if (text.includes("plh") || text.includes("pelaksana harian")) return 2;
  return 1;
};

const getActorPositionText = (user: UserSession) => {
  const pegawai = resolveActorPegawai(user);
  const jabatan = jabatanService
    .getAll()
    .find((item) => item.id === pegawai?.jabatanId);

  return `${pegawai?.kategoriPegawai ?? ""} ${jabatan?.nama ?? ""}`.toLocaleLowerCase(
    "id-ID",
  );
};

const isActorKetuaKpu = (user: UserSession) =>
  getActorPositionText(user).includes("ketua kpu");

const isActorKasubbag = (user: UserSession) => {
  const positionText = getActorPositionText(user);
  return (
    positionText.includes("kasubbag") ||
    positionText.includes("kasubag") ||
    positionText.includes("kepala sub bagian") ||
    positionText.includes("kepala subbagian")
  );
};

const isOfficialActiveForNotaApproval = (
  official: ReturnType<typeof penandatanganService.getAll>[number],
  tanggalDokumen: string,
) => {
  const mappedToApproval =
    official.jenisDokumen.includes("Nota Dinas") ||
    official.jenisDokumen.includes("SPT");
  const withinPeriod =
    (!official.berlakuMulai || tanggalDokumen >= official.berlakuMulai) &&
    (!official.berlakuSampai || tanggalDokumen <= official.berlakuSampai);

  return (
    official.status === "Aktif" &&
    mappedToApproval &&
    withinPeriod &&
    getSecretaryPriority(official) > 0
  );
};

export const findPegawaiIdForOfficial = (
  official?: OfficialIdentity | null,
) => {
  if (!official) return undefined;
  const officialName = normalizeText(official.nama);
  const officialNip = normalizeText(official.nip);
  return pegawaiService.getAll().find((pegawai) => {
    const sameNip =
      Boolean(officialNip) && normalizeText(pegawai.nip) === officialNip;
    const sameName = normalizeText(pegawai.nama) === officialName;
    return sameNip || sameName;
  })?.id;
};

export const getNotaDinasCreatorPegawaiId = (nota: NotaDinas) =>
  nota.createdByPegawaiId ||
  findPegawaiIdForOfficial(
    getDocumentSigner(nota.penandatanganId, nota.penandatanganSnapshot),
  );

export const canUserApproveNotaDinas = (user: UserSession, nota: NotaDinas) => {
  if (user.role === "Administrator") return true;
  if (user.role !== "Supervisor") return false;

  const eligibleOfficials = penandatanganService
    .getAll()
    .filter((official) =>
      isOfficialActiveForNotaApproval(official, nota.tanggal),
    );
  const highestPriority = eligibleOfficials.reduce(
    (highest, official) => Math.max(highest, getSecretaryPriority(official)),
    0,
  );

  const matchesEligibleOfficial = eligibleOfficials.some(
    (official) =>
      getSecretaryPriority(official) === highestPriority &&
      actorMatchesOfficial(user, official),
  );
  const actorJobPriority = getActorSecretaryPriority(user);

  return (
    matchesEligibleOfficial ||
    (actorJobPriority > 0 && actorJobPriority === highestPriority)
  );
};

export const canUserApproveSpt = (
  user: UserSession,
  spt: Spt,
  nota?: NotaDinas | null,
) => {
  if (user.role === "Administrator") return true;
  // Approval SPT HANYA BISA dilakukan oleh Kasubbag pembuat/penandatangan Nota Dinas sumber; selain itu tidak boleh
  if (!nota) return false;

  const actorPegawai = resolveActorPegawai(user);
  const notaSigner = getDocumentSigner(
    nota.penandatanganId,
    nota.penandatanganSnapshot,
  );

  // 1. Cek apakah identitas aktor cocok dengan pejabat penandatangan Nota Dinas (Kasubbag)
  const matchesNotaSigner = actorMatchesOfficial(user, notaSigner);

  // 2. Cek apakah ID pegawai aktor cocok dengan pembuat Nota Dinas
  const notaCreatorPegawaiId =
    nota.createdByPegawaiId || getNotaDinasCreatorPegawaiId(nota);
  const isNotaCreator = Boolean(
    actorPegawai?.id &&
      notaCreatorPegawaiId &&
      actorPegawai.id === notaCreatorPegawaiId,
  );

  // 3. Cek apakah ID pegawai aktor cocok dengan pegawai penandatangan Nota Dinas
  const signerPegawaiId = findPegawaiIdForOfficial(notaSigner);
  const matchesSignerPegawaiId = Boolean(
    actorPegawai?.id &&
      signerPegawaiId &&
      actorPegawai.id === signerPegawaiId,
  );

  // 4. Cek kecocokan nama bersih aktor dengan nama penandatangan Nota Dinas
  const actorNameClean = normalizeText(user.name || "");
  const signerNameClean = normalizeText(
    nota.penandatanganSnapshot?.nama || notaSigner?.nama || "",
  );
  const matchesSignerName = Boolean(
    actorNameClean && signerNameClean && actorNameClean === signerNameClean,
  );

  // 5. Cek akun pengguna tertaut melalui Master Akun Pengguna
  let matchesLinkedAccount = false;
  try {
    const userAccounts = userAccountService.getAll();
    const linkedAccount = userAccounts.find(
      (acc) =>
        acc.id === user.id ||
        (user.username &&
          acc.username.toLowerCase() === user.username.toLowerCase()),
    );
    const effectiveUserPegawaiId =
      user.pegawaiId || linkedAccount?.pegawaiId || actorPegawai?.id;
    matchesLinkedAccount = Boolean(
      effectiveUserPegawaiId &&
        ((notaCreatorPegawaiId &&
          effectiveUserPegawaiId === notaCreatorPegawaiId) ||
          (signerPegawaiId && effectiveUserPegawaiId === signerPegawaiId)),
    );
  } catch {
    // fallback jika userAccountService gagal
  }

  return (
    matchesNotaSigner ||
    isNotaCreator ||
    matchesSignerPegawaiId ||
    matchesSignerName ||
    matchesLinkedAccount
  );
};

export const canUserApproveDocument = (
  user: UserSession,
  document:
    | (NotaDinas & { documentType: "Nota Dinas" })
    | (Spt & { documentType: "SPT" }),
  notas: NotaDinas[],
) =>
  document.documentType === "Nota Dinas"
    ? canUserApproveNotaDinas(user, document)
    : canUserApproveSpt(
        user,
        document,
        notas.find((nota) => nota.id === document.notaDinasId),
      );
