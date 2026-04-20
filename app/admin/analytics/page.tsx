import { buildAdminAnalytics } from "@/lib/design-admin";
import { loadAdminBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

function toneClass(status: string) {
  return status.toLowerCase().includes("рефанд") ? "danger" : "warning";
}

export default async function AdminAnalyticsPage() {
  const admin = await loadAdminBundle();
  const analytics = buildAdminAnalytics(admin);

  return (
    <>
      <div className="adm-top">
        <div>
          <h1>
            Платформа в <em>цифрах.</em>
          </h1>
          <p>
            {analytics.operatorsCount} операторов · {analytics.pilgrimsCount.toLocaleString("ru-RU")} паломников · MRR{" "}
            {formatKzt(analytics.mrr)} · сезон 2026
          </p>
        </div>
        <div className="row g12">
          <select style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 4, fontFamily: "inherit", fontSize: 12, fontWeight: 600, padding: "8px 12px" }}>
            <option>Сезон 2026</option>
            <option>Последние 12 мес</option>
          </select>
          <button className="btn btn-dark btn-sm" type="button">
            Отчёт PDF
          </button>
        </div>
      </div>

      <div className="adm-ana">
        <div className="adm-ana-top">
          <div className="top-ops">
            <h4>
              Топ-10 <em>операторов</em> по выручке
            </h4>
            <div className="s">Сезон 2026 · комиссия платформы 1.8% от сделок</div>
            <div className="top-ops-list">
              {analytics.topOperators.map((row) => (
                <div className="top-ops-row" key={`${row.rank}-${row.name}`}>
                  <div className="rank">{row.rank}</div>
                  <div>
                    <div className="n">{row.name}</div>
                    <div className="bar-sq">
                      <i style={{ width: `${row.width}%` }} />
                    </div>
                  </div>
                  <div className="rev">{row.revenueLabel}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mrr">
              <div className="k">MRR · платформа</div>
              <div className="v">{formatKzt(analytics.mrr)}</div>
              <div className="sub">▲ +14.8% мес к мес · подписки CRM</div>
              <div className="trend">
                {[22, 34, 40, 48, 55, 62, 68, 76, 82, 88, 95, 100].map((height) => (
                  <i key={height} style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>

            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--radius)", marginTop: 16, padding: 22 }}>
              <h5 className="eyebrow" style={{ margin: "0 0 12px" }}>
                Паломники · сезоны
              </h5>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {analytics.seasons.map((season, index) => (
                  <div
                    key={season.label}
                    style={{ alignItems: "center", display: "grid", fontSize: 13, gap: 12, gridTemplateColumns: "80px 1fr auto" }}
                  >
                    <span style={{ fontFamily: "var(--f-serif)", fontWeight: 600 }}>{season.label}</span>
                    <div style={{ background: "var(--line-soft)", borderRadius: 2, height: 8, maxWidth: "none", overflow: "hidden" }}>
                      <i
                        style={{
                          background: index === 0 ? "var(--muted)" : index === 1 ? "var(--emerald)" : "var(--ink)",
                          display: "block",
                          height: "100%",
                          width: `${season.width}%`,
                        }}
                      />
                    </div>
                    <b className="num">{season.value.toLocaleString("ru-RU")}</b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="qual-metrics">
          <div className="qm">
            <div className="k">Средний рейтинг</div>
            <div className="v">
              {analytics.averageRating.toFixed(2)} <em style={{ fontSize: 22 }}>/5</em>
            </div>
            <div className="d">по {Math.max(admin.reviews.length, 1240).toLocaleString("ru-RU")} верифицированным отзывам</div>
          </div>
          <div className="qm">
            <div className="k">Время верификации</div>
            <div className="v">
              2.4 <em style={{ fontSize: 22 }}>дн</em>
            </div>
            <div className="d">SLA · 72 часа · выполнено 98%</div>
          </div>
          <div className="qm">
            <div className="k">Успешных вылетов</div>
            <div className="v">{analytics.successfulFlightsPercent}</div>
            <div className="d">отказано в визе: 32 из {analytics.pilgrimsCount.toLocaleString("ru-RU")}</div>
          </div>
        </div>

        <div className="disputes">
          <h4>
            Жалобы и <em>disputes</em>
          </h4>
          <table>
            <thead>
              <tr>
                <th>Оператор</th>
                <th>Паломник</th>
                <th>Причина</th>
                <th>Сумма</th>
                <th>Статус</th>
                <th>Заведена</th>
              </tr>
            </thead>
            <tbody>
              {analytics.complaints.map((item) => (
                <tr key={`${item.operator}-${item.pilgrim}-${item.createdAt}`}>
                  <td style={{ fontWeight: 600 }}>{item.operator}</td>
                  <td>{item.pilgrim}</td>
                  <td>{item.reason}</td>
                  <td className="num">{item.amount}</td>
                  <td>
                    <span className={`tag ${toneClass(item.status)}`}>{item.status}</span>
                  </td>
                  <td>{item.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
