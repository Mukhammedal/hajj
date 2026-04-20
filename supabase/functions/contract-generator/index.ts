import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface WebhookPayload {
  record?: {
    id: string;
    pilgrim_id: string;
    operator_id: string;
    total_amount: number;
    status: string;
  };
  old_record?: {
    status?: string;
  };
}

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

function escapePdfText(input: string) {
  return input.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function buildSimplePdf(lines: string[]) {
  const stream = [
    "BT",
    "/F1 18 Tf",
    "50 780 Td",
    ...lines.flatMap((line, index) => [index === 0 ? `(${escapePdfText(line)}) Tj` : `0 -24 Td (${escapePdfText(line)}) Tj`]),
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

Deno.serve(async (request) => {
  const payload = (await request.json()) as WebhookPayload;
  const payment = payload.record;

  if (!payment) {
    return new Response(JSON.stringify({ ok: false, error: "Missing payment payload" }), { status: 400 });
  }

  if (payment.status !== "paid" || payload.old_record?.status === "paid") {
    return Response.json({ ok: true, skipped: true });
  }

  const [{ data: pilgrim }, { data: operator }] = await Promise.all([
    supabase.from("pilgrim_profiles").select("id, full_name").eq("id", payment.pilgrim_id).single(),
    supabase.from("operators").select("id, company_name").eq("id", payment.operator_id).single(),
  ]);

  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${payment.id}:${payment.pilgrim_id}:${payment.total_amount}:${new Date().toISOString()}`),
  );
  const qrHash = `HJ-${hex(digest).slice(0, 20)}`;
  const filePath = `${payment.pilgrim_id}/contracts/${qrHash}.pdf`;

  const pdfBytes = buildSimplePdf([
    "HajjCRM Contract",
    `Operator: ${operator?.company_name ?? payment.operator_id}`,
    `Pilgrim: ${pilgrim?.full_name ?? payment.pilgrim_id}`,
    `Amount KZT: ${payment.total_amount}`,
    "Status: paid",
    `QR: ${qrHash}`,
  ]);

  const { error: uploadError } = await supabase.storage.from("documents").upload(filePath, pdfBytes, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (uploadError) {
    return new Response(JSON.stringify({ ok: false, error: uploadError.message }), { status: 500 });
  }

  const { error: updateError } = await supabase
    .from("payments")
    .update({
      contract_url: filePath,
      qr_code: qrHash,
      contract_generated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (updateError) {
    return new Response(JSON.stringify({ ok: false, error: updateError.message }), { status: 500 });
  }

  return Response.json({ ok: true, qrHash, contractPath: filePath });
});
