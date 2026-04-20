import { NextResponse } from "next/server";

import { derivePaymentStatus, generateContractForPayment } from "@/lib/contracts";
import { createAdminClient } from "@/lib/supabase/admin";

interface PaymentWebhookPayload {
  paid_amount?: number;
  paidAmount?: number;
  payment_id?: string;
  paymentId?: string;
  provider?: string;
  status?: string;
}

function normalizeStatus(status: string | undefined, paidAmount: number, totalAmount: number) {
  if (status === "paid" || status === "success" || status === "succeeded") {
    return "paid" as const;
  }

  if (status === "pending" || status === "processing") {
    return derivePaymentStatus(totalAmount, paidAmount);
  }

  return derivePaymentStatus(totalAmount, paidAmount);
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as PaymentWebhookPayload | null;

  if (!payload?.payment_id && !payload?.paymentId) {
    return NextResponse.json(
      {
        ok: true,
        receivedAt: new Date().toISOString(),
        mode: "placeholder",
        message: "Платёжный вебхук принят. Для live-обновления передайте payment_id.",
        provider: payload?.provider ?? "unknown",
        payload,
      },
      { status: 202 },
    );
  }

  const supabase = createAdminClient();
  const paymentId = payload.payment_id ?? payload.paymentId ?? "";
  const { data: paymentRow, error: paymentError } = await supabase
    .from("payments")
    .select("id, pilgrim_id, total_amount, paid_amount, status, qr_code, contract_url")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !paymentRow) {
    return NextResponse.json(
      {
        ok: false,
        message: paymentError?.message ?? "Платёж не найден.",
        paymentId,
      },
      { status: 404 },
    );
  }

  const paidAmount = Number(payload.paid_amount ?? payload.paidAmount ?? paymentRow.paid_amount ?? 0);
  const totalAmount = Number(paymentRow.total_amount);
  const nextStatus = normalizeStatus(payload.status, paidAmount, totalAmount);

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      paid_amount: paidAmount,
      status: nextStatus,
    })
    .eq("id", paymentId);

  if (updateError) {
    return NextResponse.json(
      {
        ok: false,
        message: updateError.message,
        paymentId,
      },
      { status: 500 },
    );
  }

  let contract = null;

  if (nextStatus === "paid") {
    const updatedPayment = await generateContractForPayment(supabase, paymentId);
    contract = {
      contractUrl: updatedPayment.contract_url,
      qrCode: updatedPayment.qr_code,
      generatedAt: updatedPayment.contract_generated_at,
    };
  }

  return NextResponse.json(
    {
      ok: true,
      receivedAt: new Date().toISOString(),
      provider: payload.provider ?? "unknown",
      paymentId,
      status: nextStatus,
      paidAmount,
      contract,
    },
    { status: 202 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook endpoint is alive.",
    expectedPayload: {
      payment_id: "uuid",
      provider: "kaspi|halyk|test",
      paid_amount: 1550000,
      status: "paid",
    },
  });
}
