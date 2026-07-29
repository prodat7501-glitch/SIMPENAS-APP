export interface RekapRow {
  id: string;
  sppdId: string;
  nomorSppd: string;
  pegawaiId: string;
  namaPegawai: string;
  tujuan: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  jumlahHari: number;
  biaya: number;
  status: string;
  bulan: string;
  bulanPembayaran: string;
}
export interface RekapFilters {
  dari: string;
  sampai: string;
  pegawaiId: string;
  tujuan: string;
}
export interface ChartPoint {
  label: string;
  perjalanan: number;
  hari: number;
  biaya: number;
}
