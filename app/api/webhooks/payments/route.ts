import { NextResponse } from "next/server";

import { derivePaymentStatus, generateContractForPayment } from "@/lib/contracts";
import { logAudit } from "@/lib/audit/log";
import { createAdminClient } from "@/lib/supabase/admin";
import { readRawBody, verifyWebhookSignature } from "@/lib/webhooks/verify-signature";

interface PaymentWebhookPayload {
  paid_amount?: number;
  paidAmount?: number;
  payment_id?: string;
  paymentId?: string;
  provider?: "kaspi" | "halyk" | "test" | string;
  status?: string;
}

const PROVIDER_SECRETS: Record<string, string | undefined> = {
  kaspi: process.env.KASPI_WEBHOOK_SECRET,
  halyk: process.env.HALYK_WEBHOOK_SECRET,
  test: process.env.TEST_WEBHOOK_SECRET,
};

const PROVIDER_SIGNATURE_HEADERS: Record<string, string> = {
  kaspi: "x-kaspi-signature",
  halyk: "x-halyk-signature",
  test: "x-signature",
};

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
  const rawBody = await readRawBody(request);

  let payload: PaymentWebhookPayload | null = null;
  try {
    payload = rawBody ? (JSON.parse(rawBody) as PaymentWebhookPayload) : null;
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON." }, { status: 400 });
  }

  const provider = (payload?.provider ?? "").toLowerCase();

  if (!provider || !PROVIDER_SECRETS[provider]) {
    return NextResponse.json(
      { ok: false, error: "Unknown or unsupported payment provider." },
      { status: 400 },
    );
  }

  const signatureHeaderName = PROVIDER_SIGNATURE_HEADERS[provider] ?? "x-signature";
  const signature = request.headers.get(signatureHeaderName);

  const verification = verifyWebhookSignature(rawBody, signature, PROVIDER_SECRETS[provider]);
  if (!verification.ok) {
    console.warn("[webhook][payments] signature check failed", {
      provider,
      reason: verification.reason,
      ip: request.headers.get("x-forwarded-for"),
    });
    return NextResponse.json(
      { ok: false, error: "Signature verification failed." },
      { status: 401 },
    );
  }

  const paymentId = payload?.payment_id ?? payload?.paymentId ?? "";
  if (!paymentId) {
    return NextResponse.json({ ok: false, error: "payment_id обязателен." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: paymentRow, error: paymentError } = await supabase
    .from("payments")
    .select("id, pilgrim_id, operator_id, total_amount, paid_amount, status, qr_code, contract_url")
    .eq("id", paymentId)
    .maybeSingle();

  if (paymentError || !paymentRow) {
    return NextResponse.json(
      { ok: false, error: paymentError?.message ?? "Платёж не найден.", paymentId },
      { status: 404 },
    );
  }

  const paidAmount = Number(payload?.paid_amount ?? payload?.paidAmount ?? paymentRow.paid_amount ?? 0);
  const totalAmount = Number(paymentRow.total_amount);
  const nextStatus = normalizeStatus(payload?.status, paidAmount, totalAmount);

  if (nextStatus === paymentRow.status && paidAmount === Number(paymentRow.paid_amount)) {
    return NextResponse.json(
      {
        ok: true,
        idempotent: true,
        paymentId,
        status: nextStatus,
      },
      { status: 200 },
    );
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({ paid_amount: paidAmount, status: nextStatus })
    .eq("id", paymentId);

  if (updateError) {
    return NextResponse.json(
      { ok: false, error: updateError.message, paymentId },
      { status: 500 },
    );
  }

  await logAudit(supabase, {
    actorUserId: null,
    actorType: "webhook",
    action: "payment.status_changed",
    entityType: "payment",
    entityId: paymentId,
    diff: {
      from: { status: paymentRow.status, paid_amount: Number(paymentRow.paid_amount) },
      to: { status: nextStatus, paid_amount: paidAmount },
      provider,
    },
  });

  let contract = null;
  if (nextStatus === "paid") {
    try {
      const updatedPayment = await generateContractForPayment(supabase, paymentId);
      contract = {
        contractUrl: updatedPayment.contract_url,
        qrCode: updatedPayment.qr_code,
        generatedAt: updatedPayment.contract_generated_at,
      };
    } catch (error) {
      console.error("[webhook][payments] contract generation failed", {
        paymentId,
        error: error instanceof Error ? error.message : String(error),
      });
      await logAudit(supabase, {
        actorUserId: null,
        actorType: "webhook",
        action: "payment.contract_generation_failed",
        entityType: "payment",
        entityId: paymentId,
        diff: { error: error instanceof Error ? error.message : String(error) },
      });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      receivedAt: new Date().toISOString(),
      provider,
      paymentId,
      status: nextStatus,
      paidAmount,
      contract,
    },
    { status: 200 },
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: "Webhook endpoint is alive. POST требует валидной HMAC-подписи.",
    providers: Object.keys(PROVIDER_SECRETS).filter((p) => PROVIDER_SECRETS[p]),
  });
}
