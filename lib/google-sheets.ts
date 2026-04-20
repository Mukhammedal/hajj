import "server-only";

import { google } from "googleapis";

export type SheetRow = Record<string, string>;

export interface SheetSnapshot {
  headers: string[];
  rows: SheetRow[];
  sheetId: string;
  sheetName: string;
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n");
}

function sanitizeHeader(value: string, index: number) {
  const header = value.trim();
  return header || `column_${index + 1}`;
}

function getServiceAccountConfig() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!clientEmail || !privateKey) {
    return null;
  }

  return {
    clientEmail,
    privateKey: normalizePrivateKey(privateKey),
  };
}

async function createSheetsClient() {
  const config = getServiceAccountConfig();

  if (!config) {
    throw new Error("Google Sheets service account env vars are missing.");
  }

  const auth = new google.auth.JWT({
    email: config.clientEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  await auth.authorize();

  return google.sheets({
    version: "v4",
    auth,
  });
}

export function extractSheetIdFromUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const directMatch = trimmed.match(/^[a-zA-Z0-9-_]{20,}$/);

  if (directMatch) {
    return directMatch[0];
  }

  const urlMatch = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);

  return urlMatch?.[1] ?? null;
}

export async function fetchSheetSnapshot(sheetId: string): Promise<SheetSnapshot> {
  try {
    const sheets = await createSheetsClient();
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
      fields: "properties.title,sheets.properties.title",
    });
    const firstTabTitle = metadata.data.sheets?.[0]?.properties?.title;
    const spreadsheetTitle = metadata.data.properties?.title ?? firstTabTitle ?? "";

    if (!firstTabTitle) {
      return {
        sheetId,
        sheetName: spreadsheetTitle,
        headers: [],
        rows: [],
      };
    }

    const valuesResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `'${firstTabTitle.replace(/'/g, "''")}'`,
    });
    const matrix = valuesResponse.data.values ?? [];
    const headers = (matrix[0] ?? []).map((header, index) => sanitizeHeader(String(header ?? ""), index));
    const rows = matrix.slice(1).reduce<SheetRow[]>((accumulator, row) => {
      const entry = headers.reduce<SheetRow>((result, header, index) => {
        result[header] = String(row[index] ?? "").trim();
        return result;
      }, {});
      const hasContent = Object.values(entry).some((value) => value !== "");

      if (hasContent) {
        accumulator.push(entry);
      }

      return accumulator;
    }, []);

    return {
      sheetId,
      sheetName: spreadsheetTitle,
      headers,
      rows,
    };
  } catch (error) {
    console.error("Failed to read Google Sheet", error);

    return {
      sheetId,
      sheetName: "",
      headers: [],
      rows: [],
    };
  }
}

export async function fetchSheetData(sheetId: string) {
  const snapshot = await fetchSheetSnapshot(sheetId);
  return snapshot.rows;
}
