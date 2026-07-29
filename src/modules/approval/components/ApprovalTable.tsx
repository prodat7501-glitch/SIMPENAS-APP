"use client";
import { Eye, Inbox, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatTableDate } from "@/lib/formatters";
import type { ApprovalItem } from "../approval.service";

export function ApprovalTable({
  items,
  search,
  onSearch,
  onDetail,
}: {
  items: ApprovalItem[];
  search: string;
  onSearch: (value: string) => void;
  onDetail: (item: ApprovalItem) => void;
}) {
  return (
    <div className="space-y-4">
      <Input
        className="max-w-sm"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Cari nomor, jenis, atau uraian dokumen..."
        leftIcon={<Search className="w-4 h-4" />}
      />
      {items.length === 0 ? (
        <EmptyState
          title="Tidak Ada Approval"
          description={
            search
              ? "Pencarian tidak menemukan dokumen."
              : "Tidak ada dokumen yang menunggu approval."
          }
          icon={<Inbox className="w-6 h-6" />}
        />
      ) : (
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jenis</TableHead>
                <TableHead>Nomor Dokumen</TableHead>
                <TableHead>Uraian</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Personil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={`${item.documentType}-${item.id}`}>
                  <TableCell>
                    <Badge variant="outline">{item.documentType}</Badge>
                  </TableCell>
                  <TableCell className="font-mono font-bold">
                    {item.nomor}
                  </TableCell>
                  <TableCell>
                    {item.documentType === "SPT"
                      ? (item.untuk[0]?.text ?? "-")
                      : item.perihal}
                  </TableCell>
                  <TableCell>
                    {item.documentType === "SPT" ? (
                      <>
                        {formatTableDate(item.tanggalMulai)} –{" "}
                        {formatTableDate(item.tanggalSelesai)}
                      </>
                    ) : (
                      formatTableDate(item.tanggal)
                    )}
                  </TableCell>
                  <TableCell>
                    {item.documentType === "SPT"
                      ? item.personil.length
                      : item.lampiran.length}
                  </TableCell>
                  <TableCell>
                    <Badge variant="warning">{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDetail(item)}
                      title={`Periksa ${item.documentType}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
