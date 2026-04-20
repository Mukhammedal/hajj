import { CrmTopbar } from "@/components/crm/crm-topbar";
import { type CrmBundleLike, companyLicenses, companyTeam, getCompanyHeroStats } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";

export default async function CrmCompanyPage() {
  const crm = await loadCrmBundle();

  if (!crm || !crm.operator) {
    return null;
  }

  const stats = getCompanyHeroStats(crm as CrmBundleLike);

  return (
    <>
      <CrmTopbar
        title={
          <>
            Профиль <em>компании.</em>
          </>
        }
        actions={
          <>
            <span className="tag success">✓ Верифицирован МДА</span>
            <a className="btn btn-dark btn-sm" href="#">
              Редактировать
            </a>
          </>
        }
      />

      <div className="co-hero">
        <div className="co-logo">{crm.operator.companyName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Хадж-оператор · с 2014 года</div>
          <h1 style={{ fontFamily: "var(--f-display)", fontSize: 54, fontWeight: 500, margin: 0, lineHeight: 1.05 }}>
            {crm.operator.companyName.split(" ").slice(0, -1).join(" ")} <em>{crm.operator.companyName.split(" ").slice(-1)}</em>
          </h1>
          <p style={{ fontFamily: "var(--f-serif)", fontSize: 16, fontStyle: "italic", margin: "12px 0 0", maxWidth: 540 }}>
            {crm.operator.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18 }}>
            <span className="tag emerald">Лицензия {crm.operator.licenseNumber}</span>
            <span className="tag">Рейтинг {crm.operator.rating.toFixed(1)}</span>
            <span className="tag">Отзывы {crm.operator.totalReviews}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="metric" style={{ minWidth: 180 }}>
            <div className="k">Паломников за сезон</div>
            <div className="v">{crm.pilgrims.length}</div>
            <div className="delta" style={{ color: "var(--emerald)" }}>live CRM</div>
          </div>
        </div>
      </div>

      <div className="co-stats">
        {stats.map((item) => (
          <div key={item.label} className="co-stat">
            <div className="k">{item.label}</div>
            <div className="v">{item.value}</div>
            <div className="d">{item.detail}</div>
          </div>
        ))}
      </div>

      <div className="co-grid">
        <div>
          <h3 className="cx-h">Реквизиты</h3>
          <dl className="cx-dl">
            <dt>Полное наименование</dt>
            <dd>ТОО «{crm.operator.companyName}»</dd>
            <dt>Лицензия</dt>
            <dd className="license">{crm.operator.licenseNumber}</dd>
            <dt>Юр. адрес</dt>
            <dd>{crm.operator.address || "Алматы, Абая 44, офис 312"}</dd>
            <dt>Телефон</dt>
            <dd>{crm.operator.phone || "+7 727 311 42 00"}</dd>
            <dt>Описание</dt>
            <dd>{crm.operator.description}</dd>
          </dl>

          <h3 className="cx-h" style={{ marginTop: 32 }}>Лицензии и сертификаты</h3>
          <div className="lic-row">
            {companyLicenses.map((item) => (
              <div key={item.title} className="lic-card">
                <div className="eyebrow">{item.title}</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 6 }}>{item.label}</div>
                <div style={{ color: "var(--muted)", fontSize: 12, margin: "8px 0" }}>{item.body}</div>
                <div style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600 }}>{item.meta}</div>
              </div>
            ))}
          </div>

          <h3 className="cx-h" style={{ marginTop: 32 }}>Команда · {companyTeam.length} человек</h3>
          <div className="team-row">
            {companyTeam.map((member) => (
              <div key={member.name} className="tm">
                <div className="ta" style={{ background: member.tone, color: "var(--cream)" }}>{member.initials}</div>
                <div>
                  <div className="tn">{member.name}</div>
                  <div className="tr">{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="co-side">
          <h4>Контакты</h4>
          <div className="cc"><span className="cl">Телефон</span><a href="#">{crm.operator.phone || "+7 727 311 42 00"}</a></div>
          <div className="cc"><span className="cl">Email</span><a href="#">hajj@alsafa.kz</a></div>
          <div className="cc"><span className="cl">Сайт</span><a href="#">alsafa-hajj.kz</a></div>
          <div className="cc" style={{ borderBottom: 0 }}><span className="cl">Офис</span><a href="#">{crm.operator.address || "Абая 44 · карта"}</a></div>
        </aside>
      </div>
    </>
  );
}
