import Image from "next/image";
import { notFound } from "next/navigation";

import { PublicTopbar } from "@/components/shell/public-topbar";

const galleryImages = [
  "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
] as const;

const amenities = [
  "Трансфер аэропорт–отель",
  "Трёхразовое халяль-питание",
  "Wi-Fi 120 Мбит/с",
  "Казахоязычный администратор 24/7",
  "Молельные комнаты на этаже",
  "Прачечная самообслуживания",
  "Медпункт в здании",
  "Камера хранения",
  "Инвалидная доступность",
  "Сейф в номере",
] as const;

const facts = [
  ["Расстояние до Харама", "270 м"],
  ["Этажность", "28 этажей"],
  ["Номеров", "412"],
  ["Год открытия", "2010"],
  ["Последняя реновация", "2024"],
  ["Заезд / выезд", "15:00 / 12:00"],
  ["Категория", "5★ (Saudi Hotels Rating)"],
  ["Сертификат ДУМК", "№ 018 · действует"],
] as const;

const roomCards = [
  {
    availability: "12 мест",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80",
    meta: "Базовый · этажи 4–9",
    price: "2 650 000",
    sold: false,
    subtitle: "2 кровати · 24 м² · без вида",
    title: "Standard Twin",
  },
  {
    availability: "7 мест",
    image: "https://images.unsplash.com/photo-1587985064135-0366536eab42?auto=format&fit=crop&w=900&q=80",
    meta: "Рекомендуем · этажи 12–18",
    price: "2 850 000",
    sold: false,
    subtitle: "2 кровати · 32 м² · вид на Каабу",
    title: "Haram View",
  },
  {
    availability: "нет мест",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80",
    meta: "Премиум · этажи 24–26",
    price: "3 480 000",
    sold: true,
    subtitle: "2 кровати + зона · 48 м² · панорама",
    title: "Junior Suite",
  },
] as const;

type ReviewCard = {
  author: string;
  avatar: string;
  avatarClass: string;
  copy: string;
  meta: string;
  score: string;
  stars: number;
  tags: Array<[string, "neg" | "pos"]>;
};

const reviews: ReviewCard[] = [
  {
    author: "Ерлан М.",
    avatar: "ЕМ",
    avatarClass: "",
    copy:
      "Номер Haram View на 14 этаже — из окна видно Каабу и минарет, слышен адан прямо без колонок. Расстояние действительно 270 метров, пешком ровно 4 минуты до King Abdul Aziz Gate. Администратор Бауржан говорит на казахском — оформил документы за 20 минут, помог с коляской для родителей. Бешбармак на ужин раз в неделю — вкус Алматы за 3000 км от дома.",
    meta: "Алматы · совершал хадж в Зульхиджа 1446 (июнь 2025)",
    score: "5.0",
    stars: 5,
    tags: [
      ["Близко к Хараму", "pos"],
      ["Казахоязычный персонал", "pos"],
      ["Халяль-питание", "pos"],
    ],
  },
  {
    author: "Айгүл Н.",
    avatar: "АН",
    avatarClass: "a2",
    copy:
      "Отель хороший, расположение безупречное — всё как обещали. Женский этаж (12-й) с отдельным входом и персоналом-женщинами — очень продуманно, для меня это было важно. Единственное — в номере было душно первые две ночи, кондиционер работал слабо, на третий день инженер пришёл и починил. В ресторане иногда не хватало разнообразия на ужин, повторялись курица с рисом.",
    meta: "Астана · совершала хадж в Зульхиджа 1446 (июнь 2025)",
    score: "4.0",
    stars: 4,
    tags: [
      ["Женский этаж", "pos"],
      ["Безопасно", "pos"],
      ["Слабый кондиционер", "neg"],
    ],
  },
  {
    author: "Марат О.",
    avatar: "МО",
    avatarClass: "a3",
    copy:
      "Ехал с отцом 71 год, переживал за него. Оказалось зря — в отеле есть медпункт с врачом, бесплатно измерили давление, дали препараты когда у отца случился скачок. Лифты работают быстро, не нужно стоять в очереди. Молельная комната на этаже — это находка, не надо каждый раз идти в Харам на обычный намаз. Единственный минус — Wi-Fi в лифтах не ловит, но это мелочь.",
    meta: "Шымкент · совершал хадж в Зульхиджа 1446 (июнь 2025)",
    score: "5.0",
    stars: 5,
    tags: [
      ["Для пожилых", "pos"],
      ["Медпункт", "pos"],
      ["Молельная на этаже", "pos"],
    ],
  },
  {
    author: "Гүлжан С.",
    avatar: "ГС",
    avatarClass: "",
    copy:
      "Расположение хорошее, номер чистый, но в дни Арафа и Муздалифа отель переполнен — завтрак превращается в битву за стол, очереди к лифту по 20 минут. Для этого периода посоветовала бы выбрать более маленький отель подальше. И звукоизоляция между номерами слабая — соседи за стеной мешали спать перед фаджром.",
    meta: "Туркестан · совершала хадж в Зульхиджа 1446 (июнь 2025)",
    score: "3.0",
    stars: 3,
    tags: [
      ["Перегружено в дни Арафа", "neg"],
      ["Слабая звукоизоляция", "neg"],
    ],
  },
] as const;

export default async function HotelDetailPage({ params }: { params: { slug: string } }) {
  if (params.slug !== "hilton-suites-makkah") {
    notFound();
  }

  return (
    <div className="page-wrap">
      <PublicTopbar
        activeHref="/hotels/hilton-suites-makkah"
        links={[
          { href: "/operators", label: "Операторы" },
          { href: "/hotels/hilton-suites-makkah", label: "Отели" },
          { href: "/#how-it-works", label: "Как это работает" },
          { href: "/verify/QR-HJ-2026-ERLAN-A4", label: "Проверить договор" },
        ]}
      />

      <div className="hotel-page">
        <div className="hotel-crumb">
          <a href="#top">Каталог</a>
          <span className="sep">/</span>
          <a href="#top">Al-Safa Hajj Travel</a>
          <span className="sep">/</span>
          <a href="#top">Рамазан-2026 Премиум</a>
          <span className="sep">/</span>
          <span className="cur">Hilton Suites Makkah</span>
        </div>

        <div className="hotel-gallery">
          <div className="hot-main">
            <Image alt="Hilton Suites Makkah" fill priority sizes="(min-width: 1200px) 60vw, 100vw" src={galleryImages[0]} style={{ objectFit: "cover" }} />
            <button aria-label="Предыдущее" className="hot-nav prev" type="button">
              →
            </button>
            <button aria-label="Следующее" className="hot-nav next" type="button">
              →
            </button>
            <div className="hot-counter">
              <span className="cur">1</span> / 24
            </div>
            <button className="hot-expand" type="button">
              Все фото · 24
            </button>
          </div>
          <div className="hot-thumb t1">
            <Image alt="Лобби Hilton Suites" fill sizes="25vw" src={galleryImages[1]} style={{ objectFit: "cover" }} />
          </div>
          <div className="hot-thumb t2">
            <Image alt="Номер Hilton Suites" fill sizes="25vw" src={galleryImages[2]} style={{ objectFit: "cover" }} />
          </div>
          <div className="hot-thumb t3">
            <Image alt="Ванная Hilton Suites" fill sizes="25vw" src={galleryImages[3]} style={{ objectFit: "cover" }} />
          </div>
          <div className="hot-thumb t4 more">
            <Image alt="Дополнительные фото Hilton Suites" fill sizes="25vw" src={galleryImages[4]} style={{ objectFit: "cover" }} />
            <span>
              <b>+20</b>ещё фото
            </span>
          </div>
        </div>

        <div className="hot-head">
          <div>
            <div className="stars">★★★★★</div>
            <div className="chip-row">
              <span className="tag emerald">Сертифицирован ДУМК</span>
              <span className="tag">Халяль-кухня</span>
              <span className="tag">Женский этаж</span>
            </div>
            <h1>
              Hilton Suites <em>Makkah</em>
            </h1>
            <div className="addr">
              Jabal Omar Dist., 15 Ibrahim Al Khalil Rd · <b style={{ marginLeft: 4 }}>270 м от Харама</b>
            </div>
            <div className="rating-row">
              <div>
                <div className="rt-score">4.7</div>
                <div className="rt-meta">из 5.0</div>
              </div>
              <div className="rt-divider"></div>
              <div>
                <div className="rt-label">Отлично · 148 отзывов</div>
                <div className="rt-meta">Казахстанских паломников — 89</div>
              </div>
            </div>
          </div>

          <div className="hot-book">
            <div className="price-big">
              2 850 000 <small>₸ / 14 ночей</small>
            </div>
            <div className="price-meta">двухместное размещение · включая питание</div>
            <div className="kv-row">
              <span>Даты заезда</span>
              <b>18 мар — 01 апр</b>
            </div>
            <div className="kv-row">
              <span>Расстояние до Харама</span>
              <b>270 м</b>
            </div>
            <div className="kv-row">
              <span>Этаж / тип</span>
              <b>14 · Haram View</b>
            </div>
            <div className="availability">
              <span className="dot"></span>В этом туре осталось <b style={{ marginLeft: 3 }}>7 мест из 45</b>
            </div>
            <button className="btn-add" type="button">
              Выбрать этот отель в тур
            </button>
            <button className="btn-ghost" type="button">
              Сравнить с другим
            </button>
          </div>
        </div>

        <div className="hot-tabs">
          <div className="hot-tab on">Обзор</div>
          <div className="hot-tab">
            Номера <span className="count">· 3 типа</span>
          </div>
          <div className="hot-tab">Расположение</div>
          <div className="hot-tab">
            Отзывы <span className="count">· 148</span>
          </div>
          <div className="hot-tab">Удобства</div>
        </div>

        <div className="hot-over">
          <div className="desc">
            <p>
              Отель расположен в районе Jabal Omar — в 270 метрах от Масджид аль-Харам, через дорогу от King Abdul Aziz
              Gate. Прямой проход к таваф-матафу занимает 4 минуты пешком даже для пожилых паломников. В здании работают три
              высокоскоростных лифта, на каждом этаже — отдельная зона для совершения намаза с указанием киблы.
            </p>
            <p>
              Все номера оборудованы кондиционером, сейфом, мини-холодильником и электрочайником. Полотенца и постельное
              бельё меняются ежедневно. В ванных комнатах — биде и шампунь халяль-сертификации. Wi-Fi бесплатный, скорость
              120 Мбит/с, покрытие — во всех зонах включая лобби.
            </p>
            <p>
              Трёхразовое питание подаётся в ресторане на первом этаже: завтрак континентальный + халяль-колбасы, обед и ужин
              — казахстанское меню от шеф-повара из Алматы (бешбармак раз в неделю, плов, манты, национальные супы). Для
              гостей с диабетом и гипертонией — отдельная диет-линия, согласовывается за 48 часов.
            </p>

            <h5 className="eyebrow" style={{ marginBottom: 16, marginTop: 32 }}>
              Что включено
            </h5>
            <div className="hot-amen">
              {amenities.map((item) => (
                <div className="am-item" key={item}>
                  ✓ {item}
                </div>
              ))}
            </div>
          </div>

          <aside className="hot-facts">
            <h5>Ключевые факты</h5>
            {facts.map(([label, value]) => (
              <div className="fact" key={label}>
                <span className="k">{label}</span>
                <span className="v" style={label === "Сертификат ДУМК" ? { color: "var(--emerald)" } : undefined}>
                  {value}
                </span>
              </div>
            ))}
          </aside>
        </div>

        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 18px" }}>
          Типы номеров в этом туре
        </h3>
        <div className="hot-rooms">
          {roomCards.map((room) => (
            <div className={`room ${room.sold ? "sold" : ""}`} key={room.title}>
              <div className="rimg">
                <Image alt={room.title} fill sizes="(min-width: 1200px) 30vw, 100vw" src={room.image} style={{ objectFit: "cover" }} />
              </div>
              <div className="rbody">
                <div className="rtype" style={room.title === "Haram View" ? { color: "var(--emerald)" } : undefined}>
                  {room.meta}
                </div>
                <h4>{room.title}</h4>
                <div className="rfeat">
                  {room.subtitle.split(" · ").map((item) => (
                    <span key={`${room.title}-${item}`}>{item}</span>
                  ))}
                </div>
                <div className="rprice">
                  <div className="p">
                    {room.price} <small>₸</small>
                  </div>
                  <span className="avail-pill">{room.availability}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 18px" }}>
          Расположение
        </h3>
        <div className="hot-map" style={{ marginBottom: 40 }}>
          <div className="map-pin emerald" style={{ left: "48%", top: "44%" }}>
            <div className="pin-dot"></div>
            <div className="pin-label">Масджид аль-Харам</div>
          </div>
          <div className="map-pin" style={{ left: "52%", top: "58%" }}>
            <div className="pin-dot" style={{ background: "var(--gold-deep)" }}></div>
            <div className="pin-label">Hilton Suites · вы здесь</div>
          </div>
          <div className="map-pin" style={{ left: "32%", top: "70%" }}>
            <div className="pin-dot"></div>
            <div className="pin-label">Автовокзал</div>
          </div>
          <div className="map-pin" style={{ left: "68%", top: "66%" }}>
            <div className="pin-dot"></div>
            <div className="pin-label">Ресторан «Алматы»</div>
          </div>
          <div className="map-pin" style={{ left: "72%", top: "32%" }}>
            <div className="pin-dot"></div>
            <div className="pin-label">Jabal Omar Mall</div>
          </div>
          <div className="map-dist">
            <div className="k">До Харама пешком</div>
            <div className="v">
              4 <em>мин</em> · 270 м
            </div>
          </div>
        </div>

        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 26, fontWeight: 700, letterSpacing: "-.02em", margin: "0 0 18px" }}>
          Отзывы паломников <span style={{ color: "var(--muted)", fontSize: 16, fontWeight: 400 }}>· 148 после хаджа 1446</span>
        </h3>
        <div className="hot-reviews">
          <aside className="rev-summary">
            <div className="big">4.7</div>
            <div className="stars-big">★★★★★</div>
            <div className="total">на основе 148 отзывов</div>
            {[
              ["Близость к Хараму", "4.9", 98],
              ["Чистота номеров", "4.8", 96],
              ["Персонал", "4.7", 94],
              ["Халяль-питание", "4.6", 92],
              ["Соотношение цена/качество", "4.4", 88],
              ["Тишина / сон", "4.2", 84],
            ].map(([label, value, width]) => (
              <div className="rev-bar" key={label}>
                <div className="rb-top">
                  <span>{label}</span>
                  <span className="v">{value}</span>
                </div>
                <div className="rb-track">
                  <div className="rb-fill" style={{ width: `${width}%` }}></div>
                </div>
              </div>
            ))}
          </aside>

          <div className="rev-list">
            <div className="rev-filters">
              {["Все · 148", "Казахстан · 89", "С фото · 34", "5★ · 98", "4★ · 38", "3★ и ниже · 12"].map((item, index) => (
                <span className={`chip ${index === 0 ? "on" : ""}`} key={item}>
                  {item}
                </span>
              ))}
            </div>

            {reviews.map((review) => (
              <div className="rev-item" key={review.author}>
                <div className="rh">
                  <div className={`avatar ${review.avatarClass ?? ""}`}>{review.avatar}</div>
                  <div>
                    <div className="rnm">{review.author}</div>
                    <div className="rmt">{review.meta}</div>
                  </div>
                  <div className="rs">
                    <div className="stars-s">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <span key={`${review.author}-${index}`} style={index < review.stars ? undefined : { opacity: 0.3 }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="sco">{review.score}</div>
                  </div>
                </div>
                <p className="rq">{review.copy}</p>
                <div className="rtags">
                  {review.tags.map(([label, tone]) => (
                    <span className={`rtag ${tone}`} key={`${review.author}-${label}`}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 0" }}>
              <button className="btn-ghost" style={{ maxWidth: 260 }} type="button">
                Показать ещё 144 отзыва
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
