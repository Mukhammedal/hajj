import Image from "next/image";
import Link from "next/link";

import { PublicOperatorCard } from "@/components/marketing/public-operator-card";
import { DesignIcon } from "@/components/shell/design-icons";
import { Footer } from "@/components/shell/footer";
import { PublicTopbar } from "@/components/shell/public-topbar";
import { buildShowcaseOperators, designImages } from "@/lib/design-public";
import { loadPublicOperatorCards } from "@/lib/data/hajj-loaders";

export default async function LandingPage() {
  const operators = buildShowcaseOperators(await loadPublicOperatorCards()).slice(0, 3);

  return (
    <div className="page-wrap app-shell">
      <PublicTopbar />

      <main>
        <section className="hero">
          <div>
            <span className="eyebrow dot">Открытый реестр · 47 верифицированных операторов</span>
            <h1>
              Путь к Мекке — <em>без сомнений</em> в операторе.
            </h1>
            <p className="lead">
              HajjCRM собирает лицензированных казахстанских операторов хаджа и умры в одном открытом реестре. Выбирайте по
              рейтингу, свободной квоте и цене — с QR-договором, который можно проверить с телефона.
            </p>
            <div className="row g12" style={{ marginBottom: "8px" }}>
              <Link className="btn btn-dark btn-lg" href="/operators">
                Выбрать оператора <span className="arr">›</span>
              </Link>
              <Link className="btn btn-ghost btn-lg" href="/verify/QR-HJ-2026-ERLAN-A4">
                Проверить договор
              </Link>
            </div>
            <div className="stats">
              <div className="s">
                <div className="v">47</div>
                <div className="k">Операторов</div>
              </div>
              <div className="s">
                <div className="v">12 840</div>
                <div className="k">Паломников</div>
              </div>
              <div className="s">
                <div className="v">5</div>
                <div className="k">Городов вылета</div>
              </div>
            </div>
          </div>

          <div className="hero-photo">
            <Image alt="Кааба, Мекка" fill priority sizes="(min-width: 1200px) 40vw, 100vw" src={designImages.heroKaaba} style={{ objectFit: "cover" }} />
            <div className="qr-float">
              <div className="qr">
                <DesignIcon name="qr" size={62} style={{ color: "#ede6d4" }} />
              </div>
              <div className="meta">
                <div className="eyebrow">Договор проверен</div>
                <div className="ttl">Al-Safa Hajj Travel · Ерлан М.</div>
                <div className="id">QR-HJ-2026-ERLAN-A4</div>
                <div className="verified">
                  <DesignIcon name="check" size={12} /> Подлинность подтверждена ДУМК
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="brand-row">
          <div>
            <b>SAUDIA</b>
          </div>
          <div>
            <b>flynas</b>
          </div>
          <div>Qazaq Air</div>
          <div>
            Mövenpick <em>Makkah</em>
          </div>
          <div>Swissôtel Al Maqam</div>
          <div>
            <b>Kaspi</b>.kz
          </div>
        </div>

        <div className="op-grid">
          {operators.map((operator) => (
            <PublicOperatorCard key={operator.slug} operator={operator} />
          ))}
        </div>

        <section className="hiw" id="how-it-works">
          <div className="st">
            <div className="num-big">01</div>
            <h4>
              Выберите <em>оператора</em>
            </h4>
            <p>47 лицензированных компаний в открытом реестре. Фильтры по городу, рейтингу, бюджету и квоте.</p>
          </div>
          <div className="st">
            <div className="num-big">02</div>
            <h4>
              Соберите <em>документы</em>
            </h4>
            <p>Загрузите паспорт, мед. справку, фото, анкету и сертификат о прививке ACWY в личный кабинет.</p>
          </div>
          <div className="st">
            <div className="num-big">03</div>
            <h4>
              Получите <em>QR-договор</em>
            </h4>
            <p>Публичная ссылка и QR, которые родственники могут проверить с телефона — без входа в систему.</p>
          </div>
        </section>

        <section className="readiness-dark">
          <div>
            <span className="eyebrow">Readiness Engine · USP платформы</span>
            <h2>
              Процент готовности — <em>к вылету</em>, не к продаже.
            </h2>
            <p>
              Один показатель на стыке документов, оплаты и группы. Паломник видит, где он застрял. Оператор — кого
              дожимать сегодня. Цифра, которая двигает воронку.
            </p>
            <Link className="btn btn-gold btn-lg" href="/cabinet/dashboard">
              Как считается готовность <span className="arr">›</span>
            </Link>
          </div>
          <div className="readiness-card">
            <div className="gauge-wrap">
              <svg height="180" viewBox="0 0 180 180" width="180">
                <circle cx="90" cy="90" fill="none" r="76" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
                <circle
                  cx="90"
                  cy="90"
                  fill="none"
                  r="76"
                  stroke="#c9a961"
                  strokeDasharray="477.5"
                  strokeDashoffset="62"
                  strokeLinecap="round"
                  strokeWidth="10"
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="gauge-num">
                87<small>готов</small>
              </div>
            </div>
            <div className="readiness-list">
              <div className="r">
                <div className="lbl">Документы · 5 из 5</div>
                <div className="val ok">готово</div>
              </div>
              <div className="r">
                <div className="lbl">Фото 4×6 · загружено</div>
                <div className="val ok">готово</div>
              </div>
              <div className="r">
                <div className="lbl">Оплата · 1 995 000 ₸</div>
                <div className="val warn">70%</div>
              </div>
              <div className="r">
                <div className="lbl">Вакцинация ACWY</div>
                <div className="val no">не загружено</div>
              </div>
            </div>
          </div>
        </section>

        <section className="testi">
          <div className="card">
            <blockquote>
              «Перед отправкой хотел проверить, что договор настоящий. QR открылся без регистрации — всё сошлось, имя,
              сумма, лицензия. Родителям сразу прислал ссылку.»
            </blockquote>
            <div className="who">
              <div className="avatar">ЕМ</div>
              <div>
                <div className="n">Ерлан Мухаметов</div>
                <div className="m">Алматы · хадж Рамазан-2026</div>
              </div>
            </div>
          </div>

          <div className="card">
            <blockquote className="ar" style={{ fontFamily: "var(--f-serif)", fontStyle: "italic", direction: "ltr" }}>
              «Операторды табу қиын болды. HajjCRM арқылы <em>Nur Iman</em> таптым — қазақша гид, Астанадан тікелей рейс.
              Тіркелу оңай, қолдау үнемі байланыста.»
            </blockquote>
            <div className="who">
              <div className="avatar" style={{ background: "var(--gold-deep)" }}>
                АН
              </div>
              <div>
                <div className="n">Айгүл Нұрқожаева</div>
                <div className="m">Астана · хадж-2026 · казахский</div>
              </div>
            </div>
          </div>

          <div className="card">
            <blockquote>
              «Как оператор — первый раз вижу, где точно застрял каждый паломник. Уведомления по WhatsApp уходят сами,
              readiness-процент — честный, не накрученный.»
            </blockquote>
            <div className="who">
              <div className="avatar" style={{ background: "var(--ink)" }}>
                БТ
              </div>
              <div>
                <div className="n">Бауыржан Тулегенов</div>
                <div className="m">Al-Safa Hajj Travel · директор</div>
              </div>
            </div>
          </div>
        </section>

        <section className="final-cta">
          <div className="bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>
          <h2>
            Хадж — <em>путь одной жизни.</em>
          </h2>
          <p>
            Начните его с оператора, которому можно доверять. Открытый реестр, проверенные лицензии, честный процент
            готовности.
          </p>
          <div className="row g12" style={{ justifyContent: "center" }}>
            <Link className="btn btn-dark btn-lg" href="/operators">
              Выбрать оператора <span className="arr">›</span>
            </Link>
            <Link className="btn btn-ghost btn-lg" href="/cabinet/dashboard" style={{ color: "#ede6d4", borderColor: "#3a332a" }}>
              Демо кабинет
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
