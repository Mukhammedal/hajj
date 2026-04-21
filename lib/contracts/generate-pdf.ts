import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";

export interface ContractData {
  contractId: string;
  qrCode: string;
  verificationUrl: string;
  operator: {
    companyName: string;
    licenseNumber: string;
    phone: string | null;
    address: string | null;
    bankDetails?: {
      iik?: string;
      bic?: string;
      bin?: string;
      kbe?: string;
      bankName?: string;
    };
  };
  pilgrim: {
    fullName: string;
    iin: string;
    phone: string | null;
    dateOfBirth: string | null;
  };
  payment: {
    totalAmount: number;
    paidAmount: number;
    method: "kaspi" | "halyk" | "cash" | "transfer";
    status: "pending" | "partial" | "paid";
  };
  trip?: {
    flightDate: string;
    returnDate: string;
    hotelMecca: string | null;
    hotelMedina: string | null;
    departureCity: string;
  };
  issuedAt: string;
}

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 50;

function formatKzt(amount: number): string {
  return (
    new Intl.NumberFormat("ru-KZ", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount) + " ₸"
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
    .format(date)
    .replace(/\s*г\.?$/, "");
}

function paymentMethodLabel(method: ContractData["payment"]["method"]): string {
  switch (method) {
    case "kaspi":
      return "Kaspi";
    case "halyk":
      return "Halyk Bank";
    case "cash":
      return "Наличные";
    case "transfer":
      return "Банковский перевод";
  }
}

async function loadFont(filename: string): Promise<Uint8Array> {
  const path = join(process.cwd(), "public", "fonts", filename);
  const buffer = await readFile(path);
  return new Uint8Array(buffer);
}

export async function buildContractPdf(data: ContractData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  let fontRegular;
  let fontBold;
  try {
    const [regularBytes, boldBytes] = await Promise.all([
      loadFont("NotoSans-Regular.ttf"),
      loadFont("NotoSans-Bold.ttf"),
    ]);
    fontRegular = await pdf.embedFont(regularBytes, { subset: true });
    fontBold = await pdf.embedFont(boldBytes, { subset: true });
  } catch (error) {
    console.warn(
      "[contracts] NotoSans шрифт не найден. Положите public/fonts/NotoSans-Regular.ttf и NotoSans-Bold.ttf. Fallback на Helvetica (кириллица не будет отображаться корректно).",
      error,
    );
    fontRegular = await pdf.embedFont(StandardFonts.Helvetica);
    fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  }

  const page = pdf.addPage([A4_WIDTH, A4_HEIGHT]);
  let cursorY = A4_HEIGHT - MARGIN;

  const drawText = (
    text: string,
    opts: { size?: number; bold?: boolean; x?: number; color?: [number, number, number] } = {},
  ) => {
    const size = opts.size ?? 11;
    const font = opts.bold ? fontBold : fontRegular;
    const color = opts.color ? rgb(...opts.color) : rgb(0.1, 0.1, 0.12);
    page.drawText(text, {
      x: opts.x ?? MARGIN,
      y: cursorY,
      size,
      font,
      color,
    });
    cursorY -= size + 4;
  };

  const drawLine = (offset = 8) => {
    cursorY -= offset;
    page.drawLine({
      start: { x: MARGIN, y: cursorY },
      end: { x: A4_WIDTH - MARGIN, y: cursorY },
      thickness: 0.5,
      color: rgb(0.7, 0.7, 0.75),
    });
    cursorY -= offset;
  };

  const spacer = (n = 6) => {
    cursorY -= n;
  };

  drawText("ДОГОВОР ОКАЗАНИЯ УСЛУГ", { size: 16, bold: true });
  drawText("по организации поездки для совершения обрядов Хаджа / Умры", { size: 10 });
  spacer(4);
  drawText(`№ ${data.contractId}`, { size: 10 });
  drawText(`Дата выпуска: ${formatDate(data.issuedAt)}`, { size: 10 });
  drawLine(10);

  drawText("ИСПОЛНИТЕЛЬ", { size: 12, bold: true });
  drawText(data.operator.companyName, { size: 11, bold: true });
  drawText(`Лицензия: ${data.operator.licenseNumber}`);
  if (data.operator.phone) drawText(`Телефон: ${data.operator.phone}`);
  if (data.operator.address) drawText(`Адрес: ${data.operator.address}`);
  if (data.operator.bankDetails?.bin) drawText(`БИН: ${data.operator.bankDetails.bin}`);
  if (data.operator.bankDetails?.iik) drawText(`ИИК: ${data.operator.bankDetails.iik}`);
  if (data.operator.bankDetails?.bic) drawText(`БИК: ${data.operator.bankDetails.bic}`);
  if (data.operator.bankDetails?.bankName)
    drawText(`Банк: ${data.operator.bankDetails.bankName}`);
  drawLine(10);

  drawText("ЗАКАЗЧИК (паломник)", { size: 12, bold: true });
  drawText(data.pilgrim.fullName, { size: 11, bold: true });
  drawText(`ИИН: ${data.pilgrim.iin}`);
  if (data.pilgrim.dateOfBirth) drawText(`Дата рождения: ${formatDate(data.pilgrim.dateOfBirth)}`);
  if (data.pilgrim.phone) drawText(`Телефон: ${data.pilgrim.phone}`);
  drawLine(10);

  if (data.trip) {
    drawText("ПАРАМЕТРЫ ПОЕЗДКИ", { size: 12, bold: true });
    drawText(`Дата вылета: ${formatDate(data.trip.flightDate)}`);
    drawText(`Дата возврата: ${formatDate(data.trip.returnDate)}`);
    drawText(`Город вылета: ${data.trip.departureCity}`);
    if (data.trip.hotelMecca) drawText(`Отель в Мекке: ${data.trip.hotelMecca}`);
    if (data.trip.hotelMedina) drawText(`Отель в Медине: ${data.trip.hotelMedina}`);
    drawLine(10);
  }

  drawText("СТОИМОСТЬ И ОПЛАТА", { size: 12, bold: true });
  drawText(`Общая сумма: ${formatKzt(data.payment.totalAmount)}`, { bold: true });
  drawText(`Оплачено: ${formatKzt(data.payment.paidAmount)}`);
  drawText(`Метод оплаты: ${paymentMethodLabel(data.payment.method)}`);
  drawText(
    `Статус: ${
      data.payment.status === "paid"
        ? "полностью оплачено"
        : data.payment.status === "partial"
          ? "частично оплачено"
          : "не оплачено"
    }`,
  );
  drawLine(10);

  drawText("ПРОВЕРКА ПОДЛИННОСТИ", { size: 12, bold: true });
  drawText(`Код: ${data.qrCode}`, { size: 10 });
  drawText(`Ссылка: ${data.verificationUrl}`, { size: 10 });

  const qrPngBuffer = await QRCode.toBuffer(data.verificationUrl, {
    type: "png",
    width: 160,
    margin: 1,
    errorCorrectionLevel: "M",
  });
  const qrImage = await pdf.embedPng(qrPngBuffer);
  const qrDims = qrImage.scale(0.7);

  page.drawImage(qrImage, {
    x: A4_WIDTH - MARGIN - qrDims.width,
    y: cursorY - 10,
    width: qrDims.width,
    height: qrDims.height,
  });

  cursorY -= Math.max(qrDims.height + 10, 20);
  drawLine(10);

  drawText("ПОДПИСИ СТОРОН", { size: 12, bold: true });
  spacer(20);

  const sigY = cursorY;
  page.drawText("_____________________", { x: MARGIN, y: sigY, size: 10, font: fontRegular });
  page.drawText("Исполнитель", {
    x: MARGIN,
    y: sigY - 12,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(data.operator.companyName, { x: MARGIN, y: sigY - 24, size: 9, font: fontRegular });

  page.drawText("_____________________", {
    x: A4_WIDTH / 2 + 20,
    y: sigY,
    size: 10,
    font: fontRegular,
  });
  page.drawText("Заказчик", {
    x: A4_WIDTH / 2 + 20,
    y: sigY - 12,
    size: 9,
    font: fontRegular,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText(data.pilgrim.fullName, {
    x: A4_WIDTH / 2 + 20,
    y: sigY - 24,
    size: 9,
    font: fontRegular,
  });

  cursorY -= 50;

  page.drawText(
    "Настоящий договор является электронным документом. Подлинность проверяется по QR-коду.",
    {
      x: MARGIN,
      y: MARGIN / 2,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.5, 0.55),
    },
  );

  return await pdf.save();
}
