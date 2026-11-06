const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("id-ID");
const units = [
  "",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "delapan",
  "sembilan",
  "sepuluh",
  "sebelas",
];

const toWords = (value: number): string => {
  if (value < 12) return units[value];
  if (value < 20) return `${toWords(value - 10)} belas`;
  if (value < 100) {
    const puluh = Math.floor(value / 10);
    const sisa = value % 10;
    return `${toWords(puluh)} puluh${sisa ? ` ${toWords(sisa)}` : ""}`;
  }
  if (value < 200)
    return `seratus${value > 100 ? ` ${toWords(value - 100)}` : ""}`;
  if (value < 1000) {
    const ratus = Math.floor(value / 100);
    const sisa = value % 100;
    return `${toWords(ratus)} ratus${sisa ? ` ${toWords(sisa)}` : ""}`;
  }
  if (value < 2000)
    return `seribu${value > 1000 ? ` ${toWords(value - 1000)}` : ""}`;
  if (value < 1000000) {
    const ribu = Math.floor(value / 1000);
    const sisa = value % 1000;
    return `${toWords(ribu)} ribu${sisa ? ` ${toWords(sisa)}` : ""}`;
  }
  if (value < 1000000000) {
    const juta = Math.floor(value / 1000000);
    const sisa = value % 1000000;
    return `${toWords(juta)} juta${sisa ? ` ${toWords(sisa)}` : ""}`;
  }
  const miliar = Math.floor(value / 1000000000);
  const sisa = value % 1000000000;
  return `${toWords(miliar)} miliar${sisa ? ` ${toWords(sisa)}` : ""}`;
};

const capitalizeWords = (value: string) =>
  value.replace(/\b\w/g, (letter) => letter.toUpperCase());

export const formatRupiah = (value: number) => rupiahFormatter.format(value);
export const formatNumber = (value: number) => numberFormatter.format(value);
export const formatRupiahTerbilang = (value: number) =>
  `${capitalizeWords(toWords(Math.max(0, Math.floor(value))))} Rupiah`;

export const cleanDateString = (val: unknown): string => {
  if (!val) return "";
  const s = String(val).replace(/^["']+|["']+$/g, "").trim();
  if (!s) return "";
  if (s.includes("T")) {
    const d = new Date(s);
    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  const match = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (match) {
    const y = match[1];
    const m = match[2].padStart(2, "0");
    const d = match[3].padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return s;
};

export const formatTableDate = (
  value?: string | Date | null,
  fallback = "-",
) => {
  if (!value) return fallback;

  if (typeof value === "string") {
    const cleaned = cleanDateString(value);
    if (!cleaned) return fallback;

    const isoDate = cleaned.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoDate) return `${isoDate[3]}/${isoDate[2]}/${isoDate[1]}`;

    const dmyDate = cleaned.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyDate) {
      const d = dmyDate[1].padStart(2, "0");
      const m = dmyDate[2].padStart(2, "0");
      return `${d}/${m}/${dmyDate[3]}`;
    }

    return cleaned;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatTableDateTime = (
  value?: string | Date | null,
  fallback = "-",
) => {
  if (!value) return fallback;
  const cleaned =
    typeof value === "string"
      ? value.replace(/^["']+|["']+$/g, "").trim()
      : value;
  const date = cleaned instanceof Date ? cleaned : new Date(cleaned);
  if (Number.isNaN(date.getTime())) return formatTableDate(value, fallback);
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
  return `${formatTableDate(date, fallback)} ${time}`;
};
