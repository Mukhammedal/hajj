import {
  exportDelivery,
  exportEntities,
  exportFormats,
  exportHeatLevels,
  exportHistory,
  exportMonths,
  exportQuickRanges,
  exportSummaryRows,
} from "@/lib/design-admin";

export default function AdminExportPage() {
  const exportOptions = [
    { copy: "900815 50•••• · N01234••• — GDPR-безопасно", enabled: true, title: "Маскировать ИИН и паспорта" },
    { copy: "с отметкой archived_at и причиной", enabled: false, title: "Включать удалённых паломников" },
    { copy: "AES-256 · пароль придёт на recovery email", enabled: true, title: "Зашифровать архив паролем" },
    { copy: "отдельный sheet с логом кто-когда-что менял", enabled: true, title: "Приложить Audit Trail" },
  ] as const;

  return (
    <>
      <div className="app-topbar">
        <h2>
          Экспорт <em>данных</em>
        </h2>
        <div className="right">
          <span className="tag" style={{ background: "#2a2418", borderColor: "#3a3224", color: "var(--gold-soft)" }}>
            🔒 Только Super Admin
          </span>
          <button className="btn btn-ghost btn-sm" type="button">
            История экспортов
          </button>
          <button className="btn btn-ghost btn-sm" type="button">
            Планировщик
          </button>
        </div>
      </div>

      <div className="exp-banner">
        <div className="exp-banner-i">🔒</div>
        <div className="exp-banner-b">
          <b>Персональные данные паломников</b>
          <span>
            Экспорт содержит ФИО, ИИН, паспорта, телефоны и финансовые операции. Каждая выгрузка логируется в аудит с вашим
            ID, IP и обоснованием. Храните файлы зашифрованными.
          </span>
        </div>
        <button className="exp-banner-btn" type="button">
          ✓ Согласен, продолжить
        </button>
      </div>

      <div className="exp-wrap">
        <div className="exp-main">
          <section className="exp-card">
            <div className="exp-card-h">
              <div className="exp-step">01</div>
              <div>
                <h3>Что выгружаем</h3>
                <span>выберите сущность или несколько сразу</span>
              </div>
            </div>
            <div className="entity-grid">
              {exportEntities.map(([title, copy, count, selected]) => (
                <label className={`ent ${selected ? "on" : ""}`} key={title}>
                  <input defaultChecked={selected} type="checkbox" />
                  <div className="ent-b">
                    <div className="ent-t">{title}</div>
                    <div className="ent-c">{copy}</div>
                    <div className="ent-n">{count}</div>
                  </div>
                  <span className="ent-chk">{selected ? "✓" : "+"}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="exp-card">
            <div className="exp-card-h">
              <div className="exp-step">02</div>
              <div>
                <h3>Период</h3>
                <span>за какой промежуток времени выгрузить данные</span>
              </div>
            </div>

            <div className="period-tabs">
              <button className="per on" type="button">
                За всё время
              </button>
              <button className="per" type="button">
                Год
              </button>
              <button className="per" type="button">
                Месяц
              </button>
              <button className="per" type="button">
                Неделя
              </button>
              <button className="per" type="button">
                Сегодня
              </button>
              <button className="per on-range" type="button">
                Свой период
              </button>
            </div>

            <div className="period-body year">
              <div className="per-h">Год</div>
              <div className="year-list">
                {["2023", "2024", "2025 · 1446", "2026 · 1447"].map((year, index) => (
                  <button className={`yr ${index === 2 ? "on" : ""}`} key={year} type="button">
                    {year}
                  </button>
                ))}
              </div>
              <div className="per-note">
                Будут выгружены все данные с 01.01.2025 по 31.12.2025 включительно. 2025 год — хадж 1446 (Зульхиджа
                июнь).
              </div>
            </div>

            <div className="period-body month">
              <div className="per-h">Месяц</div>
              <div className="mon-row">
                <select className="mon-sel" defaultValue="2026">
                  <option>2025</option>
                  <option>2026</option>
                </select>
                <div className="mon-list">
                  {exportMonths.map((month, index) => (
                    <button className={`mn ${index === 3 ? "on" : index > 3 ? "disabled" : ""}`} key={month} type="button">
                      {month}
                    </button>
                  ))}
                </div>
              </div>
              <div className="per-note">Апрель 2026 · будет выгружено 437 записей с 01.04 по 30.04 включая сегодняшний день.</div>
            </div>

            <div className="period-body week">
              <div className="per-h">Неделя</div>
              <div className="wk-list">
                {[
                  "16 (14–20 апр) | прошлая",
                  "17 (21–27 апр) | текущая",
                  "18 (28 апр – 4 мая)",
                  "19 (5–11 мая)",
                ].map((week, index) => {
                  const [title, note] = week.split(" | ");
                  return (
                    <button className={`wk ${index === 1 ? "on" : ""}`} key={week} type="button">
                      {title}
                      {note ? <span>{note}</span> : null}
                    </button>
                  );
                })}
              </div>
              <div className="per-note">
                Неделя 17 · 21–27 апреля 2026. С начала недели прошло 0 полных дней (сегодня понедельник). Будет
                выгружено 18 записей.
              </div>
            </div>

            <div className="period-body range open">
              <div className="per-h">Свой период</div>
              <div className="range-row">
                <div className="rng-fld">
                  <label>С</label>
                  <div className="rng-in">01.01.2026</div>
                </div>
                <div className="rng-arrow">→</div>
                <div className="rng-fld">
                  <label>По</label>
                  <div className="rng-in">20.04.2026</div>
                </div>
                <div className="rng-dur">
                  <span>длительность</span>
                  <b>110 дней</b>
                </div>
              </div>

              <div className="quick-ranges">
                <span>Быстро:</span>
                {exportQuickRanges.map((item) => (
                  <button className={item === "С начала года" ? "on" : ""} key={item} type="button">
                    {item}
                  </button>
                ))}
              </div>

              <div className="cal-heat">
                <div className="heat-h">
                  <span>активность за выбранный период · 110 дней</span>
                  <div className="legend">
                    <span>0</span>
                    <i className="h0"></i>
                    <i className="h1"></i>
                    <i className="h2"></i>
                    <i className="h3"></i>
                    <i className="h4"></i>
                    <span>50+</span>
                  </div>
                </div>
                <div className="heat-grid">
                  {exportHeatLevels.map((level, index) => (
                    <i className={`h${level}`} key={`${level}-${index}`}></i>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="exp-card">
            <div className="exp-card-h">
              <div className="exp-step">03</div>
              <div>
                <h3>Формат и структура</h3>
                <span>как и в каком виде сохранить выгрузку</span>
              </div>
            </div>

            <div className="fmt-grid">
              {exportFormats.map(([ext, title, copy, selected]) => (
                <label className={`fmt ${selected ? "on" : ""}`} key={title}>
                  <input defaultChecked={selected} name="format" type="radio" />
                  <div className="fmt-ic">{ext}</div>
                  <b>{title}</b>
                  <span>{copy}</span>
                </label>
              ))}
            </div>

            <div className="opts">
              <div className="opt-row">
                <div className="opt-k">Язык</div>
                <div className="opt-v">
                  <button className="pick on" type="button">
                    Русский
                  </button>
                  <button className="pick" type="button">
                    Қазақша
                  </button>
                  <button className="pick" type="button">
                    English
                  </button>
                </div>
              </div>
              <div className="opt-row">
                <div className="opt-k">Даты</div>
                <div className="opt-v">
                  <button className="pick on" type="button">
                    DD.MM.YYYY
                  </button>
                  <button className="pick" type="button">
                    ISO 8601
                  </button>
                  <button className="pick" type="button">
                    Hijri · 1447
                  </button>
                </div>
              </div>
              <div className="opt-row">
                <div className="opt-k">Суммы</div>
                <div className="opt-v">
                  <button className="pick on" type="button">
                    ₸ тенге
                  </button>
                  <button className="pick" type="button">
                    $ USD
                  </button>
                  <button className="pick" type="button">
                    ﷼ SAR
                  </button>
                  <span className="note">курс на дату операции · 489.2 ₸/$ сегодня</span>
                </div>
              </div>
              <div className="opt-row">
                <div className="opt-k">Группировка</div>
                <div className="opt-v">
                  <button className="pick" type="button">
                    Плоская
                  </button>
                  <button className="pick on" type="button">
                    По месяцам
                  </button>
                  <button className="pick" type="button">
                    По операторам
                  </button>
                  <button className="pick" type="button">
                    По группам/турам
                  </button>
                </div>
              </div>
            </div>

            <div className="opts">
              {exportOptions.map((option) => (
                <div className="toggle-row" key={option.title}>
                  <div>
                    <b>{option.title}</b>
                    <span>{option.copy}</span>
                  </div>
                  <div className={`toggle ${option.enabled ? "on" : "off"}`}>
                    <div className="kn"></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="exp-card">
            <div className="exp-card-h">
              <div className="exp-step">04</div>
              <div>
                <h3>Доставка и расписание</h3>
                <span>как получить файл · разово или автоматически</span>
              </div>
            </div>
            <div className="deliv-grid">
              {exportDelivery.map(([icon, title, copy, selected]) => (
                <label className={`dv ${selected ? "on" : ""}`} key={title}>
                  <input defaultChecked={selected} name="delivery" type="radio" />
                  <div className="dv-ic">{icon}</div>
                  <b>{title}</b>
                  <span>{copy}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="exp-card">
            <div className="exp-card-h">
              <div className="exp-step" style={{ background: "#eee7d5", color: "var(--muted)" }}>
                Ⅰ
              </div>
              <div>
                <h3>Недавние экспорты</h3>
                <span>последние 10 выгрузок · все действия в аудите</span>
              </div>
              <a href="#top" style={{ color: "var(--muted)", fontSize: 11, letterSpacing: 0.5, marginLeft: "auto", textDecoration: "none", textTransform: "uppercase" }}>
                весь журнал →
              </a>
            </div>
            <table className="exp-hist">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Период</th>
                  <th>Сущности</th>
                  <th>Формат</th>
                  <th>Размер</th>
                  <th>Инициатор</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {exportHistory.map(([date, time, period, entities, format, size, who, action, expired]) => (
                  <tr className={expired ? "expired" : ""} key={`${date}-${period}`}>
                    <td className="dt">
                      {date}
                      <br />
                      <span>{time}</span>
                    </td>
                    <td>{period}</td>
                    <td>{entities}</td>
                    <td>
                      <span className="fmt-pill">{format}</span>
                    </td>
                    <td>{size}</td>
                    <td>
                      <span className="who">{who}</span>
                    </td>
                    <td>{expired ? <span className="exp">{action}</span> : <a href="#top">{action}</a>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <aside className="exp-side">
          <div className="exp-sticky">
            <div className="pp-side-card">
              <div className="sum-title">Сводка выгрузки</div>
              <div className="sum-num">
                12.8 МБ
                <span>оценочный размер</span>
              </div>
              <div className="sum-list">
                {exportSummaryRows.map(([label, value]) => (
                  <div className="sl" key={label}>
                    <span>{label}</span>
                    <b>{value}</b>
                  </div>
                ))}
              </div>
              <div className="sum-divider"></div>
              <div className="sum-size">
                <div className="ss-k">Время генерации</div>
                <div className="ss-v">
                  00:42 <small>sec</small>
                </div>
                <div className="ss-t">при текущем объёме и включённом шифровании</div>
              </div>
              <button className="exp-go" type="button">
                Сформировать экспорт
              </button>
              <a className="exp-sec" href="#top">
                Сохранить как шаблон
              </a>
              <div className="sum-warn">
                <b>Audit Notice</b>
                <span>
                  После запуска будет создана запись в журнале безопасности с вашим `user_id`, IP и параметрами фильтра.
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
