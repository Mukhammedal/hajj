import { hotelReadinessChecks, hotelRooms } from "@/lib/design-admin";

export default function AdminNewHotelPage() {
  return (
    <>
      <div className="app-topbar">
        <h2>
          Добавление <em>отеля.</em>
        </h2>
        <div className="right">
          <span style={{ color: "var(--muted)", fontSize: 12 }}>
            Черновик сохранён · <b style={{ color: "var(--ink)" }}>14:32</b>
          </span>
          <button className="btn btn-ghost btn-sm" type="button">
            Предпросмотр
          </button>
          <button className="btn btn-ghost btn-sm" type="button">
            Сохранить черновик
          </button>
          <button className="btn btn-dark btn-sm" type="button">
            Опубликовать отель →
          </button>
        </div>
      </div>

      <div className="imp-stepper">
        <div className="stp done">
          <div className="sn">01</div>
          <div className="sw">
            <div className="st">Основное</div>
            <div className="sd">название, город, категория</div>
          </div>
        </div>
        <div className="sep"></div>
        <div className="stp done">
          <div className="sn">02</div>
          <div className="sw">
            <div className="st">Расположение</div>
            <div className="sd">адрес, расстояние до Харама</div>
          </div>
        </div>
        <div className="sep"></div>
        <div className="stp on">
          <div className="sn">03</div>
          <div className="sw">
            <div className="st">Фото и номера</div>
            <div className="sd">галерея, типы комнат, цены</div>
          </div>
        </div>
        <div className="sep"></div>
        <div className="stp">
          <div className="sn">04</div>
          <div className="sw">
            <div className="st">Услуги</div>
            <div className="sd">удобства, питание, трансфер</div>
          </div>
        </div>
        <div className="sep"></div>
        <div className="stp">
          <div className="sn">05</div>
          <div className="sw">
            <div className="st">Публикация</div>
            <div className="sd">модерация и выход в каталог</div>
          </div>
        </div>
      </div>

      <div className="hotel-form">
        <div>
          <section className="gs-card">
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              01 · Основное
            </div>
            <div className="fg">
              <label>
                Название отеля <span className="req">*</span>
              </label>
              <div className="input filled">Mövenpick Hotel &amp; Residences Hajar Tower Makkah</div>
            </div>
            <div className="fg-row">
              <div className="fg">
                <label>Название на арабском</label>
                <div className="input filled" style={{ direction: "rtl", fontFamily: "var(--f-arabic)", fontSize: 16 }}>
                  فندق موفنبيك برج هاجر مكة
                </div>
              </div>
              <div className="fg">
                <label>
                  Категория <span className="req">*</span>
                </label>
                <div className="stars-row">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <span className="st on" key={index}>
                      ★
                    </span>
                  ))}
                  <span style={{ color: "var(--muted)", fontSize: 13, marginLeft: 10 }}>5 звёзд · премиум</span>
                </div>
              </div>
            </div>
            <div className="fg-row">
              <div className="fg">
                <label>
                  Город <span className="req">*</span>
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <span className="chip on">Мекка</span>
                  <span className="chip">Медина</span>
                  <span className="chip">Джидда</span>
                </div>
              </div>
              <div className="fg">
                <label>Бренд / Сеть</label>
                <div className="input filled">Mövenpick · Accor Group</div>
              </div>
            </div>
            <div className="fg">
              <label>Короткое описание</label>
              <div className="textarea filled">
                Один из самых высоких отелей мира в комплексе Абрадж аль-Бейт. Прямой вход к Масджид аль-Харам,
                панорамные виды на Каабу. Официальный партнёр Mövenpick для казахстанских хадж-операторов с 2019 года.
              </div>
            </div>
          </section>

          <section className="gs-card" style={{ marginTop: 20 }}>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              02 · Расположение
            </div>
            <div className="fg">
              <label>
                Адрес на английском <span className="req">*</span>
              </label>
              <div className="input filled">Abraj Al Bait Complex, King Abdul Aziz Rd, Mecca 24231</div>
            </div>
            <div className="fg-row">
              <div className="fg">
                <label>
                  Расстояние до Масджид аль-Харам <span className="req">*</span>
                </label>
                <div className="input filled" style={{ fontFamily: "var(--f-display)" }}>
                  120 м · 2 мин пешком
                </div>
              </div>
              <div className="fg">
                <label>Этажей / высота</label>
                <div className="input filled" style={{ fontFamily: "var(--f-display)" }}>
                  45 этажей · 289 м
                </div>
              </div>
            </div>
            <div className="fg">
              <label>Координаты (GPS)</label>
              <div className="fg-row" style={{ marginTop: 0 }}>
                <div className="input filled" style={{ fontFamily: "var(--f-display)" }}>
                  21.4225° N
                </div>
                <div className="input filled" style={{ fontFamily: "var(--f-display)" }}>
                  39.8262° E
                </div>
              </div>
            </div>
            <div className="map-placeholder">
              <div className="mp-inner">
                <div className="mp-grid"></div>
                <div className="mp-kaaba">
                  ◉<span>Масджид аль-Харам</span>
                </div>
                <div className="mp-hotel">
                  ▼<span>Mövenpick · 120 м</span>
                </div>
                <div className="mp-lbl">Карта Мекки · перетащите маркер для точной локации</div>
              </div>
            </div>
          </section>

          <section className="gs-card" style={{ marginTop: 20 }}>
            <div style={{ alignItems: "baseline", display: "flex", justifyContent: "space-between" }}>
              <div className="eyebrow" style={{ marginBottom: 14 }}>
                03 · Фото · загружено 7 из 12
              </div>
              <span style={{ color: "var(--muted)", fontFamily: "var(--f-serif)", fontSize: 11, fontStyle: "italic" }}>
                JPG · PNG · WEBP · до 5 МБ
              </span>
            </div>
            <div className="photo-grid">
              <div className="ph main">
                <div className="ph-inner" style={{ background: "linear-gradient(135deg,#8a7c5e 0%,#3a3224 100%)" }}></div>
                <span className="ph-tag">Главное фото</span>
              </div>
              {[
                ["linear-gradient(135deg,#6b8a70 0%,#2d4a3e 100%)", "Фасад"],
                ["linear-gradient(135deg,#a88742 0%,#6b5a30 100%)", "Лобби"],
                ["linear-gradient(135deg,#cbc3a7 0%,#8a7c5e 100%)", "Номер Deluxe"],
                ["linear-gradient(135deg,#3a4a5e 0%,#1a2530 100%)", "Вид на Каабу"],
                ["linear-gradient(135deg,#7a5a3a 0%,#3a2418 100%)", "Ресторан"],
                ["linear-gradient(135deg,#8a9cb0 0%,#4a5a70 100%)", "Бассейн"],
              ].map(([background, label]) => (
                <div className="ph" key={label}>
                  <div className="ph-inner" style={{ background }}></div>
                  <span className="ph-lbl">{label}</span>
                </div>
              ))}
              <div className="ph add">
                <div className="ph-inner"></div>
                <span className="ph-plus">+</span>
                <span className="ph-lbl">Добавить</span>
              </div>
            </div>
            <div className="uploader">
              <div className="up-icon">↑</div>
              <div>
                <div className="up-t">Перетащите ещё 5 фото или выберите файлы</div>
                <div className="up-s">минимум 4 фото · рекомендуется 8–12 · первое станет обложкой</div>
              </div>
            </div>
          </section>

          <section className="gs-card" style={{ marginTop: 20 }}>
            <div style={{ alignItems: "baseline", display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <div className="eyebrow">04 · Типы номеров и цены</div>
              <button style={{ color: "var(--emerald)", fontSize: 12, fontWeight: 600 }} type="button">
                + добавить тип номера
              </button>
            </div>
            <div className="rooms-list">
              {hotelRooms.map((room, index) => (
                <div className="rm" key={room.title}>
                  <div
                    className="rm-ph"
                    style={{
                      background:
                        index === 0
                          ? "linear-gradient(135deg,#cbc3a7,#8a7c5e)"
                          : index === 1
                            ? "linear-gradient(135deg,#8a7c5e,#3a3224)"
                            : "linear-gradient(135deg,#a88742,#6b5a30)",
                    }}
                  ></div>
                  <div className="rm-body">
                    <div className="rm-h">
                      <div className="rm-n">{room.title}</div>
                      <span className={`tag ${room.tone === "success" ? "success" : room.tone === "emerald" ? "emerald" : ""}`}>
                        {room.active}
                      </span>
                    </div>
                    <div className="rm-m">{room.description}</div>
                    <div className="rm-prices">
                      <div>
                        <span className="pl">за место/ночь</span>
                        <span className="pv">{room.perBed}</span>
                      </div>
                      <div>
                        <span className="pl">за номер/ночь</span>
                        <span className="pv">{room.perRoom}</span>
                      </div>
                      <div>
                        <span className="pl">в составе пакета · 14 ночей</span>
                        <span className="pv">{room.perPackage}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rm-actions">
                    <a href="#top">редактировать</a>
                    <a href="#top">×</a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="hotel-side">
          <div className="hs-card">
            <div className="eyebrow">Предпросмотр карточки</div>
            <div className="hs-preview">
              <div className="hs-cover" style={{ background: "linear-gradient(135deg,#8a7c5e 0%,#3a3224 100%)" }}>
                <span className="hs-stars">★★★★★</span>
                <span className="hs-meters">120 м до Харама</span>
              </div>
              <div className="hs-b">
                <div className="hs-brand">MÖVENPICK · ACCOR</div>
                <div className="hs-name">Hajar Tower Makkah</div>
                <div className="hs-sub">Мекка · 289 м · 45 этажей</div>
                <div className="hs-price">
                  <span>от</span>
                  <b>68 000 ₸</b>
                  <span>/место в сутки</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hs-card">
            <div className="eyebrow">Чек готовности</div>
            <div className="hs-check">
              {hotelReadinessChecks.map((item) => (
                <div className={`ch ${item.startsWith("✓") ? "done" : "todo"}`} key={item}>
                  {item}
                </div>
              ))}
            </div>
            <div
              style={{
                background: "var(--warning-bg)",
                borderRadius: 6,
                color: "var(--warning)",
                fontFamily: "var(--f-serif)",
                fontSize: 12,
                fontStyle: "italic",
                marginTop: 14,
                padding: "10px 12px",
              }}
            >
              Готовность · 62% · осталось 4 блока
            </div>
          </div>

          <div className="hs-card">
            <div className="eyebrow">Меры и стандарты</div>
            <div className="hs-std">
              <div>
                <span>Сертификат MOHU</span>
                <span className="tag success">проверен</span>
              </div>
              <div>
                <span>Халяль-кухня</span>
                <span className="tag success">✓</span>
              </div>
              <div>
                <span>Женский этаж</span>
                <span className="tag success">✓</span>
              </div>
              <div>
                <span>Кибла в каждом номере</span>
                <span className="tag success">✓</span>
              </div>
              <div>
                <span>Молельная комната</span>
                <span className="tag">не указано</span>
              </div>
            </div>
          </div>

          <div className="hs-card" style={{ background: "var(--ink)", borderColor: "var(--ink)", color: "var(--cream)" }}>
            <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>
              После публикации
            </div>
            <p style={{ color: "#cbc3a7", fontFamily: "var(--f-serif)", fontSize: 13, fontStyle: "italic", lineHeight: 1.6, margin: "8px 0 0" }}>
              Отель появится в каталоге для всех 47 операторов. Его можно будет добавлять в пакеты хаджа и умры.
              Модерация — до 24 ч.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
