type FinancialDocumentDescriptionInput = {
  paymentItems?: string;
  purpose?: string;
  destination?: string;
  durationDays?: number;
  departureDate?: string;
  returnDate?: string;
  sptNumber?: string;
  sptDate?: string;
  sppdNumber?: string;
  sppdDate?: string;
};

const normalizeSpaces = (value?: string) =>
  (value ?? "").trim().replace(/\s+/g, " ");

const normalizeForComparison = (value?: string) =>
  normalizeSpaces(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const withoutTrailingPunctuation = (value: string) =>
  value.replace(/[.,;:\s]+$/g, "");

const removeExistingPaymentPrefix = (value: string) =>
  value.replace(
    /^bayar\s+.+?\s+perjalanan\s+dinas\s+dalam\s+rangka\s+/i,
    "",
  );

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return normalizeSpaces(value);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatDateAnchor = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
  }).format(date);
};

const formatDateRange = (departureDate?: string, returnDate?: string) => {
  const departure = formatDate(departureDate);
  const arrival = formatDate(returnDate);

  if (!departure) return arrival;
  if (!arrival || departure === arrival) return departure;
  return `${departure} s.d. ${arrival}`;
};

const alreadyContainsDestination = (purpose: string, destination?: string) => {
  const normalizedDestination = normalizeForComparison(destination);
  return (
    normalizedDestination.length > 0 &&
    normalizeForComparison(purpose).includes(normalizedDestination)
  );
};

const alreadyContainsDuration = (purpose: string, durationDays?: number) => {
  const normalizedPurpose = normalizeForComparison(purpose);
  if (normalizedPurpose.includes("selama")) return true;
  if (!durationDays || durationDays < 1) return false;

  return new RegExp(`\\b${durationDays}\\b(?:\\s+[a-z]+)?\\s+hari\\b`).test(
    normalizedPurpose,
  );
};

const alreadyContainsTravelDate = (
  purpose: string,
  departureDate?: string,
  returnDate?: string,
) => {
  const normalizedPurpose = normalizeForComparison(purpose);
  if (normalizedPurpose.includes("tanggal")) return true;

  return [departureDate, returnDate]
    .map(formatDateAnchor)
    .map(normalizeForComparison)
    .filter(Boolean)
    .some((dateAnchor) => normalizedPurpose.includes(dateAnchor));
};

const buildReference = (
  label: "SPT" | "SPD",
  number?: string,
  date?: string,
) => {
  const normalizedNumber = normalizeSpaces(number);
  if (!normalizedNumber) return "";
  const formattedDate = formatDate(date);
  return `${label} Nomor ${normalizedNumber}${formattedDate ? `, tanggal ${formattedDate}` : ""}`;
};

export const buildFinancialDocumentDescription = ({
  paymentItems = "Biaya",
  purpose,
  destination,
  durationDays,
  departureDate,
  returnDate,
  sptNumber,
  sptDate,
  sppdNumber,
  sppdDate,
}: FinancialDocumentDescriptionInput) => {
  const cleanPurpose = withoutTrailingPunctuation(
    removeExistingPaymentPrefix(
      normalizeSpaces(purpose) ||
        "melaksanakan perjalanan dinas sesuai dokumen pertanggungjawaban",
    ),
  );
  const context: string[] = [];

  if (
    normalizeSpaces(destination) &&
    !alreadyContainsDestination(cleanPurpose, destination)
  ) {
    context.push(`di ${normalizeSpaces(destination)}`);
  }
  if (
    durationDays &&
    durationDays > 0 &&
    !alreadyContainsDuration(cleanPurpose, durationDays)
  ) {
    context.push(`selama ${durationDays} hari`);
  }
  if (
    (departureDate || returnDate) &&
    !alreadyContainsTravelDate(cleanPurpose, departureDate, returnDate)
  ) {
    context.push(`pada tanggal ${formatDateRange(departureDate, returnDate)}`);
  }

  const narrative = `${normalizeSpaces(paymentItems)} Perjalanan dinas dalam rangka ${cleanPurpose}${context.length ? ` ${context.join(" ")}` : ""}`;
  const references: string[] = [];
  const normalizedNarrative = normalizeForComparison(narrative);
  const sptReference = buildReference("SPT", sptNumber, sptDate);
  const sppdReference = buildReference(
    "SPD",
    sppdNumber,
    sppdDate ?? departureDate,
  );

  if (
    sptReference &&
    !normalizedNarrative.includes(normalizeForComparison(sptNumber))
  ) {
    references.push(`Sesuai dengan ${sptReference}`);
  }
  if (
    sppdReference &&
    !normalizedNarrative.includes(normalizeForComparison(sppdNumber))
  ) {
    references.push(
      references.length > 0
        ? `dan ${sppdReference}`
        : `Sesuai dengan ${sppdReference}`,
    );
  }

  return `Bayar ${narrative}.${references.length ? ` ${references.join(" ")}.` : ""}`;
};

