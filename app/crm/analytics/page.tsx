import { CrmTopbar } from "@/components/crm/crm-topbar";
import { type CrmBundleLike, buildCrmPilgrimRows, getGroupRevenue } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

function bucketReadiness(values: number[]) {
  const buckets = Array.from({ length: 10 }, () => 0);

  values.forEach((value) => {
    const index = Math.min(9, Math.floor(value / 10));
    buckets[index] += 1;
  });

  const max = Math.max(1, ...buckets);
  return buckets.map((count) => Math.max(12, Math.round((count / max) * 100)));
}

export default async function CrmAnalyticsPage() {
  const crm = await loadCrmBundle();

  if (!crm || !crm.operator) {
    return null;
  }

  const crmBundle = crm as CrmBundleLike;
  const rows = buildCrmPilgrimRows(crmBundle);
  const avgCheck =
    crm.payments.reduce((sum, item) => sum + item.totalAmount, 0) / Math.max(crm.payments.length, 1);
  const paidCount = crm.payments.filter((item) => item.status === "paid").length;
  const leadFunnel = [
    { count: crm.pilgrims.length * 4, label: "Заявки", percent: "100%" },
    { count: Math.round(crm.pilgrims.length * 2.7), label: "Подписан договор", percent: "68%" },
    { count: Math.round(crm.pilgrims.length * 1.9), label: "Оплата ≥50%", percent: "48%" },
    { count: crm.readiness.filter((item) => item.readinessPercent >= 90).length, label: "Готовы · ≥90%", percent: "26%" },
  ];
  const histogram = bucketReadiness(rows.map((item) => item.readiness.readinessPercent));

  return (
    <>
      <CrmTopbar
        title={
          <>
            Аналитика · <em>сезон 2026.</em>
          </>
        }
        actions={
          <>
            <select defaultValue="year">
              <option value="year">Последние 12 месяцев</option>
              <option value="quarter">Этот квартал</option>
              <option value="month">Этот месяц</option>
            </select>
            <a className="btn btn-ghost btn-sm" href="#">
              Экспорт PDF
            </a>
          </>
        }
      />

      <div className="ana-top">
        <div className="m">
          <div className="k">Средний чек</div>
          <div className="v">{formatKzt(avgCheck)}</div>
          <div className="d">по активным платежам сезона</div>
        </div>
        <div className="m">
          <div className="k">Полностью оплачено</div>
          <div className="v">{paidCount}</div>
          <div className="d">паломников с paid статусом</div>
        </div>
        <div className="m">
          <div className="k">Квота заполнения</div>
          <div className="v">
            {Math.round(
              (crm.groups.reduce((sum, item) => sum + item.quotaFilled, 0) /
                Math.max(
                  crm.groups.reduce((sum, item) => sum + item.quotaTotal, 0),
                  1,
                )) *
                100,
            )}
            %
          </div>
          <div className="d">средняя загрузка групп</div>
        </div>
      </div>

      <div className="charts-2">
        <div className="chart-card" style={{ margin: 0 }}>
          <div className="chart-head">
            <div>
              <h4>
                Конверсия <em>воронки</em>
              </h4>
              <div className="s">Заявка → вылет · сезон 2026</div>
            </div>
          </div>
          <div className="funnel">
            {leadFunnel.map((step, index) => (
              <div
                key={step.label}
                className="fr"
                style={
                  index === leadFunnel.length - 1
                    ? { background: "var(--emerald)", borderColor: "var(--emerald)", color: "#fff" }
                    : undefined
                }
              >
                <div className="l" style={index === leadFunnel.length - 1 ? { color: "#fff" } : undefined}>
                  {step.label}
                </div>
                <div>
                  <span className="v" style={index === leadFunnel.length - 1 ? { color: "#fff" } : undefined}>
                    {step.count}
                  </span>{" "}
                  · <span className="c">{step.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="chart-card" style={{ margin: 0 }}>
          <div className="chart-head">
            <div>
              <h4>
                Выручка <em>по группам</em>
              </h4>
              <div className="s">Сезон 2026</div>
            </div>
          </div>
          {crm.groups.map((group, index) => {
            const value = getGroupRevenue(crmBundle, group.id);
            const max = Math.max(1, ...crm.groups.map((item) => getGroupRevenue(crmBundle, item.id)));
            const color = index === 0 ? "var(--ink)" : index === 1 ? "var(--emerald)" : "var(--gold-soft)";

            return (
              <div
                key={group.id}
                style={{
                  alignItems: "center",
                  borderBottom: index === crm.groups.length - 1 ? "0" : "1px solid var(--line-soft)",
                  display: "grid",
                  fontSize: 13,
                  gap: 14,
                  gridTemplateColumns: "130px 1fr auto",
                  padding: "10px 0",
                }}
              >
                <div style={{ fontWeight: 600 }}>{group.name}</div>
                <div className="bar" style={{ height: 10, margin: 0, maxWidth: "none" }}>
                  <b style={{ background: color, width: `${Math.max(12, Math.round((value / max) * 100))}%` }} />
                </div>
                <div className="num">{formatKzt(value)}</div>
              </div>
            );
          })}
        </div>

        <div className="chart-card" style={{ margin: 0 }}>
          <div className="chart-head">
            <div>
              <h4>
                <em>Readiness</em> distribution
              </h4>
              <div className="s">Распределение паломников по проценту готовности</div>
            </div>
          </div>
          <div className="histogram">
            {histogram.map((height, index) => (
              <div
                key={`${height}-${index}`}
                className="h"
                style={{
                  background:
                    index < 2 ? "var(--danger)" : index < 5 ? "var(--warning)" : index > 6 ? "var(--emerald)" : "var(--ink)",
                  height: `${height}%`,
                }}
              />
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(10,1fr)", fontSize: 10, marginTop: 8, textAlign: "center" }}>
            {["0-10", "11-20", "21-30", "31-40", "41-50", "51-60", "61-70", "71-80", "81-90", "91-100"].map((label) => (
              <div key={label}>{label}</div>
            ))}
          </div>
        </div>

        <div className="chart-card" style={{ margin: 0 }}>
          <div className="chart-head">
            <div>
              <h4>
                Источники <em>заявок</em>
              </h4>
              <div className="s">Откуда приходят паломники</div>
            </div>
          </div>
          <div className="pie-wrap">
            <svg height="160" viewBox="0 0 42 42" width="160">
              <circle cx="21" cy="21" fill="transparent" r="15.9" stroke="var(--ink)" strokeDasharray="42 58" strokeDashoffset="25" strokeWidth="8" transform="rotate(-90 21 21)" />
              <circle cx="21" cy="21" fill="transparent" r="15.9" stroke="var(--emerald)" strokeDasharray="28 72" strokeDashoffset="-17" strokeWidth="8" transform="rotate(-90 21 21)" />
              <circle cx="21" cy="21" fill="transparent" r="15.9" stroke="var(--gold-soft)" strokeDasharray="18 82" strokeDashoffset="-45" strokeWidth="8" transform="rotate(-90 21 21)" />
              <circle cx="21" cy="21" fill="transparent" r="15.9" stroke="var(--warning)" strokeDasharray="12 88" strokeDashoffset="-63" strokeWidth="8" transform="rotate(-90 21 21)" />
            </svg>
            <ul className="legend" style={{ listStyle: "none", margin: 0, padding: 0 }}>
              <li>
                <span style={{ flex: 1 }}>HajjCRM каталог</span>
                <b className="num">42%</b>
              </li>
              <li className="em">
                <span style={{ flex: 1 }}>WhatsApp · сарафан</span>
                <b className="num">28%</b>
              </li>
              <li className="g">
                <span style={{ flex: 1 }}>Instagram</span>
                <b className="num">18%</b>
              </li>
              <li className="m">
                <span style={{ flex: 1 }}>Мечети-партнёры</span>
                <b className="num">8%</b>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
