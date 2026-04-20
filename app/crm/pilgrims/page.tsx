import Link from "next/link";

import { GroupAssignmentForm } from "@/components/crm/group-assignment-form";
import { PilgrimCreateForm } from "@/components/crm/pilgrim-create-form";
import { CrmTopbar } from "@/components/crm/crm-topbar";
import {
  type CrmBundleLike,
  buildCrmPilgrimRows,
  getPilgrimRouteId,
  getPilgrimStatusLabel,
  getProgressTone,
} from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatPercent } from "@/lib/format";

type SearchParams = Record<string, string | string[] | undefined>;
type FilterKey = "all" | "debt" | "departed" | "new" | "no_docs" | "ready";

function toValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function matchesFilter(row: ReturnType<typeof buildCrmPilgrimRows>[number], status: FilterKey) {
  if (status === "new") {
    return row.pilgrim.status === "new";
  }

  if (status === "no_docs") {
    return row.docsCount < 5;
  }

  if (status === "debt") {
    return row.paymentPercent < 100;
  }

  if (status === "ready") {
    return row.readiness.readinessPercent >= 90 || row.pilgrim.status === "ready";
  }

  if (status === "departed") {
    return row.pilgrim.status === "departed";
  }

  return true;
}

export default async function CrmPilgrimsPage({ searchParams }: { searchParams?: SearchParams }) {
  const crm = await loadCrmBundle();

  if (!crm || !crm.operator) {
    return null;
  }

  const rows = buildCrmPilgrimRows(crm as CrmBundleLike);
  const q = (toValue(searchParams?.q) ?? "").trim();
  const status = ((toValue(searchParams?.status) as FilterKey | undefined) ?? "all");
  const page = Math.max(1, Number.parseInt(toValue(searchParams?.page) ?? "1", 10) || 1);
  const pageSize = 15;
  const normalizedQuery = q.toLowerCase();

  const counters: Array<{ count: number; key: FilterKey; label: string }> = [
    { count: rows.length, key: "all", label: "Все" },
    { count: rows.filter((row) => row.pilgrim.status === "new").length, key: "new", label: "Новые" },
    { count: rows.filter((row) => row.docsCount < 5).length, key: "no_docs", label: "Нет документов" },
    { count: rows.filter((row) => row.paymentPercent < 100).length, key: "debt", label: "Долг" },
    { count: rows.filter((row) => row.readiness.readinessPercent >= 90 || row.pilgrim.status === "ready").length, key: "ready", label: "Готовы" },
    { count: rows.filter((row) => row.pilgrim.status === "departed").length, key: "departed", label: "Улетели" },
  ];

  const filteredRows = rows.filter((row) => {
    const matchesQuery =
      !normalizedQuery ||
      row.fullName.toLowerCase().includes(normalizedQuery) ||
      row.phone.toLowerCase().includes(normalizedQuery) ||
      row.pilgrim.iin.includes(normalizedQuery.replace(/\D/g, ""));

    return matchesQuery && matchesFilter(row, status);
  });

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const avgReadiness = filteredRows.reduce((sum, item) => sum + item.readiness.readinessPercent, 0) / Math.max(filteredRows.length, 1);

  const buildHref = (nextStatus: FilterKey, nextPage = 1) => {
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
    }
    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    return params.size ? `/crm/pilgrims?${params.toString()}` : "/crm/pilgrims";
  };

  return (
    <>
      <CrmTopbar
        title={
          <>
            Паломники — <em>{crm.pilgrims.length}</em> в сезоне.
          </>
        }
        actions={
          <>
            <a className="btn btn-ghost btn-sm" href="/api/crm/pilgrims/export">
              Экспорт Excel
            </a>
            <Link className="btn btn-dark btn-sm" href="#new-pilgrim">
              + Добавить паломника
            </Link>
          </>
        }
      />

      <div className="crm-filter" style={{ alignItems: "center", gap: 10 }}>
        <form action="/crm/pilgrims" method="get" style={{ display: "contents" }}>
          <input
            aria-label="Поиск паломника"
            className="search-box"
            defaultValue={q}
            name="q"
            placeholder="Имя, ИИН, телефон…"
            style={{ width: 260 }}
            type="search"
          />
          {status !== "all" ? <input name="status" type="hidden" value={status} /> : null}
        </form>
        {counters.map((item) => (
          <Link className={`chip ${status === item.key ? "on" : ""}`} href={buildHref(item.key)} key={item.key}>
            {item.label} <span className="c">{item.count}</span>
          </Link>
        ))}
      </div>

      <div className="crm-tbl">
        <div className="bulk">
          <div>
            Выбрано <b>{Math.min(3, visibleRows.length)}</b> из {filteredRows.length} · <Link href="/crm/notifications">Отправить напоминание</Link> ·{" "}
            <a href="/api/crm/pilgrims/export">Экспорт</a>
          </div>
          <div>
            Показано {visibleRows.length} из {filteredRows.length} · статус <b>{counters.find((item) => item.key === status)?.label ?? "Все"}</b>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: 28 }}>✓</th>
              <th>Паломник</th>
              <th>Группа</th>
              <th>Готовность</th>
              <th>Документы</th>
              <th>Оплата</th>
              <th>Активность</th>
              <th style={{ width: 80 }} />
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={row.id}>
                <td>
                  <input defaultChecked={index < 3} type="checkbox" />
                </td>
                <td>
                  <div className="ppl">
                    <div className="avatar" style={{ background: row.avatarTone }}>
                      {row.initials}
                    </div>
                    <div>
                      <div className="n">{row.fullName}</div>
                      <div className="i">
                        {row.iin} · {getPilgrimStatusLabel(row.pilgrim.status)}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{row.groupName}</td>
                <td>
                  <div className="rb2">
                    <div className={`bar ${getProgressTone(row.readiness.readinessPercent)}`}>
                      <i style={{ width: `${row.readiness.readinessPercent}%` }} />
                    </div>
                    <b>{row.readiness.readinessPercent}%</b>
                  </div>
                </td>
                <td>{row.docsCount} / 5</td>
                <td>{formatPercent(row.paymentPercent)}</td>
                <td>{row.activity}</td>
                <td>
                  <div className="row-actions">
                    <Link className="ibtn" href="/crm/notifications">
                      WA
                    </Link>
                    <Link className="ibtn" href={`/crm/pilgrims/${getPilgrimRouteId(row.pilgrim)}`}>
                      ›
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="paginator">
          <span>Средняя готовность — {formatPercent(avgReadiness)}</span>
          <span style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: pageCount }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <Link
                  className={`chip ${pageNumber === currentPage ? "on" : ""}`}
                  href={buildHref(status, pageNumber)}
                  key={pageNumber}
                  style={{ minWidth: 36, textAlign: "center" }}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </span>
        </div>
      </div>

      <div className="groups-grid" style={{ paddingTop: 0 }}>
        <div className="group-card" id="new-pilgrim">
          <div className="gh">
            <div>
              <h4>Новый паломник</h4>
              <div className="route">Создать карточку и доступ в кабинет</div>
            </div>
          </div>
          <div className="gbody" style={{ display: "block" }}>
            <PilgrimCreateForm />
          </div>
        </div>

        <div className="group-card">
          <div className="gh">
            <div>
              <h4>Назначение в группу</h4>
              <div className="route">Переносит связь паломника и учитывает квоту</div>
            </div>
          </div>
          <div className="gbody" style={{ display: "block" }}>
            <GroupAssignmentForm groups={crm.groups} pilgrims={crm.pilgrims} />
          </div>
        </div>
      </div>
    </>
  );
}
