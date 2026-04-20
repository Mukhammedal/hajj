import { CrmTopbar } from "@/components/crm/crm-topbar";
import { settingsIntegrations } from "@/lib/design-crm";

export default function CrmSettingsPage() {
  return (
    <>
      <CrmTopbar
        title={
          <>
            Настройки <em>рабочего пространства.</em>
          </>
        }
        actions={
          <>
            <span style={{ color: "var(--muted)", fontSize: 12 }}>Последнее сохранение · 14:32</span>
            <a className="btn btn-dark btn-sm" href="#">
              Сохранить
            </a>
          </>
        }
      />

      <div className="set-split">
        <nav className="set-nav">
          <a className="on" href="#">Общие</a>
          <a href="#">Команда и роли <span className="c">8</span></a>
          <a href="#">Уведомления</a>
          <a href="#">Интеграции <span className="c">5</span></a>
          <a href="#">Финансы и налоги</a>
          <a href="#">Шаблоны договоров</a>
          <a href="#">Безопасность</a>
          <a href="#">API-ключи</a>
          <a href="#">Биллинг</a>
          <a href="#" style={{ color: "var(--danger)" }}>Опасная зона</a>
        </nav>

        <div>
          <section className="set-section">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Общие параметры</div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Язык рабочего пространства</div>
                <div className="sub">Основной язык интерфейса и коммуникации.</div>
              </div>
              <div className="ctl">
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <span className="chip on">Русский</span>
                  <span className="chip">Қазақша</span>
                  <span className="chip">English</span>
                </div>
              </div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Часовой пояс</div>
                <div className="sub">Используется для напоминаний, отчётов и временных штампов.</div>
              </div>
              <div className="ctl">Asia/Almaty · UTC+5</div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Валюта по умолчанию</div>
                <div className="sub">Базовая валюта договоров и отчётности.</div>
              </div>
              <div className="ctl">₸ Казахстанский тенге</div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Формат даты</div>
                <div className="sub">Как показывать дату паломникам и в отчётах.</div>
              </div>
              <div className="ctl">15 июня 2026</div>
            </div>
          </section>

          <section className="set-section">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Религиозный контекст</div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Отображать Hijri-дату</div>
                <div className="sub">Вторая дата рядом с григорианской.</div>
              </div>
              <div className="ctl"><div className="toggle on"><div className="kn" /></div></div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Время намаза · Алматы</div>
                <div className="sub">Напоминания куратору и пауза во время молитвы.</div>
              </div>
              <div className="ctl"><div className="toggle on"><div className="kn" /></div></div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Памятки и дуа в кабинете паломника</div>
                <div className="sub">Показывать рекомендации перед вылетом и в ходе хаджа.</div>
              </div>
              <div className="ctl"><div className="toggle on"><div className="kn" /></div></div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Метод расчёта намаза</div>
                <div className="sub">Используется в виджете и внутренних расписаниях команды.</div>
              </div>
              <div className="ctl">ДУМК · Алматы</div>
            </div>
          </section>

          <section className="set-section">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Активные интеграции · 5 из 12</div>
            <div className="int-list">
              {settingsIntegrations.map((item) => (
                <div key={item.name} className="int">
                  <div className="il" style={item.code === "MDA" ? { background: "var(--cream-2)", color: "var(--muted)" } : undefined}>{item.code}</div>
                  <div className="iw">
                    <div className="in">{item.name}</div>
                    <div className="id">{item.description}</div>
                  </div>
                  <span className={`tag ${item.tone}`}>{item.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="set-section">
            <div className="eyebrow" style={{ marginBottom: 14 }}>API-ключи</div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Production ключ</div>
                <div className="sub license">sk_live_A7kP··················2mQ3</div>
              </div>
              <div className="ctl">
                <a href="#" style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600 }}>
                  Перегенерировать
                </a>
              </div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Webhook · платежи</div>
                <div className="sub license">https://api.alsafa-hajj.kz/webhooks/payment</div>
              </div>
              <div className="ctl">
                <span className="tag success">200 OK · 12s ago</span>
              </div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">CLI ключ</div>
                <div className="sub license">sk_cli_A9mP··················7sQ2</div>
              </div>
              <div className="ctl">
                <a href="#" style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600 }}>
                  Ротировать
                </a>
              </div>
            </div>
          </section>

          <section className="set-section">
            <div className="eyebrow" style={{ marginBottom: 14 }}>Биллинг</div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Текущий тариф</div>
                <div className="sub">Business · 60 квот · 8 сотрудников · все интеграции.</div>
              </div>
              <div className="ctl">8 420 000 ₸ MRR</div>
            </div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Следующее списание</div>
                <div className="sub">Платёжный профиль обновлён 18.04.2026.</div>
              </div>
              <div className="ctl">01.05.2026</div>
            </div>
          </section>

          <section className="set-section">
            <div className="eyebrow" style={{ color: "var(--danger)", marginBottom: 14 }}>Опасная зона</div>
            <div className="set-row">
              <div className="l">
                <div className="ttl">Отключить workspace</div>
                <div className="sub">Закроет CRM для команды и остановит все cron-интеграции.</div>
              </div>
              <div className="ctl" style={{ color: "var(--danger)" }}>Требует подтверждения</div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
