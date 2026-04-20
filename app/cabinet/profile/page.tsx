import Link from "next/link";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import {
  buildProfileHealthRows,
  buildProfileHeroMeta,
  buildProfilePassportRows,
  buildProfilePersonalRows,
  buildProfileSummaryTags,
} from "@/lib/design-cabinet";
import { loadCabinetBundle, loadOperatorPublicProfile } from "@/lib/data/hajj-loaders";
import { formatDate, initials } from "@/lib/format";

export default async function CabinetProfilePage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet) {
    return null;
  }

  const { pilgrim, group, payment, documents, readiness } = cabinet;
  const operatorProfile = await loadOperatorPublicProfile(pilgrim.operatorId);
  const heroMeta = buildProfileHeroMeta(pilgrim, group);
  const summaryTags = buildProfileSummaryTags(documents, payment, group);
  const personalRows = buildProfilePersonalRows(pilgrim);
  const passportRows = buildProfilePassportRows(pilgrim);
  const healthRows = buildProfileHealthRows(documents);
  const passportScan = documents.find((document) => document.type === "passport");
  const progressOffset = 377 - (377 * readiness.readinessPercent) / 100;

  return (
    <>
      <CabinetTopbar
        actions={
          <>
            <Link className="btn btn-ghost btn-sm" href="/cabinet/contract">
              Скачать все данные
            </Link>
            <Link className="btn btn-dark btn-sm" href="/cabinet/chat">
              Редактировать
            </Link>
          </>
        }
        title={
          <>
            Мой <em>профиль</em>
          </>
        }
      />

      <div className="pp-hero">
        <div className="pp-ava">{initials(pilgrim.fullName)}</div>
        <div className="pp-body">
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Паломник · ID {heroMeta.identifier}
          </div>
          <h1 className="pp-name">{pilgrim.fullName}</h1>
          <div className="pp-meta">
            <span>{group?.departureCity ?? "Алматы"}</span>
            <i>·</i>
            <span>{heroMeta.ageLabel}</span>
            <i>·</i>
            <span>впервые совершает хадж</span>
            <i>·</i>
            <span style={{ color: "var(--emerald)", fontWeight: 600 }}>{heroMeta.countdown}</span>
          </div>
          <div className="pp-tags">
            {summaryTags.map((tag) => (
              <span
                key={tag}
                className={
                  tag.startsWith("Документы")
                    ? "tag success"
                    : tag.startsWith("Платёж")
                      ? "tag warning"
                      : tag.startsWith("Группа")
                        ? "tag emerald"
                        : "tag"
                }
              >
                {tag.startsWith("Документы") ? `✓ ${tag}` : tag}
              </span>
            ))}
            <span className="tag">Место 14B · Saudia SV-772</span>
          </div>
        </div>
        <div className="pp-progress">
          <svg height="140" viewBox="0 0 140 140" width="140">
            <circle cx="70" cy="70" fill="none" r="60" stroke="var(--cream-2)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              fill="none"
              r="60"
              stroke="var(--emerald)"
              strokeDasharray="377"
              strokeDashoffset={progressOffset}
              strokeLinecap="round"
              strokeWidth="10"
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="pp-prog-num">
            {readiness.readinessPercent}
            <span>%</span>
          </div>
          <div className="pp-prog-lbl">
            готовность
            <br />к хаджу
          </div>
        </div>
      </div>

      <div className="pp-tabs">
        <a className="on" href="#overview">
          Обзор
        </a>
        <a href="#personal">Личные данные</a>
        <a href="#passport">Паспорт и виза</a>
        <a href="#health">Здоровье</a>
        <a href="#contacts">Контакты</a>
        <a href="#settings">Безопасность</a>
        <a href="#history">История хаджа</a>
      </div>

      <div className="pp-grid" id="overview">
        <div className="pp-main">
          <section className="pp-card" id="personal">
            <div className="pp-card-h">
              <h3>Личные данные</h3>
              <a className="ed" href="#settings">
                редактировать
              </a>
            </div>
            <dl className="pp-dl">
              {personalRows.map(([label, value]) => (
                <div key={label} style={{ display: "contents" }}>
                  <dt>{label}</dt>
                  <dd className={label === "ИИН" ? "license" : undefined}>{value}</dd>
                </div>
              ))}
              <dt>Место рождения</dt>
              <dd>г. {group?.departureCity ?? "Алматы"}, Республика Казахстан</dd>
              <dt>Семейное положение</dt>
              <dd>женат · едет с семьёй по программе оператора</dd>
            </dl>
          </section>

          <section className="pp-card" id="passport">
            <div className="pp-card-h">
              <h3>Паспорт и виза</h3>
              <span className="tag success">✓ Верифицировано</span>
            </div>
            <div className="doc-split">
              <div className="doc-card">
                <div className="dc-h">
                  <div className="dc-t">Загранпаспорт РК</div>
                  <span className="tag success">действителен</span>
                </div>
                <div className="dc-kv">
                  {passportRows.passport.map(([label, value]) => (
                    <div key={label} style={{ display: "contents" }}>
                      <span>{label}</span>
                      <b className={label === "Номер" ? "license" : undefined}>{value}</b>
                    </div>
                  ))}
                </div>
                {passportScan ? (
                  <Link className="ed" href={passportScan.fileUrl} target="_blank">
                    открыть скан →
                  </Link>
                ) : (
                  <span className="ed">скан ещё не загружен</span>
                )}
              </div>

              <div className="doc-card">
                <div className="dc-h">
                  <div className="dc-t">Виза хаджа 1447</div>
                  <span className={payment?.status === "paid" ? "tag success" : "tag warning"}>
                    {payment?.status === "paid" ? "готова" : "в обработке"}
                  </span>
                </div>
                <div className="dc-kv">
                  {passportRows.visa.map(([label, value]) => (
                    <div key={label} style={{ display: "contents" }}>
                      <span>{label}</span>
                      <b className={label === "Номер заявки" ? "license" : undefined}>{value}</b>
                    </div>
                  ))}
                </div>
                <Link className="ed" href="/cabinet/contract">
                  статус заявки →
                </Link>
              </div>
            </div>
          </section>

          <section className="pp-card" id="health">
            <div className="pp-card-h">
              <h3>Здоровье и прививки</h3>
              <span className="tag warning">{healthRows.filter((item) => !item.done).length} осталось</span>
            </div>
            <div className="vac-list">
              {healthRows.map((item) => (
                <div key={item.title} className={item.done ? "vac done" : "vac todo"}>
                  <div className="vi">{item.done ? "✓" : "○"}</div>
                  <div className="vb">
                    <div className="vn">{item.title}</div>
                    <div className="vs">{item.meta}</div>
                  </div>
                  <span className={item.done ? "tag success" : "tag warning"}>{item.done ? "готово" : "до 01.05"}</span>
                </div>
              ))}
            </div>
            <div className="pp-card-sub">
              <div className="pcs-h">Особенности и аллергии</div>
              <div className="pcs-b">
                <span className="chip-sm">Гипертония · лёгкая</span>
                <span className="chip-sm">Аллергия: пенициллин</span>
                <span className="chip-sm">Группа крови: A (II) Rh+</span>
                <span className="chip-sm">Страховка хадж-мед · Jusan</span>
              </div>
            </div>
          </section>

          <section className="pp-card" id="history">
            <div className="pp-card-h">
              <h3>История паломничества</h3>
              <a className="ed" href="#overview">
                все записи
              </a>
            </div>
            <div className="hist-line">
              <div className="hi">
                <div className="hd">{new Date().getFullYear()}</div>
                <div className="hb">
                  <b>
                    Хадж · {group?.name ?? "Рамазан-2026"} <span className="tag emerald" style={{ marginLeft: 6 }}>предстоит</span>
                  </b>
                  <span>
                    {operatorProfile?.operator.companyName ?? "Al-Safa Hajj Travel"} · {group ? `${formatDate(group.flightDate)} – ${formatDate(group.returnDate)}` : "даты уточняются"}
                  </span>
                </div>
              </div>
              <div className="hi">
                <div className="hd">2022</div>
                <div className="hb">
                  <b>Малая умра</b>
                  <span>Al-Hayah Tour · 9 дней · Рамадан · 2 человека</span>
                </div>
              </div>
              <div className="hi">
                <div className="hd">2018</div>
                <div className="hb">
                  <b>Умра</b>
                  <span>Sapa Tour · 7 дней · октябрь</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="pp-side">
          <div className="pp-side-card" id="contacts">
            <div className="eyebrow">Куратор</div>
            <div className="pp-curator">
              <div className="av">{initials(group?.guideName || "Бауыржан Темирханов")}</div>
              <div>
                <b>{group?.guideName || "Бауыржан Темирханов"}</b>
                <span>{operatorProfile?.operator.companyName ?? "Al-Safa Travel"} · 12 лет опыта</span>
              </div>
            </div>
            <Link className="pp-side-btn" href="/cabinet/chat">
              Написать куратору →
            </Link>
            <div className="pp-curator-kv">
              <div>
                <span>отвечает в среднем</span>
                <b>12 мин</b>
              </div>
              <div>
                <span>языки</span>
                <b>KZ · RU · AR</b>
              </div>
            </div>
          </div>

          <div className="pp-side-card">
            <div className="eyebrow">Экстренные контакты</div>
            <div className="pp-ec">
              <div>
                <b>Сауле М. (супруга)</b>
                <span>едет в той же группе · +7 701 222 33 44</span>
              </div>
              <div>
                <b>Нурлан М. (сын)</b>
                <span>Алматы · +7 747 555 00 22</span>
              </div>
              <div>
                <b>Посольство РК в КСА</b>
                <span>Эр-Рияд · +966 11 480 12 90</span>
              </div>
            </div>
          </div>

          <div className="pp-side-card" id="settings">
            <div className="eyebrow">Настройки</div>
            <div className="pp-toggle-list">
              <div className="pt">
                <span>Уведомления по WhatsApp</span>
                <div className="toggle on">
                  <div className="kn" />
                </div>
              </div>
              <div className="pt">
                <span>Email-дайджест</span>
                <div className="toggle on">
                  <div className="kn" />
                </div>
              </div>
              <div className="pt">
                <span>Делиться прогрессом с группой</span>
                <div className="toggle off">
                  <div className="kn" />
                </div>
              </div>
              <div className="pt">
                <span>Показывать Hijri-даты</span>
                <div className="toggle on">
                  <div className="kn" />
                </div>
              </div>
            </div>
          </div>

          <div className="pp-side-card emerald">
            <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              Баракат
            </div>
            <p style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 13, lineHeight: 1.6, color: "var(--cream)", margin: "10px 0 0" }}>
              «Пусть Аллах примет ваш хадж. Пусть он будет хаджем мабрур — принятым, без греха и без вреда.»
            </p>
            <div style={{ fontSize: 11, color: "var(--gold-soft)", marginTop: 8, letterSpacing: 0.5 }}>— команда {operatorProfile?.operator.companyName ?? "Al-Safa"}</div>
          </div>
        </aside>
      </div>
    </>
  );
}
