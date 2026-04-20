import { notFound } from "next/navigation";

import { DesignIcon } from "@/components/shell/design-icons";
import { PublicTopbar } from "@/components/shell/public-topbar";
import {
  alSafaGroupRows,
  alSafaPackageIncludes,
  designImages,
  findShowcaseOperator,
} from "@/lib/design-public";
import { loadOperatorPublicProfile } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";

export default async function OperatorProfilePage({ params }: { params: { id: string } }) {
  const profile = await loadOperatorPublicProfile(params.id);

  if (!profile) {
    notFound();
  }

  const showcase = findShowcaseOperator(params.id);
  const { operator, groups, reviews } = profile;
  const priceFrom = showcase?.priceFrom ?? groups[0]?.priceFrom ?? 2850000;
  const quotaLeft = showcase?.quotaLeft ?? Math.max((groups[0]?.quotaTotal ?? 45) - (groups[0]?.quotaFilled ?? 37), 0);
  const quotaTotal = showcase?.quotaTotal ?? groups[0]?.quotaTotal ?? 45;
  const detailGroups =
    params.id === "al-safa-hajj-travel"
      ? alSafaGroupRows
      : groups.map((group) => ({
          name: group.name,
          route: `${group.departureCity} → Джидда`,
          dates: `${new Date(group.flightDate).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })} — ${new Date(group.returnDate).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}`,
          quotaFilled: group.quotaFilled,
          quotaTotal: group.quotaTotal,
          quotaPercent: Math.round((group.quotaFilled / Math.max(group.quotaTotal, 1)) * 100),
          price: group.priceFrom,
        }));
  const isAlSafa = params.id === "al-safa-hajj-travel";
  const aboutText = isAlSafa
    ? "Al-Safa Hajj Travel — казахстанский оператор с аккредитацией ДУМК и Министерства Туризма РК. С 2014 года отправили в хадж и умру более трёх тысяч паломников из Алматы, Астаны и Шымкента. Работаем только с прямыми рейсами Saudia и сертифицированными отелями в Мекке и Медине."
    : operator.description;

  return (
    <div className="page-wrap app-shell">
      <PublicTopbar
        links={[
          { href: "/operators", label: "Операторы" },
          { href: "/#how-it-works", label: "Как это работает" },
        ]}
      />

      <main>
        <div className="cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={designImages.heroKaaba} style={{ height: "100%", inset: 0, objectFit: "cover", position: "absolute", width: "100%" }} />
          <div className="crumbs">
            <a href="/operators">Операторы</a>
            <span>›</span>
            <a href="/operators">{showcase?.city ?? "Алматы"}</a>
            <span>›</span>
            <span style={{ color: "#ede6d4" }}>{operator.companyName}</span>
          </div>
        </div>

        <section className="op-detail-head">
          <div className="op-detail-card">
            <div className="row-tags">
              <span className="tag success">
                <DesignIcon name="check" size={10} /> Верифицирован ДУМК
              </span>
              <span className="tag dark">Премиум</span>
              <span className="tag emerald">12 лет на рынке</span>
              <span className="tag">Лицензия · {operator.licenseNumber}</span>
            </div>
            <h1>
              {operator.companyName.includes("Travel") ? (
                <>
                  {operator.companyName.replace(" Travel", "")} <em>Travel</em>
                </>
              ) : (
                operator.companyName
              )}
            </h1>
            <div className="sub">
              {showcase?.addressLine ?? operator.address} · с 2014 года · 3 240 успешно отправленных паломников
            </div>
            <div className="rating-big">
              <div className="val">{operator.rating.toFixed(1)}</div>
              <div>
                <div className="stars">★★★★★</div>
                <div className="count">{operator.totalReviews} отзывов · 94% рекомендуют</div>
              </div>
            </div>
          </div>

          <div className="price-box">
            <div className="eye">Хадж Рамазан · 2026</div>
            <div className="price">
              <small>От</small>
              {formatKzt(priceFrom)}
            </div>
            <div className="plist">
              <div className="r">
                <span className="k">Длительность</span>
                <span className="v">21 день</span>
              </div>
              <div className="r">
                <span className="k">Ближайший вылет</span>
                <span className="v">{groups[0] ? formatDate(groups[0].flightDate) : "12 июня 2026"}</span>
              </div>
              <div className="r">
                <span className="k">Свободно мест</span>
                <span className="v">{quotaLeft} из {quotaTotal}</span>
              </div>
              <div className="r">
                <span className="k">Рассрочка Kaspi</span>
                <span className="v">0% · до 18 мес</span>
              </div>
            </div>
            <a className="btn btn-gold btn-lg" href="/cabinet/dashboard">
              Оставить заявку <span className="arr">›</span>
            </a>
          </div>
        </section>

        <section className="op-detail-main">
          <div>
            <div className="od-section">
              <h3>О компании</h3>
              <p>{aboutText}</p>
            </div>

            <hr className="div" />

            <div className="od-section">
              <h3>Ближайшие группы</h3>
              <h4>Хадж 2026 · 3 открытые квоты</h4>
              <table className="gr-table">
                <thead>
                  <tr>
                    <th>Группа</th>
                    <th>Маршрут</th>
                    <th>Даты</th>
                    <th>Квота</th>
                    <th style={{ textAlign: "right" }}>Цена</th>
                  </tr>
                </thead>
                <tbody>
                  {detailGroups.map((group) => (
                    <tr key={group.name}>
                      <td>
                        <b>{group.name}</b>
                      </td>
                      <td>{group.route}</td>
                      <td>{group.dates}</td>
                      <td>
                        <div className="quota-mini">
                          <i style={{ width: `${group.quotaPercent}%` }} />
                        </div>
                        {group.quotaFilled} / {group.quotaTotal}
                      </td>
                      <td className="price" style={{ textAlign: "right" }}>
                        {formatKzt(group.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="div" />

            <div className="od-section">
              <h3>Что входит в пакет</h3>
              <div className="included">
                {alSafaPackageIncludes.map((item) => (
                  <div key={item}>
                    <DesignIcon name="check" size={14} />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="license-banner">
              <h5>
                <DesignIcon name="check" size={14} /> Лицензия действительна
              </h5>
              <p>{operator.licenseNumber} · выдана ДУМК 03.01.2026 · действует до 31.12.2026. Проверено сегодня в 08:12.</p>
            </div>

            <div className="contact-block">
              <h6 className="eyebrow" style={{ fontSize: "11px", marginBottom: "12px" }}>
                Контакты
              </h6>
              <div style={{ fontSize: "13px", lineHeight: 1.9 }}>
                <div>{operator.phone || "+7 727 355 00 00"}</div>
                <div>hello@alsafa.kz</div>
                <div>{operator.address || "пр. Абая 150, офис 407"}</div>
                <div>пн–сб · 09:00 — 19:00</div>
              </div>
              <div className="ceo">
                <div className="avatar" style={{ background: "var(--ink)" }}>
                  БТ
                </div>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>Бауыржан Тулегенов</div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", fontStyle: "italic", fontFamily: "var(--f-serif)" }}>
                    Директор · 12 лет опыта
                  </div>
                </div>
              </div>
            </div>

            <div className="card-flat" style={{ background: "var(--paper)" }}>
              <h6 className="eyebrow" style={{ fontSize: "11px", marginBottom: "12px" }}>
                Партнёры
              </h6>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  fontFamily: "var(--f-serif)",
                  fontStyle: "italic",
                  color: "var(--ink-soft)",
                  fontSize: "13px",
                }}
              >
                <span className="tag">SAUDIA</span>
                <span className="tag">Mövenpick</span>
                <span className="tag">Swissôtel</span>
                <span className="tag">Kaspi Bank</span>
              </div>
            </div>

            {reviews.length ? (
              <div className="card-flat" style={{ background: "var(--paper)" }}>
                <h6 className="eyebrow" style={{ fontSize: "11px", marginBottom: "12px" }}>
                  Последние отзывы
                </h6>
                <div style={{ display: "grid", gap: "10px" }}>
                  {reviews.slice(0, 2).map((review) => (
                    <div key={review.id} style={{ borderTop: "1px solid var(--line-soft)", paddingTop: "10px" }}>
                      <div style={{ fontSize: "13px", fontWeight: 600 }}>{review.rating}/5</div>
                      <div style={{ color: "var(--ink-soft)", fontSize: "12px", lineHeight: 1.6 }}>{review.comment}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
