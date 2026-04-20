import Link from "next/link";

import { CrmTopbar } from "@/components/crm/crm-topbar";
import { buildMonthlyPaymentChart, getPaymentMethodLabel, getPaymentStatusMeta, getPilgrimRouteId } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";

type SearchParams = Record<string, string | string[] | undefined>;
type PaymentFilter = "all" | "cash" | "halyk" | "kaspi" | "transfer";

function toValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CrmPaymentsPage({ searchParams }: { searchParams?: SearchParams }) {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const pilgrimMap = new Map(crm.pilgrims.map((item) => [item.id, item]));
  const groupMap = new Map(crm.groups.map((item) => [item.id, item]));
  const method = ((toValue(searchParams?.method) as PaymentFilter | undefined) ?? "all");
  const q = (toValue(searchParams?.q) ?? "").trim().toLowerCase();
  const chartData = buildMonthlyPaymentChart(crm.payments);
  const filteredPayments = crm.payments.filter((payment) => {
    const pilgrim = pilgrimMap.get(payment.pilgrimId);
    const groupId = crm.groupLinks.find((link) => link.pilgrimId === payment.pilgrimId)?.groupId;
    const group = groupMap.get(groupId ?? "");
    const matchesMethod = method === "all" || payment.paymentMethod === method;
    const matchesQuery =
      !q ||
      pilgrim?.fullName.toLowerCase().includes(q) ||
      pilgrim?.iin.includes(q.replace(/\D/g, "")) ||
      group?.name.toLowerCase().includes(q);

    return matchesMethod && Boolean(matchesQuery);
  });

  const totalAmount = crm.payments.reduce((sum, item) => sum + item.totalAmount, 0);
  const collectedAmount = crm.payments.reduce((sum, item) => sum + item.paidAmount, 0);
  const currentMonthAmount = crm.payments
    .filter((item) => item.createdAt.startsWith("2026-04"))
    .reduce((sum, item) => sum + item.paidAmount, 0);
  const avgCheck = crm.payments.length ? totalAmount / crm.payments.length : 0;

  const buildHref = (nextMethod: PaymentFilter) => {
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (nextMethod !== "all") {
      params.set("method", nextMethod);
    }
    return params.size ? `/crm/payments?${params.toString()}` : "/crm/payments";
  };

  return (
    <>
      <CrmTopbar
        title={
          <>
            Платежи и <em>выручка.</em>
          </>
        }
        actions={
          <>
            <input
              aria-label="Поиск по платежам"
              className="search-box"
              defaultValue={q}
              form="crm-payments-filter"
              name="q"
              placeholder="ФИО, ИИН, группа…"
              style={{ width: 220 }}
              type="search"
            />
            {method !== "all" ? <input form="crm-payments-filter" name="method" type="hidden" value={method} /> : null}
            <form action="/crm/payments" id="crm-payments-filter" method="get" />
            <Link className="btn btn-ghost btn-sm" href="/crm/contracts">
              Договоры и QR
            </Link>
          </>
        }
      />

      <div className="pay-summary-4">
        <div className="m">
          <div className="k">Выручка сезон</div>
          <div className="v">{formatKzt(collectedAmount)}</div>
        </div>
        <div className="m">
          <div className="k">Pending</div>
          <div className="v">{formatKzt(Math.max(totalAmount - collectedAmount, 0))}</div>
        </div>
        <div className="m">
          <div className="k">Этот месяц</div>
          <div className="v">{formatKzt(currentMonthAmount)}</div>
        </div>
        <div className="m">
          <div className="k">Средний чек</div>
          <div className="v">{formatKzt(avgCheck)}</div>
        </div>
      </div>

      <div className="crm-filter" style={{ marginBottom: 24 }}>
        {([
          ["all", "Все"],
          ["kaspi", "Kaspi"],
          ["halyk", "Halyk"],
          ["cash", "Наличные"],
          ["transfer", "Перевод"],
        ] as const).map(([key, label]) => (
          <Link className={`chip ${method === key ? "on" : ""}`} href={buildHref(key)} key={key}>
            {label}
          </Link>
        ))}
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <div>
            <h4>
              Выручка <em>по месяцам</em>
            </h4>
            <div className="s">Основная оплата и частичные взносы</div>
          </div>
        </div>
        <div className="chart-bars">
          {chartData.map((entry) => (
            <div key={`${entry.label}-full`} className="b" style={{ height: `${entry.darkHeight}%` }} />
          ))}
          {chartData.map((entry) => (
            <div key={`${entry.label}-part`} className="b em" style={{ height: `${entry.emeraldHeight}%` }} />
          ))}
        </div>
        <div className="chart-labels">
          {chartData.map((entry) => (
            <div key={entry.label}>{entry.label}</div>
          ))}
        </div>
      </div>

      <div className="rep-hist">
        <table>
          <thead>
            <tr>
              <th>Дата-время</th>
              <th>Паломник</th>
              <th>Группа</th>
              <th>Сумма</th>
              <th>Метод</th>
              <th>Статус</th>
              <th>PDF договора</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.slice(0, 8).map((payment) => {
              const pilgrim = pilgrimMap.get(payment.pilgrimId);
              const groupId = crm.groupLinks.find((link) => link.pilgrimId === payment.pilgrimId)?.groupId;
              const group = groupMap.get(groupId ?? "");
              const meta = getPaymentStatusMeta(payment.status);

              return (
                <tr key={payment.id}>
                  <td>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "short", timeStyle: "short" }).format(new Date(payment.createdAt))}</td>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/crm/pilgrims/${getPilgrimRouteId(pilgrim ?? { fullName: payment.pilgrimId, id: payment.pilgrimId })}`}>{pilgrim?.fullName ?? "Паломник"}</Link>
                  </td>
                  <td>{group?.name ?? "Без группы"}</td>
                  <td>{formatKzt(payment.paidAmount)}</td>
                  <td>
                    <span className="tag">{getPaymentMethodLabel(payment.paymentMethod)}</span>
                  </td>
                  <td>
                    <span className={`tag ${meta.tone}`}>{meta.label}</span>
                  </td>
                  <td>
                    {payment.contractUrl ? (
                      <Link href={payment.contractUrl} style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600 }}>
                        Скачать PDF
                      </Link>
                    ) : (
                      <span className="tag">черновик</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
