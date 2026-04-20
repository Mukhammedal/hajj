import {
  adminApiKeys,
  adminDangerLinks,
  adminProfileAudit,
  adminProfilePermissions,
  adminProfileSessions,
} from "@/lib/design-admin";

export default function AdminProfilePage() {
  return (
    <>
      <div className="app-topbar">
        <h2>
          Администратор <em>платформы</em>
        </h2>
        <div className="right">
          <span className="tag" style={{ background: "#2a2418", borderColor: "#3a3224", color: "var(--gold-soft)" }}>
            2FA · Yubikey
          </span>
          <button className="btn btn-ghost btn-sm" type="button">
            Смена пароля
          </button>
          <button className="btn btn-dark btn-sm" type="button">
            Редактировать
          </button>
        </div>
      </div>

      <div className="adm-hero">
        <div className="adm-left">
          <div className="adm-ava">АД</div>
          <div>
            <div className="eyebrow" style={{ color: "var(--gold-soft)", marginBottom: 6 }}>
              Super Admin · level 5 · ID SYS-001
            </div>
            <h1 className="adm-name">Алихан Дауренов</h1>
            <div className="adm-role">Founder &amp; CTO · HajjCRM</div>
            <div className="adm-tags">
              {["полный доступ", "с 2024 года", "2FA · Yubikey"].map((item) => (
                <span
                  className="tag"
                  key={item}
                  style={{ background: "rgba(168,135,66,.2)", borderColor: "rgba(168,135,66,.3)", color: "var(--gold-soft)" }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="adm-right">
          <div className="adm-stat">
            <div className="k">Последний вход</div>
            <div className="v">5 мин назад</div>
            <div className="d">Алматы · Chrome · MacBook</div>
          </div>
          <div className="adm-stat">
            <div className="k">Активных сессий</div>
            <div className="v">2</div>
            <div className="d">2 устройства</div>
          </div>
          <div className="adm-stat">
            <div className="k">Аудит-логов</div>
            <div className="v">2 840</div>
            <div className="d">за 30 дней</div>
          </div>
        </div>
      </div>

      <div className="pp-tabs">
        {["Обзор", "Роли и разрешения", "Сессии и устройства", "Аудит действий", "API-ключи", "Резервные коды", "Зона опасности"].map(
          (item, index) => (
            <a className={index === 0 ? "on" : ""} href="#top" key={item}>
              {item}
            </a>
          ),
        )}
      </div>

      <div className="pp-grid">
        <div className="pp-main">
          <section className="pp-card">
            <div className="pp-card-h">
              <h3>Разрешения и области</h3>
              <span className="tag emerald">Super Admin</span>
            </div>
            <div className="perm-grid">
              {adminProfilePermissions.map(([title, tags]) => (
                <div className="perm" key={title}>
                  <div className="p-t">{title}</div>
                  <div className="p-l">
                    {tags.map((tag) => (
                      <span className={`tag ${tag.includes("warning") || tag.includes("MFA") || tag.includes("read-only") ? "warning" : "success"}`} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pp-card">
            <div className="pp-card-h">
              <h3>Активные сессии</h3>
              <a className="ed" href="#top" style={{ color: "var(--danger)" }}>
                выйти на всех устройствах
              </a>
            </div>
            <div className="sess-list">
              {adminProfileSessions.map((session, index) => (
                <div className={`sess ${index === 0 ? "active" : ""}`} key={session.title}>
                  <div className="se-i">{session.icon}</div>
                  <div className="se-b">
                    <b>{session.title}</b>
                    <span>{session.meta}</span>
                  </div>
                  {"badge" in session ? (
                    <span className={`tag ${session.badgeTone === "success" ? "success" : ""}`}>{session.badge}</span>
                  ) : (
                    <a className="ed" href="#top">
                      {session.action}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="pp-card">
            <div className="pp-card-h">
              <h3>Аудит-лог · последние 10 действий</h3>
              <a className="ed" href="#top">
                весь журнал
              </a>
            </div>
            <table className="audit">
              <thead>
                <tr>
                  <th>Время</th>
                  <th>Действие</th>
                  <th>Объект</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {adminProfileAudit.map(([time, op, target, ip, tone]) => (
                  <tr key={`${time}-${op}`}>
                    <td className="tm">{time}</td>
                    <td>
                      <span className={`op ${tone}`}>{op}</span>
                    </td>
                    <td>{target}</td>
                    <td className="ip">{ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="pp-side">
          <div className="pp-side-card dark">
            <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              Безопасность · оценка
            </div>
            <div className="sec-score">
              <div className="ss-num">
                94<span>/100</span>
              </div>
              <div className="ss-ring">
                <div className="ss-r" style={{ width: "94%" }}></div>
              </div>
            </div>
            <div className="sec-list">
              <div className="sl ok">✓ 2FA через Yubikey</div>
              <div className="sl ok">✓ Резервные коды — в безопасности</div>
              <div className="sl ok">✓ Уникальный пароль</div>
              <div className="sl ok">✓ IP-ограничения — 3 страны</div>
              <div className="sl todo">○ Обновить recovery email (3 мес)</div>
            </div>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">API-ключи</div>
            <div className="apikeys">
              {adminApiKeys.map(([label, value]) => (
                <div className="ak" key={label}>
                  <b>{label}</b>
                  <span className="license">{value}</span>
                  <a href="#top">ротировать</a>
                </div>
              ))}
            </div>
            <a className="pp-side-btn" href="#top">
              + Создать новый ключ
            </a>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">Контакты</div>
            <dl className="pp-dl" style={{ gridTemplateColumns: "110px 1fr" }}>
              <dt>Email</dt>
              <dd>alikhan@hajjcrm.kz</dd>
              <dt>Телефон</dt>
              <dd>+7 701 567 89 00</dd>
              <dt>Recovery</dt>
              <dd>a.d.backup@proton.me</dd>
              <dt>Офис</dt>
              <dd>Алматы · пр. Достык 180</dd>
            </dl>
          </div>

          <div className="pp-side-card danger">
            <div className="eyebrow" style={{ color: "var(--danger)" }}>
              Зона опасности
            </div>
            <div className="danger-list">
              {adminDangerLinks.map((item) => (
                <a href="#top" key={item}>
                  {item}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
