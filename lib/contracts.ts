import { createHash } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import { buildContractPdf, type ContractData } from "@/lib/contracts/generate-pdf";
import { isStorageObjectPath } from "@/lib/documents";
import type { PaymentRecord } from "@/types/domain";

/**
 * Интеграционный слой поверх buildContractPdf.
 * Достаёт всё нужное из БД, формирует ContractData, сохраняет PDF в Storage,
 * апдейтит payments.contract_url + qr_code + contract_generated_at.
 */

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
  date_of_birth: string | null;
  full_name: string;
  id: string;
  iin: string;
  phone: string | null;
};

type OperatorContractRow = {
  address: string | null;
  bank_bic: string | null;
  bank_bin: string | null;
  bank_iik: string | null;
  bank_kbe: string | null;
  bank_name: string | null;
  company_name: string;
  id: string;
  license_number: string;
  phone: string | null;
};

type GroupContractRow = {
  departure_city: string;
  flight_date: string;
  hotel_mecca: string | null;
  hotel_medina: string | null;
  return_date: string;
};

function buildContractHash(payment: PaymentContractRow) {
  const digest = createHash("sha256")
    .update(`${payment.id}:${payment.pilgrim_id}:${payment.total_amount}:${payment.created_at}`)
    .digest("hex");

  return `HJ-${digest.slice(0, 20).toUpperCase()}`;
}

export function derivePaymentStatus(totalAmount: number, paidAmount: number): PaymentRecord["status"] {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= totalAmount) return "paid";
  return "partial";
}

export async function resolveSignedContractUrl(supabase: SupabaseClient, contractUrl: string | null) {
  if (!contractUrl || !isStorageObjectPath(contractUrl)) {
    return contractUrl;
  }

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(contractUrl, 60 * 60);
  return error || !data?.signedUrl ? contractUrl : data.signedUrl;
}

export async function generateContractForPayment(supabase: SupabaseClient, paymentId: string) {
  const { data: paymentRow, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !paymentRow) {
    throw new Error(paymentError?.message ?? "Платёж не найден.");
  }

  const payment = paymentRow as PaymentContractRow;

  if (payment.status !== "paid") {
    throw new Error("Договор можно генерировать только для полностью оплаченного платежа.");
  }

  const [{ data: pilgrimRow }, { data: operatorRow }] = await Promise.all([
    supabase
      .from("pilgrim_profiles")
      .select("id, full_name, iin, phone, date_of_birth")
      .eq("id", payment.pilgrim_id)
      .maybeSingle(),
    supabase
      .from("operators")
      .select(
        "id, company_name, license_number, phone, address, bank_bin, bank_iik, bank_bic, bank_kbe, bank_name",
      )
      .eq("id", payment.operator_id)
      .maybeSingle(),
  ]);

  if (!pilgrimRow) throw new Error("Паломник для договора не найден.");
  if (!operatorRow) throw new Error("Оператор для договора не найден.");

  const pilgrim = pilgrimRow as PilgrimContractRow;
  const operator = operatorRow as OperatorContractRow;

  const { data: groupLink } = await supabase
    .from("pilgrim_groups")
    .select("group_id")
    .eq("pilgrim_id", payment.pilgrim_id)
    .order("joined_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let trip: ContractData["trip"] | undefined;
  if (groupLink?.group_id) {
    const { data: groupRow } = await supabase
      .from("groups")
      .select("flight_date, return_date, hotel_mecca, hotel_medina, departure_city")
      .eq("id", groupLink.group_id)
      .maybeSingle();

    if (groupRow) {
      const g = groupRow as GroupContractRow;
      trip = {
        flightDate: g.flight_date,
        returnDate: g.return_date,
        hotelMecca: g.hotel_mecca,
        hotelMedina: g.hotel_medina,
        departureCity: g.departure_city,
      };
    }
  }

  const qrHash = payment.qr_code ?? buildContractHash(payment);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hajj-drab.vercel.app";
  const verificationUrl = `${baseUrl}/verify/${qrHash}`;
  const filePath = `${payment.pilgrim_id}/contracts/${qrHash}.pdf`;

  const pdfBytes = await buildContractPdf({
    contractId: payment.id.slice(0, 8).toUpperCase(),
    qrCode: qrHash,
    verificationUrl,
    operator: {
      companyName: operator.company_name,
      licenseNumber: operator.license_number,
      phone: operator.phone,
      address: operator.address,
      bankDetails: {
        bin: operator.bank_bin ?? undefined,
        iik: operator.bank_iik ?? undefined,
        bic: operator.bank_bic ?? undefined,
        kbe: operator.bank_kbe ?? undefined,
        bankName: operator.bank_name ?? undefined,
      },
    },
    pilgrim: {
      fullName: pilgrim.full_name,
      iin: pilgrim.iin,
      phone: pilgrim.phone,
      dateOfBirth: pilgrim.date_of_birth,
    },
    payment: {
      totalAmount: Number(payment.total_amount),
      paidAmount: Number(payment.paid_amount),
      method: payment.payment_method,
      status: payment.status,
    },
    trip,
    issuedAt: new Date().toISOString(),
  });

  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) throw new Error(uploadError.message);

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
        status:
          payment.status === "paid"
            ? "paid"
            : payment.status === "partial"
              ? "partial"
              : "pending",
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

    return { label: dueDate, amount, status };
  });
}
