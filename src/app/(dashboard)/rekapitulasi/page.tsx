"use client";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  CalendarDays,
  Download,
  FileDown,
  MapPinned,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useAuth } from "@/hooks/useAuth";
import { useKeuangan } from "@/modules/keuangan/useKeuangan";
import { useLaporan } from "@/modules/laporan/useLaporan";
import { useNotaDinas } from "@/modules/nota-dinas/useNotaDinas";
import { usePegawai } from "@/modules/pegawai/usePegawai";
import {
  buildRekap,
  chartRekap,
  exportExcel,
  filterRekap,
} from "@/modules/rekapitulasi/rekapitulasi.service";
import type { RekapFilters } from "@/modules/rekapitulasi/rekapitulasi.types";
import { useSppd } from "@/modules/sppd/useSppd";
import { useSpt } from "@/modules/spt/useSpt";
import { formatRupiah } from "@/lib/formatters";

const RekapPrintPreview = dynamic(
  () =>
    import("@/modules/rekapitulasi/components/RekapPrintPreview").then(
      (module) => module.RekapPrintPreview,
    ),
  { ssr: false },
);
export default function RekapitulasiPage() {
  const { hasPermission } = useAuth();
  const { items: sppds } = useSppd();
  const { items: spts } = useSpt();
  const { items: pegawais } = usePegawai();
  const { items: notas } = useNotaDinas();
  const { items: reports } = useLaporan();
  const { items: spjs } = useKeuangan(reports);
  const [filters, setFilters] = useState<RekapFilters>({
    dari: "",
    sampai: "",
    pegawaiId: "",
    tujuan: "",
  });
  const [pdfOpen, setPdfOpen] = useState(false);
  const allRows = useMemo(
    () => buildRekap(sppds, pegawais, notas, spjs, spts),
    [sppds, pegawais, notas, spjs, spts],
  );
  const rows = useMemo(() => filterRekap(allRows, filters), [allRows, filters]);
  const chart = useMemo(() => chartRekap(rows), [rows]);
  const canRead = hasPermission("Rekapitulasi", "R");
  const canExport = hasPermission("Rekapitulasi", "E");
  if (!canRead)
    return (
      <Alert variant="error">
        Anda tidak memiliki izin melihat rekapitulasi.
      </Alert>
    );
  const totalDays = rows.reduce((sum, x) => sum + x.jumlahHari, 0);
  const totalCost = rows.reduce((sum, x) => sum + x.biaya, 0);
  const uniqueEmployees = new Set(rows.map((x) => x.pegawaiId)).size;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold">Rekapitulasi</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Ringkasan perjalanan dinas, hari perjalanan, anggaran, dan
            pembayaran berdasarkan transaksi.
          </p>
        </div>
        {canExport && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPdfOpen(true)}>
              <FileDown className="w-4 h-4" /> Export PDF
            </Button>
            <Button onClick={() => exportExcel(rows)}>
              <Download className="w-4 h-4" /> Export Excel
            </Button>
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Metric
          icon={<MapPinned />}
          label="Perjalanan/Personil"
          value={String(rows.length)}
        />
        <Metric
          icon={<Users />}
          label="Pegawai"
          value={String(uniqueEmployees)}
        />
        <Metric
          icon={<CalendarDays />}
          label="Total Hari"
          value={String(totalDays)}
        />
        <Metric
          icon={<Wallet />}
          label="Pembayaran Selesai"
          value={formatRupiah(totalCost)}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Filter Rekapitulasi</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="text-xs space-y-1">
            <span className="font-bold">Dari Tanggal</span>
            <Input
              type="date"
              value={filters.dari}
              onChange={(e) =>
                setFilters((x) => ({ ...x, dari: e.target.value }))
              }
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="font-bold">Sampai Tanggal</span>
            <Input
              type="date"
              value={filters.sampai}
              onChange={(e) =>
                setFilters((x) => ({ ...x, sampai: e.target.value }))
              }
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="font-bold">Pegawai</span>
            <Select
              value={filters.pegawaiId}
              onChange={(e) =>
                setFilters((x) => ({ ...x, pegawaiId: e.target.value }))
              }
            >
              <option value="">Semua Pegawai</option>
              {pegawais.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.nama}
                </option>
              ))}
            </Select>
          </label>
          <label className="text-xs space-y-1">
            <span className="font-bold">Tujuan</span>
            <Input
              value={filters.tujuan}
              onChange={(e) =>
                setFilters((x) => ({ ...x, tujuan: e.target.value }))
              }
              placeholder="Cari tujuan..."
            />
          </label>
        </CardContent>
      </Card>
      <div className="grid xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Perjalanan dan Hari per Bulan
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="perjalanan"
                  name="Perjalanan"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="hari"
                  name="Hari"
                  fill="var(--chart-2)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pembayaran per Bulan</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={10} />
                <YAxis
                  fontSize={10}
                  tickFormatter={(v) => `${Number(v) / 1000000}jt`}
                />
                <Tooltip formatter={(v) => formatRupiah(Number(v))} />
                <Bar
                  dataKey="biaya"
                  name="Pembayaran"
                  fill="var(--chart-3)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nomor SPPD</TableHead>
              <TableHead>Pegawai</TableHead>
              <TableHead>Tujuan</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-center">Hari</TableHead>
              <TableHead className="text-right">Biaya</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((x) => (
              <TableRow key={x.id}>
                <TableCell className="font-mono text-xs font-bold">
                  {x.nomorSppd}
                </TableCell>
                <TableCell>{x.namaPegawai}</TableCell>
                <TableCell>{x.tujuan}</TableCell>
                <TableCell>
                  {x.tanggalBerangkat} – {x.tanggalKembali}
                </TableCell>
                <TableCell className="text-center font-bold">
                  {x.jumlahHari}
                </TableCell>
                <TableCell className="text-right">
                  {formatRupiah(x.biaya)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      x.status === "Pembayaran Selesai" ? "success" : "info"
                    }
                  >
                    {x.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <RekapPrintPreview
        open={pdfOpen}
        rows={rows}
        onClose={() => setPdfOpen(false)}
      />
    </div>
  );
}
function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
          {icon}
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground">
            {label}
          </p>
          <p className="text-xl font-black mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
