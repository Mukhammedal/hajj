import Link from "next/link";

import { CrmTopbar } from "@/components/crm/crm-topbar";
import { type CrmBundleLike, buildContracts, getPilgrimRouteId } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

type SearchParams = Record<string, string | string[] | undefined>;
type ContractFilter = "all" | "draft" | "signed" | "waiting";

function toValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function matchesFilter(row: ReturnType<typeof buildContracts>[number], filter: ContractFilter) {
  if (filter === "signed") {
    return row.statusTone === "success";
  }
  if (filter === "waiting") {
    return row.statusTone === "warning";
  }
  if (filter === "draft") {
    return row.statusTone === "muted";
  }
  return true;
}

export default async function CrmContractsPage({ searchParams }: { searchParams?: SearchParams }) {
  const crm = await loadCrmBundle();

  if (!crm || !crm.operator) {
    return null;
  }

  const rows = buildContracts(crm as CrmBundleLike);
  const filter = ((toValue(searchParams?.status) as ContractFilter | undefined) ?? "all");
  const q = (toValue(searchParams?.q) ?? "").trim().toLowerCase();
  const filteredRows = rows.filter((row) => {
    const matchesQuery =
      !q ||
      row.contractLabel.toLowerCase().includes(q) ||
      row.pilgrim.fullName.toLowerCase().includes(q) ||
      row.pilgrim.iin.includes(q.replace(/\D/g, "")) ||
      row.qrCode.toLowerCase().includes(q);

    return matchesFilter(row, filter) && matchesQuery;
  });

  const buildHref = (nextFilter: ContractFilter) => {
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (nextFilter !== "all") {
      params.set("status", nextFilter);
    }
    return params.size ? `/crm/contracts?${params.toString()}` : "/crm/contracts";
  };

  return (
    <>
      <CrmTopbar
        title={
          <>
            Договоры и <em>QR-коды.</em>
          </>
        }
        actions={
          <>
            <input
              aria-label="Поиск по договорам"
              className="search-box"
              defaultValue={q}
              form="crm-contracts-filter"
              name="q"
              placeholder="Номер договора, ФИО, ИИН, QR…"
              style={{ width: 250 }}
              type="search"
            />
            {filter !== "all" ? <input form="crm-contracts-filter" name="status" type="hidden" value={filter} /> : null}
            <form action="/crm/contracts" id="crm-contracts-filter" method="get" />
            <Link className="btn btn-dark btn-sm" href="/crm/payments">
              + Новый договор
            </Link>
          </>
        }
      />

      <div className="metrics-4" style={{ marginBottom: 24 }}>
        <div className="metric">
          <div className="k">Договоров всего</div>
          <div className="v">{rows.length}</div>
          <div className="delta">активных · {rows.filter((row) => row.statusTone !== "muted").length}</div>
        </div>
        <div className="metric">
          <div className="k">Подписано · 2026</div>
          <div className="v">{rows.filter((row) => row.statusTone === "success").length}</div>
          <div className="delta">по live платежам</div>
        </div>
        <div className="metric">
          <div className="k">Ждут подписи</div>
          <div className="v">{rows.filter((row) => row.statusTone === "warning").length}</div>
          <div className="delta" style={{ color: "var(--warning)" }}>
            частичная оплата / без договора
          </div>
        </div>
        <div className="metric">
          <div className="k">QR проверок</div>
          <div className="v">{rows.filter((row) => row.qrCode).length * 4}</div>
          <div className="delta">публичный verify включён</div>
        </div>
      </div>

      <div className="crm-filter" style={{ marginBottom: 18 }}>
        {([
          ["all", "Все"],
          ["signed", "Подписан"],
          ["waiting", "Ждёт подписи"],
          ["draft", "Черновик"],
        ] as const).map(([key, label]) => (
          <Link className={`chip ${filter === key ? "on" : ""}`} href={buildHref(key)} key={key}>
            {label}{" "}
            <span className="c">
              {key === "all"
                ? rows.length
                : rows.filter((row) => matchesFilter(row, key)).length}
            </span>
          </Link>
        ))}
      </div>

      <div className="rep-hist">
        <table>
          <thead>
            <tr>
              <th>№ договора</th>
              <th>Паломник</th>
              <th>Группа</th>
              <th>Сумма</th>
              <th>QR-код</th>
              <th>Статус</th>
              <th>Дата подписания</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filteredRows.slice(0, 9).map((row) => (
              <tr key={row.payment.id}>
                <td className="license">{row.contractLabel}</td>
                <td>{row.pilgrim.fullName}</td>
                <td>{row.groupName}</td>
                <td>{formatKzt(row.payment.totalAmount)}</td>
                <td>
                  <span style={{ color: "var(--emerald)", fontFamily: "var(--f-display)", fontSize: 11, fontWeight: 600 }}>{row.qrCode}</span>
                </td>
                <td>
                  <span className={`tag ${row.statusTone}`}>{row.statusLabel}</span>
                </td>
                <td>{row.openedLabel}</td>
                <td>
                  <Link
                    href={row.payment.qrCode ? `/verify/${row.payment.qrCode}` : `/crm/pilgrims/${getPilgrimRouteId(row.pilgrim)}`}
                    style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600 }}
                  >
                    {row.statusTone === "success" ? "Открыть" : row.statusTone === "warning" ? "Напомнить" : "Продолжить"} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
