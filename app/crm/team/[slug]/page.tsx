import { notFound } from "next/navigation";

import { CrmTopbar } from "@/components/crm/crm-topbar";
import { companyTeam, managerFeedback, managerSchedule } from "@/lib/design-crm";

export default function CrmTeamProfilePage({ params }: { params: { slug: string } }) {
  if (params.slug !== "bauyrzhan") {
    notFound();
  }

  return (
    <>
      <CrmTopbar
        title={
          <>
            Профиль <em>менеджера</em>
          </>
        }
        actions={
          <>
            <a className="btn btn-ghost btn-sm" href="#">
              Экспорт CV
            </a>
            <a className="btn btn-dark btn-sm" href="#">
              Редактировать
            </a>
          </>
        }
      />

      <div className="mg-hero">
        <div className="mg-ava">БТ</div>
        <div className="mg-body">
          <div className="eyebrow" style={{ marginBottom: 6 }}>Менеджер · ID TM-001</div>
          <h1 className="mg-name">Темирханов Бауыржан Әліұлы</h1>
          <div className="mg-role">Старший куратор · <em>Al-Safa Hajj Travel</em></div>
          <div className="mg-badges">
            <span className="mg-bd"><i>12</i><span>лет в хадж-туризме</span></span>
            <span className="mg-bd"><i>487</i><span>паломников сопроводил</span></span>
            <span className="mg-bd"><i>4.9</i><span>средний рейтинг</span></span>
            <span className="mg-bd"><i>12<small>мин</small></i><span>среднее время ответа</span></span>
          </div>
        </div>
        <div className="mg-status">
          <div className="mg-online"><span className="dot" /> Онлайн · принимает сообщения</div>
          <div className="mg-hours">Сегодня: <b>08:00 – 22:00</b></div>
          <div className="mg-hours">Намаз · <b>Аср в 17:48</b> — пауза 15 мин</div>
        </div>
      </div>

      <div className="pp-tabs">
        <a className="on" href="#">Обзор</a>
        <a href="#">Профиль</a>
        <a href="#">Группы и паломники</a>
        <a href="#">KPI и рейтинг</a>
        <a href="#">График работы</a>
        <a href="#">Доступы</a>
        <a href="#">Логи</a>
      </div>

      <div className="pp-grid">
        <div className="pp-main">
          <section className="pp-card">
            <div className="pp-card-h"><h3>Эффективность · апрель 2026</h3><span className="tag emerald">Top-1 по компании</span></div>
            <div className="kpi-grid">
              {[
                ["Конверсия заявки → договор", "38.4", "%", "82%"],
                ["Время первого ответа", "12", "мин", "88%"],
                ["Собираемость платежей", "94", "%", "94%"],
                ["Рейтинг паломников", "4.9", "/5", "98%"],
              ].map(([label, value, suffix, width]) => (
                <div key={label} className="kpi">
                  <div className="k">{label}</div>
                  <div className="v">{value}<span>{suffix}</span></div>
                  <div className="d ok">лучше целевого</div>
                  <div className="bar"><b style={{ width }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="pp-card">
            <div className="pp-card-h"><h3>Мои группы · 3</h3></div>
            <div className="mg-groups">
              {[
                ["A", "Рамазан-2026", "18 паломников · вылет 18 мая", "90%", "14/18"],
                ["B", "Астана-Премиум", "15 паломников · вылет 25 мая", "75%", "11/15"],
                ["C", "Шымкент-Эконом", "14 паломников · вылет 01 июня", "70%", "8/14"],
              ].map(([code, name, meta, width, ready]) => (
                <div key={name} className="mgr">
                  <div className="mgr-l">{code}</div>
                  <div className="mgr-b">
                    <div className="mgr-h"><b>{name}</b><span className="tag emerald">ведёт группу</span></div>
                    <span>{meta}</span>
                    <div className="mgr-bar"><b style={{ width }} /></div>
                  </div>
                  <div className="mgr-r"><div>готово</div><b>{ready}</b></div>
                </div>
              ))}
            </div>
          </section>

          <section className="pp-card">
            <div className="pp-card-h"><h3>Расписание · ближайшие 7 дней</h3></div>
            <div className="sched">
              {managerSchedule.map((day) => (
                <div key={`${day.day}-${day.note}`} className={`sch-day ${day.today ? "today" : ""} ${day.weekend ? "weekend" : ""}`}>
                  <div className="sd">
                    {day.day}
                    <small>{day.note}</small>
                  </div>
                  <div className={`sb ${day.events.length ? "" : "empty"}`}>
                    {day.events.length ? day.events.map((event) => (
                      <div key={`${day.day}-${event.time}`} className={`ev ${event.type === "urgent" ? "urgent" : event.type === "friday" ? "friday" : ""}`}>
                        <time>{event.time}</time>
                        <span>{event.label}</span>
                      </div>
                    )) : "—"}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pp-card">
            <div className="pp-card-h"><h3>Отзывы паломников</h3></div>
            <div className="fb-list">
              {managerFeedback.map((item) => (
                <div key={item.id} className="fb">
                  <div className="fb-av">{item.initials}</div>
                  <div className="fb-b">
                    <div className="fb-h"><b>{item.name}</b><span>{item.season}</span><span className="stars">★★★★★</span></div>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="pp-side">
          <div className="pp-side-card">
            <div className="eyebrow">Контакты</div>
            <dl className="pp-dl" style={{ gridTemplateColumns: "110px 1fr" }}>
              <dt>Телефон</dt><dd>+7 727 311 42 00</dd>
              <dt>WhatsApp</dt><dd>+7 701 244 18 90</dd>
              <dt>Email</dt><dd>b.temir@alsafa.kz</dd>
              <dt>Офис</dt><dd>Алматы · каб. 312</dd>
            </dl>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">Роль и доступы</div>
            <div className="acc-list">
              {[
                "Админ компании",
                "Управление группами",
                "Финансы · чтение/запись",
                "Договоры · подписание",
                "Настройки интеграций",
                "Отчёты и экспорт",
              ].map((item, index) => (
                <div key={item} className="acc">
                  <span>{item}</span>
                  <span className={`tag ${index < 4 ? "emerald" : ""}`}>{index < 4 ? "✓" : "только чтение"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">Личное</div>
            <dl className="pp-dl" style={{ gridTemplateColumns: "110px 1fr" }}>
              <dt>Город</dt><dd>Алматы</dd>
              <dt>Языки</dt><dd>Русский · Қазақша · عربي basic</dd>
              <dt>График</dt><dd>08:00–22:00</dd>
              <dt>Намаз</dt><dd>Аср · 17:48</dd>
              <dt>Опыт</dt><dd>12 лет</dd>
              <dt>Статус</dt><dd>Онлайн</dd>
            </dl>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">Команда</div>
            <div className="cert-list">
              {companyTeam.slice(0, 3).map((member) => (
                <div key={member.name} className="cert">
                  <b>{member.name}</b>
                  <span>{member.role}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">Сертификаты</div>
            <div className="cert-list">
              <div className="cert"><b>МДА · хадж-2026</b><span>активен до 31.12.2026</span></div>
              <div className="cert"><b>Первая помощь</b><span>обновлён в феврале 2026</span></div>
              <div className="cert"><b>WhatsApp Business</b><span>подтверждённый оператор</span></div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
