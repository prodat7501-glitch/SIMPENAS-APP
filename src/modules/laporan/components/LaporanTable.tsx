"use client";
import { CheckCircle, Download, Edit2, Eye, Inbox, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LAPORAN_STATUS_OPTIONS } from "../laporan.constants";
import type { Laporan } from "../laporan.schema";
import type { LaporanStatus } from "../laporan.types";
import { formatTableDate } from "@/lib/formatters";

interface Props {
  items: Laporan[];
  search: string;
  status: LaporanStatus | "Semua";
  canEdit: boolean;
  canEditItem?: (item: Laporan) => boolean;
  canDelete: boolean;
  canApprove: boolean;
  onSearch: (v: string) => void;
  onStatus: (v: LaporanStatus | "Semua") => void;
  onEdit: (item: Laporan) => void;
  onDelete: (id: string) => void;
  onPreview: (item: Laporan) => void;
  onVerify: (item: Laporan) => void;
  getSpt: (item: Laporan) => string;
  getPelaksana: (item: Laporan) => string;
}
const variant = (status: LaporanStatus) =>
  status === "Draft"
    ? "outline"
    : status === "Menunggu Verifikasi"
      ? "warning"
      : status === "Perlu Revisi"
        ? "danger"
        : "success";

export function LaporanTable(props: Props) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-[minmax(0,360px)_220px] gap-3">
        <Input
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="Cari dasar atau tujuan..."
          leftIcon={<Search className="w-4 h-4" />}
        />
        <Select
          value={props.status}
          onChange={(e) =>
            props.onStatus(e.target.value as LaporanStatus | "Semua")
          }
        >
          <option value="Semua">Semua Status</option>
          {LAPORAN_STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
      </div>
      {!props.items.length ? (
        <EmptyState
          title="Belum Ada Laporan"
          description="Laporan perjalanan belum dibuat atau tidak ditemukan."
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nomor SPT</TableHead>
                <TableHead>Pelaksana</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Dokumentasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {props.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs font-bold">
                    <div>{props.getSpt(item)}</div>
                    {item.metodeLaporan === "upload" && item.fileLaporan && (
                      <div className="mt-1 flex items-center gap-1 font-sans">
                        {item.fileLaporan.nama.toLowerCase().endsWith(".pdf") ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 px-1.5 py-0.5 rounded">
                            PDF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                            Word
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]" title={item.fileLaporan.nama}>
                          {item.fileLaporan.nama}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{props.getPelaksana(item)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">
                        {item.tempatPelaksanaan || item.tujuan || "-"}
                      </span>
                      {item.tempatPelaksanaan && item.tujuan && item.tempatPelaksanaan.trim() !== item.tujuan.trim() && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1 max-w-[280px]" title={item.tujuan}>
                          {item.tujuan}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{formatTableDate(item.tanggalLaporan)}</TableCell>
                  <TableCell>
                    {item.metodeLaporan === "upload" ? (
                      <span className="text-xs text-muted-foreground">
                        {item.dokumentasi.length > 0 ? `${item.dokumentasi.length} foto` : "Berkas Dokumen"}
                      </span>
                    ) : (
                      <span>{item.dokumentasi.length} foto</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={variant(item.status)}>{item.status}</Badge>
                      {item.status === "Perlu Revisi" &&
                        item.catatanVerifikasi && (
                          <p className="max-w-64 text-[10px] font-semibold leading-relaxed text-danger">
                            Catatan: {item.catatanVerifikasi}
                          </p>
                        )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      {item.metodeLaporan === "upload" && item.fileLaporan?.dataUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = item.fileLaporan!.dataUrl;
                            a.download = item.fileLaporan!.nama;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          title={`Unduh ${item.fileLaporan.nama}`}
                        >
                          <Download className="w-4 h-4 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => props.onPreview(item)}
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {props.canApprove &&
                        item.status === "Menunggu Verifikasi" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => props.onVerify(item)}
                            title="Verifikasi"
                          >
                            <CheckCircle className="w-4 h-4 text-success" />
                          </Button>
                        )}
                      {props.canEdit &&
                        (props.canEditItem?.(item) ?? true) &&
                        item.status !== "Terverifikasi" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => props.onEdit(item)}
                            title="Ubah"
                          >
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                        )}
                      {props.canDelete && item.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => props.onDelete(item.id!)}
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
