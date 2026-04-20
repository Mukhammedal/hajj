import { loadCrmBundle } from "@/lib/data/hajj-loaders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const statusLabels = {
  departed: "Вылетел",
  docs_complete: "Документы готовы",
  docs_pending: "Ждём документы",
  new: "Новый",
  payment_partial: "Частичная оплата",
  payment_pending: "Ждём оплату",
  ready: "Готов",
} as const;

const paymentLabels = {
  paid: "Оплачено",
  partial: "Частично",
  pending: "Ожидает",
} as const;

function escapeCell(value: string | number) {
  const stringValue = String(value);

  if (!/[;"\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replaceAll('"', '""')}"`;
}

export async function GET() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return new Response("Unauthorized", { status: 401 });
  }

  const readinessMap = new Map(crm.readiness.map((item) => [item.pilgrimId, item]));
  const paymentMap = new Map(crm.payments.map((item) => [item.pilgrimId, item]));
  const groupByPilgrim = new Map(
    crm.groupLinks.map((link) => [link.pilgrimId, crm.groups.find((group) => group.id === link.groupId)?.name ?? ""]),
  );
  const lines = [
    "sep=;",
    [
      "ФИО",
      "ИИН",
      "Телефон",
      "Статус",
      "Группа",
      "Готовность",
      "Документы",
      "Оплата",
      "Создан",
    ].join(";"),
    ...crm.pilgrims.map((pilgrim) => {
      const readiness = readinessMap.get(pilgrim.id);
      const payment = paymentMap.get(pilgrim.id);

      return [
        pilgrim.fullName,
        pilgrim.iin,
        pilgrim.phone,
        statusLabels[pilgrim.status] ?? pilgrim.status,
        groupByPilgrim.get(pilgrim.id) ?? "",
        `${readiness?.readinessPercent ?? 0}%`,
        `${readiness?.docsCount ?? 0}/5`,
        paymentLabels[payment?.status ?? "pending"],
        pilgrim.createdAt.slice(0, 10),
      ]
        .map(escapeCell)
        .join(";");
    }),
  ];

  const fileName = `hajjcrm-pilgrims-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
