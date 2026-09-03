import type { Spj } from "@/modules/keuangan/keuangan.schema";
import type { Laporan } from "@/modules/laporan/laporan.schema";
import type { NotaDinas } from "@/modules/nota-dinas/nota-dinas.schema";
import type { Sppd } from "@/modules/sppd/sppd.schema";
import type { Spt } from "@/modules/spt/spt.schema";
import type { UserSession } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import {
  canUserApproveNotaDinas,
  canUserApproveSpt,
  getNotaDinasCreatorPegawaiId,
} from "@/modules/approval/approval-access";
import type {
  TravelTask,
  TravelTaskStage,
  TravelTaskTone,
} from "./travel-task.types";

interface TravelTaskSource {
  user: UserSession;
  notas: NotaDinas[];
  spts: Spt[];
  sppds: Sppd[];
  reports: Laporan[];
  spjs: Spj[];
}

interface TaskState {
  stage: TravelTaskStage;
  statusLabel: string;
  description: string;
  tone: TravelTaskTone;
  actionLabel?: string;
  actionUrl?: string;
  notificationEventKey?: string;
  completed?: boolean;
}

const APPROVED_STATUS = new Set(["Disetujui", "Selesai"]);

const formatDate = (value: string) => {
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

export const getSpjRevisionEventKey = (spjId: string, note: string) => {
  let hash = 2166136261;
  for (const character of note.trim()) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return `spj-revision:${spjId}:${(hash >>> 0).toString(36)}`;
};

const getNotaDinasCreatorState = (nota: NotaDinas): TaskState | null => {
  if (APPROVED_STATUS.has(nota.status)) return null;

  if (nota.status === "Menunggu Approval") {
    return {
      stage: "NOTA_DINAS_MENUNGGU_APPROVAL",
      statusLabel: "Nota Dinas Menunggu Approval",
      description: `Nota Dinas ${nota.nomor} sudah dikirim dan sedang menunggu persetujuan.`,
      tone: "warning",
      actionLabel: "Lihat Nota Dinas",
      actionUrl: "/nota-dinas",
    };
  }

  if (nota.status === "Perlu Revisi") {
    const revisionNote = nota.catatanRevisi?.trim();
    return {
      stage: "NOTA_DINAS_PERLU_REVISI",
      statusLabel: "Nota Dinas Perlu Revisi",
      description: revisionNote
        ? `Nota Dinas ${nota.nomor} dikembalikan untuk diperbaiki. Catatan: ${revisionNote}`
        : `Nota Dinas ${nota.nomor} dikembalikan untuk diperbaiki.`,
      tone: "danger",
      actionLabel: "Perbaiki Nota Dinas",
      actionUrl: "/nota-dinas",
      notificationEventKey: `approval:Nota Dinas:${nota.id ?? nota.nomor}:Perlu Revisi`,
    };
  }

  return {
    stage: "NOTA_DINAS_BELUM_DIKIRIM",
    statusLabel: "Nota Dinas Belum Dikirim",
    description: `Nota Dinas ${nota.nomor} belum dikirim untuk approval.`,
    tone: "info",
    actionLabel: "Lanjutkan Nota Dinas",
    actionUrl: "/nota-dinas",
  };
};

const getSptState = (spt: Spt, isApprovalTask = false): TaskState | null => {
  if (APPROVED_STATUS.has(spt.status)) return null;

  if (spt.status === "Menunggu Approval") {
    return {
      stage: "SPT_MENUNGGU_APPROVAL",
      statusLabel: "SPT Menunggu Approval",
      description: isApprovalTask
        ? `SPT ${spt.nomor} menunggu pemeriksaan dan keputusan Anda.`
        : `SPT ${spt.nomor} sudah dikirim dan sedang menunggu persetujuan.`,
      tone: "warning",
      actionLabel: isApprovalTask ? "Lihat Approval SPT" : "Lihat SPT",
      actionUrl: isApprovalTask ? "/approval" : "/spt",
    };
  }

  if (spt.status === "Perlu Revisi") {
    const revisionNote = spt.catatanRevisi?.trim();
    return {
      stage: "SPT_PERLU_REVISI",
      statusLabel: "SPT Perlu Revisi",
      description: revisionNote
        ? `SPT ${spt.nomor} dikembalikan untuk diperbaiki. Catatan: ${revisionNote}`
        : `SPT ${spt.nomor} dikembalikan untuk diperbaiki.`,
      tone: "danger",
      actionLabel: "Perbaiki SPT",
      actionUrl: "/spt",
      notificationEventKey: `approval:SPT:${spt.id ?? spt.nomor}:Perlu Revisi`,
    };
  }

  return {
    stage: "SPT_SEDANG_DISUSUN",
    statusLabel: "SPT Sedang Disusun",
    description: `SPT ${spt.nomor} sudah mulai dibuat dan belum dikirim untuk approval.`,
    tone: "info",
    actionLabel: "Lihat SPT",
    actionUrl: "/spt",
  };
};

const getReportState = (report: Laporan): TaskState | null => {
  if (report.status === "Terverifikasi") return null;

  if (report.status === "Menunggu Verifikasi") {
    return {
      stage: "LAPORAN_MENUNGGU_VERIFIKASI",
      statusLabel: "Laporan Menunggu Verifikasi",
      description: "Laporan sudah dikirim dan sedang menunggu verifikasi.",
      tone: "warning",
      actionLabel: "Lihat Laporan",
      actionUrl: "/laporan",
    };
  }

  if (report.status === "Perlu Revisi") {
    return {
      stage: "LAPORAN_PERLU_REVISI",
      statusLabel: "Laporan Perlu Revisi",
      description:
        "Laporan dikembalikan dan perlu diperbaiki oleh tim perjalanan.",
      tone: "danger",
      actionLabel: "Lihat Laporan",
      actionUrl: "/laporan",
    };
  }

  return {
    stage: "LAPORAN_SEDANG_DISUSUN",
    statusLabel: "Laporan Sedang Disusun",
    description: "Laporan perjalanan sudah mulai dibuat dan belum dikirim.",
    tone: "info",
    actionLabel: "Lihat Laporan",
    actionUrl: "/laporan",
  };
};

const getSpjState = (spj?: Spj): TaskState => {
  if (!spj) {
    return {
      stage: "MENUNGGU_SPJ",
      statusLabel: "Menunggu SPJ Diterima",
      description:
        "Laporan telah terverifikasi. Dokumen berikutnya menunggu penerimaan SPJ oleh Sub Bagian Keuangan.",
      tone: "info",
      actionLabel: "Lihat Status",
      actionUrl: "/spj",
    };
  }

  const revisionNote = spj.catatan.trim();
  if (spj.status === "SPJ Diterima" && revisionNote) {
    return {
      stage: "SPJ_PERLU_DILENGKAPI",
      statusLabel: "SPJ Perlu Dilengkapi",
      description: `Dokumen dikembalikan oleh Unit Keuangan. Catatan: ${revisionNote}`,
      tone: "danger",
      actionLabel: "Lihat Catatan SPJ",
      actionUrl: "/spj",
      notificationEventKey: getSpjRevisionEventKey(spj.id, revisionNote),
    };
  }

  const states: Record<Spj["status"], TaskState> = {
    "SPJ Diterima": {
      stage: "SPJ_DITERIMA",
      statusLabel: "SPJ Diterima",
      description: "SPJ sudah diterima oleh Sub Bagian Keuangan.",
      tone: "info",
      actionLabel: "Lihat Status",
      actionUrl: "/spj",
    },
    "Validasi SPJ": {
      stage: "VALIDASI_SPJ",
      statusLabel: "Validasi SPJ",
      description:
        "Kelengkapan dan nilai pertanggungjawaban sedang divalidasi.",
      tone: "warning",
      actionLabel: "Lihat Status",
      actionUrl: "/spj",
    },
    "Validasi Selesai": {
      stage: "VALIDASI_SELESAI",
      statusLabel: "Validasi Selesai",
      description: "Validasi SPJ telah selesai dan menunggu proses pembayaran.",
      tone: "success",
      actionLabel: "Lihat Status",
      actionUrl: "/spj",
    },
    "Proses Pembayaran": {
      stage: "PROSES_PEMBAYARAN",
      statusLabel: "Proses Pembayaran",
      description: "Dokumen sedang diproses untuk pembayaran.",
      tone: "warning",
      actionLabel: "Lihat Status",
      actionUrl: "/spj",
    },
    "Pembayaran Selesai": {
      stage: "PEMBAYARAN_SELESAI",
      statusLabel: "Pembayaran Selesai",
      description: "Seluruh proses perjalanan dan pembayaran telah selesai.",
      tone: "success",
      actionLabel: "Lihat Status",
      actionUrl: "/spj",
      completed: true,
    },
  };

  return states[spj.status];
};

const getFinanceSpjState = (spj: Spj): TaskState | null => {
  if (spj.status === "Pembayaran Selesai") return null;

  const revisionNote = spj.catatan.trim();
  if (spj.status === "SPJ Diterima" && revisionNote) {
    return {
      stage: "SPJ_PERLU_DILENGKAPI",
      statusLabel: "Menunggu Kelengkapan SPJ",
      description: `SPJ telah dikembalikan kepada pelaksana. Catatan: ${revisionNote}`,
      tone: "danger",
      actionLabel: "Lihat SPJ",
      actionUrl: "/spj",
      notificationEventKey: getSpjRevisionEventKey(spj.id, revisionNote),
    };
  }

  const states: Record<
    Exclude<Spj["status"], "Pembayaran Selesai">,
    TaskState
  > = {
    "SPJ Diterima": {
      stage: "SPJ_DITERIMA",
      statusLabel: "SPJ Diterima",
      description:
        "Laporan telah terverifikasi dan menunggu pemeriksaan kelengkapan SPJ oleh Anda.",
      tone: "warning",
      actionLabel: "Mulai Validasi",
      actionUrl: "/spj",
    },
    "Validasi SPJ": {
      stage: "VALIDASI_SPJ",
      statusLabel: "Validasi SPJ",
      description:
        "Pemeriksaan kelengkapan dan realisasi biaya SPJ belum diselesaikan.",
      tone: "warning",
      actionLabel: "Lanjutkan Validasi",
      actionUrl: "/spj",
    },
    "Validasi Selesai": {
      stage: "VALIDASI_SELESAI",
      statusLabel: "Validasi Selesai",
      description:
        "SPJ telah tervalidasi dan menunggu penerbitan rangkaian dokumen keuangan.",
      tone: "info",
      actionLabel: "Buat SPBY",
      actionUrl: "/spby",
    },
    "Proses Pembayaran": {
      stage: "PROSES_PEMBAYARAN",
      statusLabel: "Proses Pembayaran",
      description:
        "Dokumen keuangan telah diproses dan pembayaran individual belum seluruhnya diselesaikan.",
      tone: "warning",
      actionLabel: "Lanjutkan Pembayaran",
      actionUrl: "/kuitansi",
    },
  };

  return {
    ...states[spj.status],
    notificationEventKey: `finance-spj:${spj.id}:${spj.status}`,
  };
};

const createTask = (
  nota: NotaDinas,
  taskId: string,
  state: TaskState,
  spt?: Spt,
): TravelTask => ({
  id: taskId,
  notaDinasId: nota.id ?? nota.nomor,
  nomorNotaDinas: nota.nomor,
  nomorSpt: spt?.nomor,
  perihal: nota.perihal,
  tanggalBerangkat: nota.tanggalBerangkat,
  tanggalKembali: nota.tanggalKembali,
  lokasiTujuan: nota.lokasiTujuan,
  stage: state.stage,
  statusLabel: state.statusLabel,
  description: state.description,
  tone: state.tone,
  actionLabel: state.actionLabel,
  actionUrl: state.actionUrl,
  notificationEventKey: state.notificationEventKey,
  completed: state.completed ?? false,
});

const buildSptTask = (
  user: UserSession,
  nota: NotaDinas,
  spt: Spt,
  sppds: Sppd[],
  reports: Laporan[],
  spjs: Spj[],
): TravelTask => {
  const taskId = `${nota.id ?? nota.nomor}:${spt.id ?? spt.nomor}`;
  const sptState = getSptState(spt, canUserApproveSpt(user, spt, nota));
  if (sptState) return createTask(nota, taskId, sptState, spt);

  const assignedPegawaiIds = new Set(
    spt.personil.map((person) => person.pegawaiId),
  );
  const issuedPegawaiIds = new Set(
    sppds
      .filter((sppd) => sppd.sptId === spt.id)
      .map((sppd) => sppd.personil[0]?.pegawaiId)
      .filter(
        (pegawaiId): pegawaiId is string =>
          Boolean(pegawaiId) && assignedPegawaiIds.has(pegawaiId),
      ),
  );
  const issuedCount = issuedPegawaiIds.size;
  const requiredCount = assignedPegawaiIds.size;

  if (issuedCount === 0) {
    return createTask(
      nota,
      taskId,
      {
        stage: "SPPD_BELUM_DITERBITKAN",
        statusLabel: "SPPD Belum Diterbitkan",
        description: `Belum ada SPPD individual untuk ${requiredCount} personil pada SPT ${spt.nomor}.`,
        tone: "warning",
        actionLabel: "Buat SPPD",
        actionUrl: "/sppd",
      },
      spt,
    );
  }

  if (issuedCount < requiredCount) {
    return createTask(
      nota,
      taskId,
      {
        stage: "SPPD_SEDANG_DITERBITKAN",
        statusLabel: `SPPD Sedang Diterbitkan (${issuedCount}/${requiredCount})`,
        description:
          "Rangkaian SPPD sedang dikelola oleh anggota yang memulai. Anggota lain hanya memantau status penerbitannya.",
        tone: "info",
        actionLabel: "Lihat Status SPPD",
        actionUrl: "/sppd",
      },
      spt,
    );
  }

  const report = reports.find((item) => item.sptId === spt.id);
  if (!report) {
    return createTask(
      nota,
      taskId,
      {
        stage: "LAPORAN_BELUM_DIBUAT",
        statusLabel: "Laporan Belum Dibuat",
        description:
          "Seluruh SPPD individual sudah diterbitkan. Satu laporan perlu dibuat untuk SPT ini.",
        tone: "warning",
        actionLabel: "Buat Laporan",
        actionUrl: "/laporan",
      },
      spt,
    );
  }

  const reportState = getReportState(report);
  if (reportState) return createTask(nota, taskId, reportState, spt);

  const spj = spjs.find((item) => item.laporanId === report.id);
  return createTask(nota, taskId, getSpjState(spj), spt);
};

export const buildTravelTasks = ({
  user,
  notas,
  spts,
  sppds,
  reports,
  spjs,
}: TravelTaskSource): TravelTask[] => {
  const financeTasks =
    user.role === "Sub Bagian Keuangan"
      ? spjs.flatMap((spj) => {
          const report = reports.find((item) => item.id === spj.laporanId);
          const sppd = sppds.find((item) => item.id === spj.sppdId);
          const spt = spts.find(
            (item) => item.id === (report?.sptId ?? sppd?.sptId),
          );
          const nota = notas.find((item) => item.id === spt?.notaDinasId);
          const state = getFinanceSpjState(spj);

          if (!nota || !spt || !state) return [];

          return [createTask(nota, `finance:${spj.id}`, state, spt)];
        })
      : [];

  if (!user.pegawaiId) return financeTasks;

  const notaCreatorTasks = notas.flatMap((nota) => {
    if (getNotaDinasCreatorPegawaiId(nota) !== user.pegawaiId) return [];

    const state = getNotaDinasCreatorState(nota);
    if (!state) return [];

    return [createTask(nota, `${nota.id ?? nota.nomor}:creator`, state)];
  });

  const sptCreatorTasks = spts.flatMap((spt) => {
    if (spt.createdByPegawaiId !== user.pegawaiId) return [];

    const nota = notas.find((item) => item.id === spt.notaDinasId);
    if (!nota) return [];

    const state = getSptState(spt);
    if (!state) return [];

    return [
      createTask(
        nota,
        `${nota.id ?? nota.nomor}:${spt.id ?? spt.nomor}`,
        state,
        spt,
      ),
    ];
  });

  const personalTasks = (notas || [])
    .filter(
      (nota) =>
        APPROVED_STATUS.has(nota.status) &&
        (nota.lampiran || []).some(
          (person) => person?.pegawaiId === user.pegawaiId,
        ),
    )
    .flatMap((nota) => {
      const assignedSpts = (spts || []).filter(
        (spt) =>
          spt?.notaDinasId === nota.id &&
          (spt?.personil || []).some(
            (person) => person?.pegawaiId === user.pegawaiId,
          ),
      );

      if (!assignedSpts.length) {
        return [
          createTask(nota, `${nota.id ?? nota.nomor}:spt-pending`, {
            stage: "SPT_BELUM_DITERBITKAN",
            statusLabel: "SPT Belum Diterbitkan",
            description:
              "Nota Dinas telah disetujui dan menugaskan Anda. Surat Tugas belum diterbitkan.",
            tone: "warning",
            actionLabel: "Buat SPT",
            actionUrl: "/spt",
          }),
        ];
      }

      return assignedSpts.map((spt) =>
        buildSptTask(user, nota, spt, sppds, reports, spjs),
      );
    });

  const notaApprovalTasks = notas.flatMap((nota) => {
    if (
      nota.status !== "Menunggu Approval" ||
      !canUserApproveNotaDinas(user, nota)
    ) {
      return [];
    }

    return [
      createTask(nota, `${nota.id ?? nota.nomor}:approval`, {
        stage: "NOTA_DINAS_MENUNGGU_APPROVAL",
        statusLabel: "Nota Dinas Menunggu Approval",
        description: `Nota Dinas ${nota.nomor} menunggu pemeriksaan dan keputusan Anda.`,
        tone: "warning",
        actionLabel: "Lihat Approval Nota Dinas",
        actionUrl: "/approval",
      }),
    ];
  });

  const sptApprovalTasks = spts.flatMap((spt) => {
    if (spt.status !== "Menunggu Approval") return [];
    const nota = notas.find((item) => item.id === spt.notaDinasId);
    if (!nota || !canUserApproveSpt(user, spt, nota)) return [];

    return [
      createTask(
        nota,
        `${nota.id ?? nota.nomor}:${spt.id ?? spt.nomor}`,
        getSptState(spt, true)!,
        spt,
      ),
    ];
  });

  const tasks = Array.from(
    new Map(
      [
        ...notaCreatorTasks,
        ...sptCreatorTasks,
        ...personalTasks,
        ...notaApprovalTasks,
        ...sptApprovalTasks,
        ...financeTasks,
      ].map((task) => [task.id, task]),
    ).values(),
  );

  return tasks.sort((left, right) => {
    if (left.completed !== right.completed) return left.completed ? 1 : -1;
    return right.tanggalBerangkat.localeCompare(left.tanggalBerangkat);
  });
};

export const syncTravelTaskNotifications = (
  user: UserSession,
  tasks: TravelTask[],
) => {
  if (!user.pegawaiId) return;

  const { upsertNotification } = useNotificationStore.getState();
  tasks.forEach((task) => {
    upsertNotification({
      eventKey:
        task.notificationEventKey ??
        `travel-task:${user.pegawaiId}:${task.id}:${task.stage}`,
      recipientPegawaiId: user.pegawaiId,
      title:
        task.stage === "SPT_BELUM_DITERBITKAN"
          ? "Tugas Perjalanan Dinas Baru"
          : task.statusLabel,
      message: `${task.nomorNotaDinas} · ${formatDate(task.tanggalBerangkat)}–${formatDate(task.tanggalKembali)} · ${task.lokasiTujuan}. ${task.description}`,
      type:
        task.tone === "danger"
          ? "error"
          : task.tone === "success"
            ? "success"
            : task.tone,
      actionUrl: task.actionUrl,
    });
  });
};
