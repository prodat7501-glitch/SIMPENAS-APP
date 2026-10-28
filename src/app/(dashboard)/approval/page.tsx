"use client";
import { Trash2 } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Timeline } from "@/components/ui/timeline";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/useAuth";
import { ApprovalDetail } from "@/modules/approval/components/ApprovalDetail";
import { ApprovalTable } from "@/modules/approval/components/ApprovalTable";
import type { ApprovalDecision } from "@/modules/approval/approval.schema";
import { useApproval } from "@/modules/approval/useApproval";
import { useJabatan } from "@/modules/jabatan/useJabatan";
import { usePegawai } from "@/modules/pegawai/usePegawai";

export default function ApprovalPage() {
  const { user, hasPermission } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const approval = useApproval();
  const { items: pegawais } = usePegawai();
  const { items: jabatans } = useJabatan();
  const canApprove = hasPermission("Approval", "A");
  const canClearHistory =
    (user?.role === "Administrator" || user?.role === "Supervisor") &&
    hasPermission("Approval", "D");
  if (!hasPermission("Approval", "R"))
    return (
      <Alert variant="error" title="Akses Ditolak">
        Halaman Approval hanya dapat diakses oleh Supervisor.
      </Alert>
    );
  const decide = async (data: ApprovalDecision) => {
    if (!canApprove)
      return addToast("Anda tidak memiliki izin approval", "error");
    try {
      await approval.decide(data);
      addToast(
        `${data.documentType} ${data.decision.toLowerCase()}`,
        "success",
      );
      approval.setSelected(null);
    } catch (error) {
      addToast(
        error instanceof Error ? error.message : "Approval gagal",
        "error",
      );
    }
  };
  const clearHistory = async () => {
    if (!user || !canClearHistory) {
      addToast(
        "Hanya Administrator atau Supervisor yang dapat membersihkan riwayat approval.",
        "error",
      );
      return;
    }
    const isConfirmed = await confirm({
      title: "Bersihkan Riwayat Approval",
      message: `Bersihkan ${approval.history.length} riwayat approval? Dokumen Nota Dinas dan SPT tidak akan dihapus.`,
      variant: "danger",
      confirmText: "Ya, Bersihkan",
    });
    if (!isConfirmed) {
      return;
    }
    try {
      const total = await approval.clearHistory({
        role: user.role,
        user: user.name,
      });
      addToast(`${total} riwayat approval berhasil dibersihkan.`, "success");
    } catch (error) {
      addToast(
        error instanceof Error
          ? error.message
          : "Riwayat approval gagal dibersihkan.",
        "error",
      );
    }
  };
  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={approval.isLoading || approval.isSaving}
        message="Memproses approval dokumen..."
      />
      <div>
        <h1 className="text-xl font-extrabold">Approval SPT dan Nota Dinas</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Periksa, setujui, atau kembalikan SPT dan Nota Dinas untuk revisi.
        </p>
      </div>
      {approval.error && (
        <Alert variant="error" title="Gagal Memuat Approval">
          Data approval tidak dapat dimuat.
        </Alert>
      )}
      <ApprovalTable
        items={approval.pendingItems}
        search={approval.search}
        onSearch={approval.setSearch}
        onDetail={approval.setSelected}
      />
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Riwayat Approval</h2>
            <Badge variant="outline">{approval.history.length}</Badge>
          </div>
          {canClearHistory && (
            <Button
              variant="destructive"
              size="sm"
              disabled={approval.history.length === 0 || approval.isSaving}
              onClick={clearHistory}
            >
              <Trash2 className="w-4 h-4" /> Bersihkan Riwayat Approval
            </Button>
          )}
        </div>
        {approval.history.length === 0 ? (
          <Alert variant="info">Belum ada riwayat keputusan approval.</Alert>
        ) : (
          <Timeline
            events={approval.history.map((item) => {
              const docNum =
                item.nomorDokumen &&
                item.nomorDokumen !== "-" &&
                item.nomorDokumen !== "undefined" &&
                item.nomorDokumen !== "null"
                  ? item.nomorDokumen
                  : "Tanpa Nomor";
              const validDate = (() => {
                if (
                  !item.tanggal ||
                  item.tanggal === "undefined" ||
                  item.tanggal === "Invalid Date"
                ) {
                  return new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
                const parsed = new Date(item.tanggal);
                if (isNaN(parsed.getTime())) {
                  return new Date().toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                }
                return parsed.toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });
              })();
              const approverName =
                item.approver &&
                item.approver !== "undefined" &&
                item.approver !== "null"
                  ? item.approver
                  : "Sekretaris KPU";
              const statusName =
                item.status &&
                String(item.status) !== "undefined" &&
                String(item.status) !== "null"
                  ? item.status
                  : "Disetujui";
              const desc =
                item.catatan && item.catatan !== "undefined" && item.catatan !== "-"
                  ? item.catatan
                  : `Diproses oleh ${approverName}`;
              const title = `${item.documentType || "Nota Dinas"} ${docNum} — ${statusName}`;

              return {
                id: item.id,
                title,
                description: desc,
                time: validDate,
                status: statusName === "Disetujui" ? "success" : "danger",
              };
            })}
          />
        )}
      </section>
      <ApprovalDetail
        item={approval.selected}
        pegawais={pegawais}
        jabatans={jabatans}
        approver={user?.name ?? "Supervisor"}
        isSaving={approval.isSaving}
        onClose={() => approval.setSelected(null)}
        onSubmit={decide}
      />
    </div>
  );
}
