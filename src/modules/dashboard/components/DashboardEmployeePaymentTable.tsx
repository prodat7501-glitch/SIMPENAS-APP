import { UsersRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardEmployeeSummary } from "../dashboard.types";

interface DashboardEmployeePaymentTableProps {
  items: DashboardEmployeeSummary[];
  year: string;
  personal?: boolean;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export function DashboardEmployeePaymentTable({
  items,
  year,
  personal = false,
}: DashboardEmployeePaymentTableProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-primary/10 p-2 text-primary">
          <UsersRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold text-foreground">
            {personal
              ? "Rekap Perjalanan dan Pembayaran Saya"
              : "Rekap Perjalanan dan Pembayaran Pegawai"}
          </h2>
          <p className="text-xs text-muted-foreground">
            {personal
              ? `Data akun aktif berdasarkan SPPD dan pembayaran selesai tahun ${year}.`
              : `Seluruh pegawai berdasarkan SPPD dan pembayaran selesai tahun ${year}.`}
          </p>
        </div>
      </div>

      <TableContainer>
        <Table className="min-w-[820px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-center">No Urut</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="w-56">NIP</TableHead>
              <TableHead className="w-40 text-right">
                Jumlah Hari SPPD
              </TableHead>
              <TableHead className="w-56 text-right">
                Jumlah Yang Dibayarkan
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length > 0 ? (
              items.map((item, index) => (
                <TableRow key={item.pegawaiId}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="font-bold">{item.nama}</TableCell>
                  <TableCell className="font-mono">{item.nip || "-"}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.jumlahHariSppd}
                  </TableCell>
                  <TableCell className="text-right font-bold tabular-nums text-success-hover">
                    {formatRupiah(item.jumlahDibayarkan)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-8 text-center text-muted-foreground"
                >
                  Akun ini belum terhubung dengan data Master Pegawai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </section>
  );
}
