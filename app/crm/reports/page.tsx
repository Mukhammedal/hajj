import { CrmTopbar } from "@/components/crm/crm-topbar";
import { reportHistory } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

export default async function CrmReportsPage() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const totalRevenue = crm.payments.reduce((sum, item) => sum + item.paidAmount, 0);

  return (
    <>
      <CrmTopbar
        title={
          <>
            Отчёты и <em>экспорт.</em>
          </>
        }
        actions={
          <>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>Период: 01.04 — 30.04.2026</span>
            <a className="btn btn-dark btn-sm" href="#">
              Сформировать отчёт
            </a>
          </>
        }
      />

      <div className="report-grid">
        <div className="rep-card">
          <div className="eyebrow dot" style={{ marginBottom: 10 }}>Финансы · апрель</div>
          <h3 style={{ fontFamily: "var(--f-display)", fontSize: 34, fontWeight: 500, margin: "0 0 4px" }}>{formatKzt(totalRevenue)}</h3>
          <div style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>▲ по live-платежам сезона</div>
          <div className="bar">
            <b style={{ width: "74%" }} />
          </div>
        </div>

        <div className="rep-card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Разбивка по методам</div>
          {[
            ["Kaspi Red", "42%"],
            ["Halyk перевод", "30%"],
            ["Каспи QR", "17%"],
            ["Наличные", "11%"],
          ].map(([label, value], index) => (
            <div key={label} style={{ marginTop: index ? 14 : 0 }}>
              <div style={{ display: "flex", fontSize: 12, justifyContent: "space-between", margin: "10px 0 6px" }}>
                <span>{label}</span>
                <span><b>{value}</b></span>
              </div>
              <div className="bar">
                <b style={{ background: index === 1 ? "#6b8a70" : index === 2 ? "var(--gold-deep)" : index === 3 ? "var(--ink-soft)" : "var(--emerald)", width: value }} />
              </div>
            </div>
          ))}
        </div>

        <div className="rep-card">
          <div className="eyebrow" style={{ marginBottom: 10 }}>Конверсия воронки</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 34, fontWeight: 500 }}>18.4%</div>
          <div style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600, marginBottom: 18 }}>заявка → подписанный договор</div>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 12, lineHeight: 1.8 }}>
            <div>Заявок · <b style={{ fontFamily: "var(--f-sans)" }}>256</b></div>
            <div>Консультаций · <b style={{ fontFamily: "var(--f-sans)" }}>184</b></div>
            <div>Предложений · <b style={{ fontFamily: "var(--f-sans)" }}>87</b></div>
            <div>Договоров · <b style={{ color: "var(--emerald)", fontFamily: "var(--f-sans)" }}>{crm.payments.length}</b></div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24, overflow: "hidden", padding: 0 }}>
        <div style={{ alignItems: "center", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", padding: "20px 24px" }}>
          <div>
            <div className="eyebrow">Готовые отчёты · скачать</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 20, marginTop: 4 }}>Последние документы</div>
          </div>
        </div>
        <div className="rep-hist">
          <table>
            <thead>
              <tr>
                <th>Название</th>
                <th>Период</th>
                <th>Формат</th>
                <th>Размер</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reportHistory.map((item) => (
                <tr key={item.name}>
                  <td style={{ fontWeight: 600 }}>{item.name}</td>
                  <td>{item.period}</td>
                  <td>{item.format}</td>
                  <td>{item.size}</td>
                  <td><a href="#">Скачать ↓</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
