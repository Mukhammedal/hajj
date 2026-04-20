import type { PaymentStatus } from "@/types/domain";
import type { SheetRow } from "@/lib/google-sheets";

export type SheetCanonicalField =
  | "flight_date"
  | "full_name"
  | "group_name"
  | "iin"
  | "payment_amount"
  | "payment_status"
  | "phone";

export interface NormalizedSheetRow {
  flight_date: string | null;
  full_name: string;
  group_name: string;
  iin: string;
  payment_amount: number | null;
  payment_status: PaymentStatus | null;
  phone: string;
  raw: SheetRow;
}

const COLUMN_ALIASES: Record<SheetCanonicalField, string[]> = {
  full_name: ["фио", "имя", "full_name"],
  phone: ["телефон", "phone", "тел"],
  iin: ["иин", "iin"],
  payment_amount: ["сумма", "amount", "оплата"],
  payment_status: ["статус оплаты", "статус", "status"],
  group_name: ["группа", "group", "рейс"],
  flight_date: ["дата вылета", "flight date"],
};

const PAYMENT_STATUS_MAP: Record<string, PaymentStatus> = {
  paid: "paid",
  partial: "partial",
  pending: "pending",
  "не оплачено": "pending",
  оплачено: "paid",
  частично: "partial",
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeValue(value: string) {
  return value.trim();
}

function parseAmount(value: string) {
  const normalized = value
    .replace(/[₸\s]/g, "")
    .replace(/,/g, ".")
    .replace(/[^\d.-]/g, "");

  if (!normalized) {
    return null;
  }

  const numeric = Number(normalized);
  return Number.isFinite(numeric) ? numeric : null;
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function parseFlightDate(value: string) {
  const input = value.trim();

  if (!input) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const dotMatch = input.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);

  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return `${year}-${pad(Number(month))}-${pad(Number(day))}`;
  }

  const parsed = new Date(input);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return `${parsed.getUTCFullYear()}-${pad(parsed.getUTCMonth() + 1)}-${pad(parsed.getUTCDate())}`;
}

function mapPaymentStatus(value: string): PaymentStatus | null {
  const normalized = normalizeHeader(value);
  return PAYMENT_STATUS_MAP[normalized] ?? null;
}

export function detectColumnMapping(headers: string[]) {
  const availableHeaders = new Map(headers.map((header) => [normalizeHeader(header), header]));

  return Object.entries(COLUMN_ALIASES).reduce<Partial<Record<SheetCanonicalField, string>>>((mapping, [canonical, aliases]) => {
    const resolved = aliases.find((alias) => availableHeaders.has(normalizeHeader(alias)));

    if (resolved) {
      mapping[canonical as SheetCanonicalField] = availableHeaders.get(normalizeHeader(resolved)) ?? resolved;
    }

    return mapping;
  }, {});
}

export function detectMappedColumns(headers: string[]) {
  return Object.keys(detectColumnMapping(headers)) as SheetCanonicalField[];
}

export function mapSheetRow(
  row: SheetRow,
  mapping: Partial<Record<SheetCanonicalField, string>>,
): NormalizedSheetRow {
  const readValue = (field: SheetCanonicalField) => normalizeValue(mapping[field] ? row[mapping[field] as string] ?? "" : "");

  return {
    full_name: readValue("full_name"),
    phone: readValue("phone"),
    iin: readValue("iin").replace(/\s+/g, ""),
    payment_amount: parseAmount(readValue("payment_amount")),
    payment_status: mapPaymentStatus(readValue("payment_status")),
    group_name: readValue("group_name"),
    flight_date: parseFlightDate(readValue("flight_date")),
    raw: row,
  };
}

export function mapSheetRows(rows: SheetRow[]) {
  const headers = rows[0] ? Object.keys(rows[0]) : [];
  const mapping = detectColumnMapping(headers);

  return {
    columnsDetected: Object.keys(mapping) as SheetCanonicalField[],
    mapping,
    rows: rows.map((row) => mapSheetRow(row, mapping)),
  };
}
