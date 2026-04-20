import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { isStorageObjectPath } from "@/lib/documents";
import type { PaymentRecord } from "@/types/domain";

type PaymentContractRow = {
  contract_generated_at: string | null;
  contract_url: string | null;
  created_at: string;
  id: string;
  operator_id: string;
  paid_amount: number | string;
  payment_method: PaymentRecord["paymentMethod"];
  pilgrim_id: string;
  qr_code: string | null;
  status: PaymentRecord["status"];
  total_amount: number | string;
};

type PilgrimContractRow = {
  full_name: string;
  id: string;
  iin: string;
  phone: string | null;
};

type OperatorContractRow = {
  company_name: string;
  id: string;
  license_number: string;
  phone: string | null;
};

const cyrillicToLatinMap: Record<string, string> = {
  А: "A",
  а: "a",
  Ә: "A",
  ә: "a",
  Б: "B",
  б: "b",
  В: "V",
  в: "v",
  Г: "G",
  г: "g",
  Ғ: "G",
  ғ: "g",
  Д: "D",
  д: "d",
  Е: "E",
  е: "e",
  Ё: "E",
  ё: "e",
  Ж: "Zh",
  ж: "zh",
  З: "Z",
  з: "z",
  И: "I",
  и: "i",
  Й: "I",
  й: "i",
  К: "K",
  к: "k",
  Қ: "Q",
  қ: "q",
  Л: "L",
  л: "l",
  М: "M",
  м: "m",
  Н: "N",
  н: "n",
  Ң: "Ng",
  ң: "ng",
  О: "O",
  о: "o",
  Ө: "O",
  ө: "o",
  П: "P",
  п: "p",
  Р: "R",
  р: "r",
  С: "S",
  с: "s",
  Т: "T",
  т: "t",
  У: "U",
  у: "u",
  Ұ: "U",
  ұ: "u",
  Ү: "U",
  ү: "u",
  Ф: "F",
  ф: "f",
  Х: "Kh",
  х: "kh",
  Һ: "H",
  һ: "h",
  Ц: "Ts",
  ц: "ts",
  Ч: "Ch",
  ч: "ch",
  Ш: "Sh",
  ш: "sh",
  Щ: "Sch",
  щ: "sch",
  Ъ: "",
  ъ: "",
  Ы: "Y",
  ы: "y",
  І: "I",
  і: "i",
  Ь: "",
  ь: "",
  Э: "E",
  э: "e",
  Ю: "Yu",
  ю: "yu",
  Я: "Ya",
  я: "ya",
};

function transliterateToAscii(input: string) {
  return [...input].map((char) => cyrillicToLatinMap[char] ?? char).join("");
}

function pdfSafeText(input: string) {
  return transliterateToAscii(input)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, "?");
}

function buildSimplePdf(lines: string[]) {
  const stream = [
    "BT",
    "/F1 18 Tf",
    "50 780 Td",
    ...lines.flatMap((line, index) => [index === 0 ? `(${pdfSafeText(line)}) Tj` : `0 -24 Td (${pdfSafeText(line)}) Tj`]),
    "ET",
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const startXref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

function buildContractHash(payment: PaymentContractRow) {
  const digest = createHash("sha256")
    .update(`${payment.id}:${payment.pilgrim_id}:${payment.total_amount}:${payment.created_at}`)
    .digest("hex");

  return `HJ-${digest.slice(0, 20).toUpperCase()}`;
}

export function derivePaymentStatus(totalAmount: number, paidAmount: number): PaymentRecord["status"] {
  if (paidAmount <= 0) {
    return "pending";
  }

  if (paidAmount >= totalAmount) {
    return "paid";
  }

  return "partial";
}

export async function resolveSignedContractUrl(supabase: SupabaseClient, contractUrl: string | null) {
  if (!contractUrl || !isStorageObjectPath(contractUrl)) {
    return contractUrl;
  }

  const { data, error } = await supabase.storage.from("documents").createSignedUrl(contractUrl, 60 * 60);
  return error || !data?.signedUrl ? contractUrl : data.signedUrl;
}

export async function generateContractForPayment(supabase: SupabaseClient, paymentId: string) {
  const { data: paymentRow, error: paymentError } = await supabase.from("payments").select("*").eq("id", paymentId).maybeSingle();

  if (paymentError || !paymentRow) {
    throw new Error(paymentError?.message ?? "Платёж не найден.");
  }

  const payment = paymentRow as PaymentContractRow;

  if (payment.status !== "paid") {
    throw new Error("Договор можно генерировать только для полностью оплаченного платежа.");
  }

  const [{ data: pilgrimRow, error: pilgrimError }, { data: operatorRow, error: operatorError }] = await Promise.all([
    supabase.from("pilgrim_profiles").select("id, full_name, iin, phone").eq("id", payment.pilgrim_id).maybeSingle(),
    supabase.from("operators").select("id, company_name, license_number, phone").eq("id", payment.operator_id).maybeSingle(),
  ]);

  if (pilgrimError || !pilgrimRow) {
    throw new Error(pilgrimError?.message ?? "Паломник для договора не найден.");
  }

  if (operatorError || !operatorRow) {
    throw new Error(operatorError?.message ?? "Оператор для договора не найден.");
  }

  const pilgrim = pilgrimRow as PilgrimContractRow;
  const operator = operatorRow as OperatorContractRow;
  const qrHash = payment.qr_code ?? buildContractHash(payment);
  const filePath = `${payment.pilgrim_id}/contracts/${qrHash}.pdf`;
  const pdfBytes = buildSimplePdf([
    "HajjCRM Contract",
    `Contract ID: ${payment.id}`,
    `Operator: ${operator.company_name}`,
    `License: ${operator.license_number}`,
    `Pilgrim: ${pilgrim.full_name}`,
    `IIN: ${pilgrim.iin}`,
    `Phone: ${pilgrim.phone ?? "-"}`,
    `Amount KZT: ${Number(payment.total_amount)}`,
    `Paid KZT: ${Number(payment.paid_amount)}`,
    `Method: ${payment.payment_method}`,
    `Status: ${payment.status}`,
    `QR: ${qrHash}`,
    `Issued at: ${new Date().toISOString()}`,
  ]);

  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const contractGeneratedAt = new Date().toISOString();
  const { data: updatedPayment, error: updateError } = await supabase
    .from("payments")
    .update({
      contract_url: filePath,
      qr_code: qrHash,
      contract_generated_at: contractGeneratedAt,
    })
    .eq("id", payment.id)
    .select("*")
    .maybeSingle();

  if (updateError || !updatedPayment) {
    throw new Error(updateError?.message ?? "Не удалось сохранить договор.");
  }

  return updatedPayment as PaymentContractRow;
}

export function buildInstallmentSchedule(payment: PaymentRecord) {
  if (!payment.installmentPlan || !payment.installmentMonths || payment.installmentMonths < 1) {
    return [
      {
        label: "Единый платёж",
        amount: payment.totalAmount,
        status: payment.status === "paid" ? "paid" : payment.status === "partial" ? "partial" : "pending",
      },
    ] as const;
  }

  const months = payment.installmentMonths;
  const baseAmount = Math.floor(payment.totalAmount / months);
  const remainder = payment.totalAmount - baseAmount * months;
  let paidRemaining = payment.paidAmount;

  return Array.from({ length: months }, (_, index) => {
    const amount = baseAmount + (index === months - 1 ? remainder : 0);
    const dueDate = new Date(payment.createdAt);
    dueDate.setMonth(dueDate.getMonth() + index);

    let status: "paid" | "partial" | "pending" = "pending";

    if (paidRemaining >= amount) {
      status = "paid";
      paidRemaining -= amount;
    } else if (paidRemaining > 0) {
      status = "partial";
      paidRemaining = 0;
    }

    return {
      label: dueDate,
      amount,
      status,
    };
  });
}
