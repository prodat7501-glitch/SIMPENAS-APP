import type { ActivityItem } from "@/stores/activity.store";
import type { UserRole, UserSession } from "@/stores/auth.store";
import { dipaService } from "@/modules/dipa/dipa.service";
import { keuanganService } from "@/modules/keuangan/keuangan.service";
import type { DokumenKeuangan, Spj } from "@/modules/keuangan/keuangan.schema";
import { laporanService } from "@/modules/laporan/laporan.service";
import { notaDinasService } from "@/modules/nota-dinas/nota-dinas.service";
import { pegawaiService } from "@/modules/pegawai/pegawai.service";
import { sortPegawais } from "@/modules/pegawai/pegawai-order";
import { jabatanService } from "@/modules/jabatan/jabatan.service";
import { pangkatService } from "@/modules/pangkat/pangkat.service";
import { sppdService } from "@/modules/sppd/sppd.service";
import { sptService } from "@/modules/spt/spt.service";
import {
  buildTravelTasks,
  syncTravelTaskNotifications,
} from "@/modules/tugas-perjalanan/travel-task.service";
import { dashboardDataMigrationService } from "./dashboard-data-migration.service";
import type {
  DashboardChartData,
  DashboardData,
  DashboardMetric,
  DashboardQuickAction,
} from "./dashboard.types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const formatInteger = (value: number) =>
  new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const isInYear = (dateValue: string | undefined, year: string) =>
  Boolean(dateValue && dateValue.slice(0, 4) === year);

const getMonthIndex = (dateValue: string | undefined, year: string) => {
  if (!isInYear(dateValue, year)) return -1;
  const month = Number(dateValue?.slice(5, 7)) - 1;
  return month >= 0 && month < 12 ? month : -1;
};

const getCurrentYear = () => String(new Date().getFullYear());

const getPaidKuitansi = (documents: DokumenKeuangan[]) =>
  documents.filter(
    (document) =>
      document.jenis === "Kuitansi" &&
      document.status === "Selesai" &&
      document.pembayaran,
  );

const buildActivities = (
  role: UserRole,
  userName: string,
  activities: ActivityItem[],
) => {
  const roleModules: Partial<Record<UserRole, string[]>> = {
    Supervisor: ["Nota Dinas", "SPT", "Approval", "Laporan Perjalanan"],
    "Sub Bagian Keuangan": [
      "Validasi SPJ dan Pembayaran",
      "Validasi SPJ",
      "SPBY",
      "Daftar Nominatif",
      "Tanda Terima",
      "Kuitansi",
      "Arsip SPJ",
    ],
  };

  return activities
    .filter((activity) => {
      if (role === "Administrator") return true;
      if (activity.user === userName) return true;
      if (role === "Pegawai") return false;
      return (roleModules[role] ?? []).some((moduleName) =>
        activity.module.toLowerCase().includes(moduleName.toLowerCase()),
      );
    })
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() -
        new Date(left.createdAt).getTime(),
    )
    .slice(0, 5);
};

const quickActionsByRole: Record<UserRole, DashboardQuickAction[]> = {
  Administrator: [
    {
      key: "pegawai",
      label: "Master Pegawai",
      description: "Kelola identitas dan role pegawai",
      href: "/master/pegawai",
    },
    {
      key: "rekap",
      label: "Rekapitulasi",
      description: "Lihat rekap perjalanan dan pembayaran",
      href: "/rekapitulasi",
    },
    {
      key: "pengaturan",
      label: "Pengaturan Nomor",
      description: "Kelola penomoran dan booking",
      href: "/pengaturan",
    },
  ],
  Supervisor: [
    {
      key: "approval",
      label: "Approval",
      description: "Proses dokumen menunggu persetujuan",
      href: "/approval",
    },
    {
      key: "nota",
      label: "Nota Dinas",
      description: "Buat dan pantau Nota Dinas",
      href: "/nota-dinas",
    },
  ],
  Pegawai: [
    {
      key: "spt",
      label: "Surat Tugas",
      description: "Lihat tugas perjalanan Anda",
      href: "/spt",
    },
    {
      key: "laporan",
      label: "Laporan Perjalanan",
      description: "Buat atau lengkapi laporan",
      href: "/laporan",
    },
  ],
  "Sub Bagian Keuangan": [
    {
      key: "spj",
      label: "Validasi SPJ dan Pembayaran",
      description: "Pantau validasi sampai pembayaran selesai",
      href: "/spj",
    },
    {
      key: "kuitansi",
      label: "Kuitansi",
      description: "Kelola penyelesaian pembayaran",
      href: "/kuitansi",
    },
  ],
};

export const dashboardService = {
  getData: async (
    user: UserSession,
    activities: ActivityItem[],
  ): Promise<DashboardData> => {
    const migration = await dashboardDataMigrationService.migrate();
    const removedDemoRecords =
      migration.removedNotaDinas + migration.removedSpt + migration.removedSppd;

    const year = getCurrentYear();
    const pegawais = pegawaiService.getAll();
    const dipas = dipaService.getAll();
    const notas = notaDinasService.getAll();
    const spts = sptService.getAll();
    const sppds = sppdService.getAllSync();
    const reports = await laporanService.list();
    const spjs = await keuanganService.list(reports, { sppds, spts, notas });
    const documents = spjs.flatMap((spj: Spj) => spj.dokumen);
    const travelTasks = buildTravelTasks({
      user,
      notas,
      spts,
      sppds,
      reports,
      spjs,
    });
    syncTravelTaskNotifications(user, travelTasks);
    const paidKuitansi = getPaidKuitansi(documents);
    const allEmployeeSummaries = sortPegawais(
      pegawais,
      jabatanService.getAll(),
      pangkatService.getAll(),
    ).map((pegawai, index) => ({
      pegawaiId: pegawai.id ?? `pegawai-tanpa-id-${index}`,
      nama: pegawai.nama,
      nip: pegawai.nip || "",
      jumlahHariSppd: sppds
        .filter(
          (sppd) =>
            isInYear(sppd.tanggalBerangkat, year) &&
            sppd.personil.some((person) => person.pegawaiId === pegawai.id),
        )
        .reduce((total, sppd) => total + Number(sppd.lamaPerjalanan || 0), 0),
      jumlahDibayarkan: paidKuitansi
        .filter((document) =>
          isInYear(document.pembayaran?.tanggalPembayaran, year),
        )
        .flatMap((document) => document.rincian)
        .filter((row) => row.pegawaiId === pegawai.id)
        .reduce((total, row) => total + row.jumlah, 0),
    }));
    const sessionPegawaiId =
      user.pegawaiId ||
      pegawais.find(
        (pegawai) =>
          pegawai.nama.trim().toLocaleLowerCase("id-ID") ===
          user.name.trim().toLocaleLowerCase("id-ID"),
      )?.id;
    const employeeSummaries =
      user.role === "Administrator"
        ? allEmployeeSummaries
        : allEmployeeSummaries.filter(
            (summary) => summary.pegawaiId === sessionPegawaiId,
          );
    const activeDipas = dipas.filter((dipa) => dipa.tahunAnggaran === year);
    const totalPagu = activeDipas.reduce((sum, dipa) => sum + dipa.pagu, 0);

    let metrics: DashboardMetric[] = [];
    let chart: DashboardChartData;

    if (user.role === "Administrator") {
      const yearSpts = spts.filter((spt) => isInYear(spt.tanggalMulai, year));
      const yearPayments = paidKuitansi.filter((document) =>
        isInYear(document.pembayaran?.tanggalPembayaran, year),
      );
      const totalPaid = yearPayments.reduce(
        (sum, document) => sum + document.total,
        0,
      );
      let cumulativePaid = 0;
      const monthlyPaid = MONTH_NAMES.map((_, month) =>
        yearPayments
          .filter(
            (document) =>
              getMonthIndex(document.pembayaran?.tanggalPembayaran, year) ===
              month,
          )
          .reduce((sum, document) => sum + document.total, 0),
      );

      metrics = [
        {
          key: "pegawai",
          label: "Pegawai Aktif",
          value: formatInteger(
            pegawais.filter((pegawai) => pegawai.status === "Aktif").length,
          ),
          description: "Berdasarkan Master Pegawai",
          tone: "primary",
        },
        {
          key: "perjalanan",
          label: "SPT Tahun Ini",
          value: formatInteger(yearSpts.length),
          description: `${yearSpts.filter((spt) => ["Disetujui", "Selesai"].includes(spt.status)).length} telah disetujui/selesai`,
          tone: "accent",
        },
        {
          key: "anggaran",
          label: "Pagu DIPA Aktif",
          value: formatCurrency(totalPagu),
          description: `${activeDipas.length} akun DIPA tahun ${year}`,
          tone: "warning",
        },
        {
          key: "pembayaran",
          label: "Pembayaran Selesai",
          value: formatCurrency(totalPaid),
          description: `${yearPayments.length} kuitansi telah dibayar`,
          tone: "success",
        },
      ];
      chart = {
        title: "Pagu dan Realisasi Pembayaran",
        description: `Akumulasi aktual tahun ${year} dalam juta rupiah`,
        type: "area",
        primaryLabel: "Pagu",
        secondaryLabel: "Realisasi",
        points: MONTH_NAMES.map((name, month) => {
          cumulativePaid += monthlyPaid[month];
          return {
            name,
            primary: totalPagu / 1_000_000,
            secondary: cumulativePaid / 1_000_000,
          };
        }),
      };
    } else if (user.role === "Supervisor") {
      const yearSpts = spts.filter((spt) => isInYear(spt.tanggalMulai, year));
      const today = new Date().toISOString().slice(0, 10);
      const activeTravels = sppds.filter(
        (sppd) =>
          sppd.tanggalBerangkat <= today &&
          sppd.tanggalKembali >= today &&
          sppd.status !== "Draft",
      );
      const pendingApproval =
        notas.filter((nota) => nota.status === "Menunggu Approval").length +
        spts.filter((spt) => spt.status === "Menunggu Approval").length;
      const yearSppds = sppds.filter((sppd) =>
        isInYear(sppd.tanggalBerangkat, year),
      );

      metrics = [
        {
          key: "approval",
          label: "Menunggu Approval",
          value: formatInteger(pendingApproval),
          description: "Nota Dinas dan SPT yang belum diputuskan",
          tone: "warning",
        },
        {
          key: "aktif",
          label: "Personel Sedang Dinas",
          value: formatInteger(activeTravels.length),
          description: `Aktif pada tanggal ${new Intl.DateTimeFormat("id-ID").format(new Date())}`,
          tone: "primary",
        },
        {
          key: "perjalanan",
          label: "SPT Tahun Ini",
          value: formatInteger(yearSpts.length),
          description: `${yearSpts.filter((spt) => spt.status === "Selesai").length} berstatus selesai`,
          tone: "success",
        },
        {
          key: "hari",
          label: "Total Hari Dinas",
          value: formatInteger(
            yearSppds.reduce(
              (sum, sppd) => sum + Number(sppd.lamaPerjalanan || 0),
              0,
            ),
          ),
          description: "Akumulasi SPPD individual tahun berjalan",
          tone: "accent",
        },
      ];
      chart = {
        title: "Perjalanan Dinas Bulanan",
        description: `SPT dibuat dibandingkan SPT disetujui/selesai tahun ${year}`,
        type: "bar",
        primaryLabel: "SPT Dibuat",
        secondaryLabel: "Disetujui/Selesai",
        points: MONTH_NAMES.map((name, month) => {
          const monthly = yearSpts.filter(
            (spt) => getMonthIndex(spt.tanggalMulai, year) === month,
          );
          return {
            name,
            primary: monthly.length,
            secondary: monthly.filter((spt) =>
              ["Disetujui", "Selesai"].includes(spt.status),
            ).length,
          };
        }),
      };
    } else if (user.role === "Pegawai") {
      const pegawaiId = user.pegawaiId;
      const ownSpts = spts.filter(
        (spt) =>
          isInYear(spt.tanggalMulai, year) &&
          spt.personil.some((person) => person.pegawaiId === pegawaiId),
      );
      const ownSptIds = new Set(
        ownSpts.map((spt) => spt.id).filter((id): id is string => Boolean(id)),
      );
      const ownSppds = sppds.filter(
        (sppd) =>
          isInYear(sppd.tanggalBerangkat, year) &&
          sppd.personil.some((person) => person.pegawaiId === pegawaiId),
      );
      const ownReports = reports.filter((report) =>
        ownSptIds.has(report.sptId),
      );
      const latestSpt = [...ownSpts].sort((left, right) =>
        right.tanggalMulai.localeCompare(left.tanggalMulai),
      )[0];

      metrics = [
        {
          key: "perjalanan",
          label: "Tugas Dinas Saya",
          value: formatInteger(ownSpts.length),
          description: `SPT yang menugaskan Anda pada tahun ${year}`,
          tone: "primary",
        },
        {
          key: "status",
          label: "Status SPT Terbaru",
          value: latestSpt?.status ?? "Belum Ada",
          description: latestSpt?.nomor ?? "Belum ada SPT untuk akun ini",
          tone: "success",
        },
        {
          key: "laporan",
          label: "Laporan Perjalanan",
          value: formatInteger(ownReports.length),
          description: `${ownReports.filter((report) => report.status === "Terverifikasi").length} laporan terverifikasi`,
          tone: "accent",
        },
        {
          key: "hari",
          label: "Hari Dinas Saya",
          value: formatInteger(
            ownSppds.reduce(
              (sum, sppd) => sum + Number(sppd.lamaPerjalanan || 0),
              0,
            ),
          ),
          description: "Akumulasi dari SPPD individual Anda",
          tone: "warning",
        },
      ];
      chart = {
        title: "Riwayat Hari Dinas Bulanan",
        description: `Akumulasi lama perjalanan Anda tahun ${year}`,
        type: "line",
        primaryLabel: "Hari Dinas",
        points: MONTH_NAMES.map((name, month) => ({
          name,
          primary: ownSppds
            .filter(
              (sppd) => getMonthIndex(sppd.tanggalBerangkat, year) === month,
            )
            .reduce((sum, sppd) => sum + Number(sppd.lamaPerjalanan || 0), 0),
        })),
      };
    } else {
      const yearSpjs = spjs.filter((spj) =>
        isInYear(spj.tanggalDiterima, year),
      );
      const pendingSpjs = yearSpjs.filter(
        (spj) => spj.status === "SPJ Diterima" || spj.status === "Validasi SPJ",
      );
      const spbyQueue = yearSpjs.filter(
        (spj) =>
          spj.status === "Validasi Selesai" &&
          !spj.dokumen.some((document) => document.jenis === "SPBY"),
      );
      const today = new Date().toISOString().slice(0, 10);
      const yearPayments = paidKuitansi.filter((document) =>
        isInYear(document.pembayaran?.tanggalPembayaran, year),
      );
      const paymentsToday = yearPayments.filter(
        (document) => document.pembayaran?.tanggalPembayaran === today,
      );

      metrics = [
        {
          key: "spj",
          label: "Validasi SPJ Tertunda",
          value: formatInteger(pendingSpjs.length),
          description: "SPJ belum mencapai tahap Validasi Selesai",
          tone: "warning",
        },
        {
          key: "spby",
          label: "Antrean SPBY",
          value: formatInteger(spbyQueue.length),
          description: "SPJ tervalidasi yang belum memiliki SPBY",
          tone: "primary",
        },
        {
          key: "pembayaran",
          label: "Pembayaran Hari Ini",
          value: formatCurrency(
            paymentsToday.reduce((sum, document) => sum + document.total, 0),
          ),
          description: `${paymentsToday.length} kuitansi selesai hari ini`,
          tone: "success",
        },
        {
          key: "anggaran",
          label: "Total Dibayar Tahun Ini",
          value: formatCurrency(
            yearPayments.reduce((sum, document) => sum + document.total, 0),
          ),
          description: `${yearPayments.length} kuitansi telah diselesaikan`,
          tone: "accent",
        },
      ];
      chart = {
        title: "SPBY dan Pembayaran Kuitansi",
        description: `Nominal dokumen aktual per bulan tahun ${year} dalam juta rupiah`,
        type: "area",
        primaryLabel: "SPBY",
        secondaryLabel: "Kuitansi Dibayar",
        points: MONTH_NAMES.map((name, month) => ({
          name,
          primary:
            documents
              .filter(
                (document) =>
                  document.jenis === "SPBY" &&
                  getMonthIndex(document.tanggal, year) === month,
              )
              .reduce((sum, document) => sum + document.total, 0) / 1_000_000,
          secondary:
            yearPayments
              .filter(
                (document) =>
                  getMonthIndex(
                    document.pembayaran?.tanggalPembayaran,
                    year,
                  ) === month,
              )
              .reduce((sum, document) => sum + document.total, 0) / 1_000_000,
        })),
      };
    }

    return {
      year,
      activeDipaCount: activeDipas.length,
      metrics,
      chart,
      activities: buildActivities(user.role, user.name, activities),
      quickActions: quickActionsByRole[user.role],
      travelTasks,
      employeeSummaries,
      removedDemoRecords,
    };
  },
};
