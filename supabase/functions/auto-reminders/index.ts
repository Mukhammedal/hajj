import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
const whapiToken = Deno.env.get("WHATSAPP_API_KEY") ?? "";
const whapiBaseUrl = Deno.env.get("WHAPI_BASE_URL") ?? "https://gate.whapi.cloud";

const dayBuckets = new Set([30, 14, 7]);

function diffInDays(date: string) {
  const today = new Date();
  const target = new Date(date);
  const utcToday = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const utcTarget = Date.UTC(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());

  return Math.round((utcTarget - utcToday) / 86400000);
}

function normalizeWhatsAppRecipient(phone: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.length === 10) {
    return `7${digits}`;
  }

  return digits;
}

async function sendWhapiTextMessage(to: string, body: string) {
  const response = await fetch(`${whapiBaseUrl}/messages/text`, {
    method: "POST",
    headers: {
      accept: "application/json",
      authorization: `Bearer ${whapiToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to,
      body,
      typing_time: 0,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Whapi request failed");
  }
}

Deno.serve(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  const { data: upcomingGroups, error: groupError } = await supabase
    .from("groups")
    .select("id, operator_id, flight_date, pilgrim_groups(pilgrim_id)")
    .gte("flight_date", today)
    .lte("flight_date", future);

  if (groupError) {
    return new Response(JSON.stringify({ ok: false, error: groupError.message }), { status: 500 });
  }

  const pilgrimIds = Array.from(
    new Set(
      (upcomingGroups ?? []).flatMap((group) =>
        (group.pilgrim_groups ?? []).map((record: { pilgrim_id: string }) => record.pilgrim_id),
      ),
    ),
  );

  if (!pilgrimIds.length) {
    return Response.json({ ok: true, queued: 0, message: "Нет паломников в окне 30/14/7 дней." });
  }

  const [{ data: readinessRows, error: readinessError }, { data: profiles, error: profileError }] = await Promise.all([
    supabase.from("pilgrim_readiness_view").select("*").in("pilgrim_id", pilgrimIds),
    supabase.from("pilgrim_profiles").select("id, operator_id, phone").in("id", pilgrimIds),
  ]);

  if (readinessError || profileError) {
    return new Response(
      JSON.stringify({ ok: false, error: readinessError?.message ?? profileError?.message ?? "Unknown error" }),
      { status: 500 },
    );
  }

  const readinessMap = new Map((readinessRows ?? []).map((row) => [row.pilgrim_id, row]));
  const profileMap = new Map((profiles ?? []).map((row) => [row.id, row]));

  const notifications = (upcomingGroups ?? []).flatMap((group) => {
    const daysLeft = diffInDays(group.flight_date);

    if (!dayBuckets.has(daysLeft)) {
      return [];
    }

    return (group.pilgrim_groups ?? []).flatMap((record: { pilgrim_id: string }) => {
      const readiness = readinessMap.get(record.pilgrim_id);
      const profile = profileMap.get(record.pilgrim_id);

      if (!readiness || !profile) {
        return [];
      }

      const type = readiness.docs_count < 5
        ? "reminder_docs"
        : !readiness.is_payment_complete
          ? "reminder_payment"
          : "reminder_flight";

      const message =
        type === "reminder_docs"
          ? `До вылета ${daysLeft} дней. Загрузите недостающие документы в кабинете.`
          : type === "reminder_payment"
            ? `До вылета ${daysLeft} дней. Закройте оплату, чтобы выпустить договор и QR.`
            : `До вылета ${daysLeft} дней. Всё готово, проверьте чек-лист и маршрут группы.`;

      return [
        {
          pilgrim_id: record.pilgrim_id,
          operator_id: profile.operator_id,
          phone: profile.phone,
          channel: "whatsapp",
          type,
          message,
          status: "queued",
          scheduled_at: new Date().toISOString(),
          sent_at: null,
        },
      ];
    });
  });

  if (!notifications.length) {
    return Response.json({ ok: true, queued: 0, message: "Под условия cron ничего не попало." });
  }

  const deliveryRows = await Promise.all(
    notifications.map(async (notification) => {
      if (!whapiToken) {
        return notification;
      }

      const recipient = normalizeWhatsAppRecipient(notification.phone);

      if (!recipient) {
        return {
          ...notification,
          status: "failed",
        };
      }

      try {
        await sendWhapiTextMessage(recipient, notification.message);
        return {
          ...notification,
          status: "sent",
          sent_at: new Date().toISOString(),
        };
      } catch {
        return {
          ...notification,
          status: "failed",
        };
      }
    }),
  );

  const { error: insertError } = await supabase.from("notifications").insert(
    deliveryRows.map(({ phone, ...notification }) => notification),
  );

  if (insertError) {
    return new Response(JSON.stringify({ ok: false, error: insertError.message }), { status: 500 });
  }

  return Response.json({
    ok: true,
    queued: deliveryRows.filter((item) => item.status === "queued").length,
    sent: deliveryRows.filter((item) => item.status === "sent").length,
    failed: deliveryRows.filter((item) => item.status === "failed").length,
  });
});
