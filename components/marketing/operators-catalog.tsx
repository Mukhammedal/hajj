import Link from "next/link";

import { PublicOperatorCard } from "@/components/marketing/public-operator-card";
import { DesignIcon } from "@/components/shell/design-icons";
import type { ShowcaseOperator } from "@/lib/design-public";

type SortMode = "price" | "quota" | "rating";

interface OperatorsCatalogProps {
  allOperators: ShowcaseOperator[];
  currentPage: number;
  filters: {
    chipCity: string;
    minRating: number;
    query: string;
    selectedCities: string[];
    sort: SortMode;
  };
  operators: ShowcaseOperator[];
  pageCount: number;
  totalCount: number;
}

function buildHref(
  filters: OperatorsCatalogProps["filters"],
  overrides: Partial<OperatorsCatalogProps["filters"] & { page: number }>,
) {
  const params = new URLSearchParams();
  const query = overrides.query ?? filters.query;
  const chipCity = overrides.chipCity ?? filters.chipCity;
  const selectedCities = overrides.selectedCities ?? filters.selectedCities;
  const minRating = overrides.minRating ?? filters.minRating;
  const sort = overrides.sort ?? filters.sort;
  const page = overrides.page ?? 1;

  if (query) {
    params.set("q", query);
  }

  if (chipCity && chipCity !== "Все") {
    params.set("city", chipCity);
  }

  selectedCities.forEach((city) => {
    params.append("cities", city);
  });

  if (minRating !== 4.8) {
    params.set("rating", String(minRating));
  }

  if (sort !== "rating") {
    params.set("sort", sort);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const queryString = params.toString();
  return queryString ? `/operators?${queryString}` : "/operators";
}

export function OperatorsCatalog({
  allOperators,
  currentPage,
  filters,
  operators,
  pageCount,
  totalCount,
}: OperatorsCatalogProps) {
  const cityOptions = [
    "Алматы",
    "Астана",
    "Шымкент",
    "Туркестан",
    "Актау",
  ].map((label) => ({
    count: allOperators.filter((operator) => operator.city === label).length,
    label,
  }));
  const ratingOptions = [4.8, 4.5, 4].map((value) => ({
    count: allOperators.filter((operator) => operator.rating >= value).length,
    value,
  }));

  return (
    <>
      <div className="catalog-hero">
        <div>
          <span className="eyebrow">Открытый реестр</span>
          <h1>
            Операторы хаджа, <em>проверенные</em> ДУМК.
          </h1>
        </div>
        <div className="count">
          <div className="v">{allOperators.length}</div>
          <div className="k">Лицензированных компаний</div>
        </div>
      </div>

      <form action="/operators" className="catalog-form" method="get">
        <div className="filter-bar">
          <label className="search-box">
            <DesignIcon name="search" size={14} style={{ color: "var(--muted)" }} />
            <input defaultValue={filters.query} name="q" placeholder="Название компании или лицензия…" />
          </label>
          <Link className={`chip ${filters.chipCity === "Все" ? "on" : ""}`} href={buildHref(filters, { chipCity: "Все", page: 1 })}>
            Все <span className="c">{allOperators.length}</span>
          </Link>
          {cityOptions.map((option) => (
            <Link
              key={option.label}
              className={`chip ${filters.chipCity === option.label ? "on" : ""}`}
              href={buildHref(filters, { chipCity: option.label, page: 1 })}
            >
              {option.label} <span className="c">{option.count}</span>
            </Link>
          ))}
          {filters.chipCity !== "Все" ? <input name="city" type="hidden" value={filters.chipCity} /> : null}
        </div>

        <div className="catalog-body">
          <aside className="sidebar-filter">
            <h6>Город</h6>
            {cityOptions.map((option) => (
              <label key={option.label} className="fopt">
                <span>
                  <input defaultChecked={filters.selectedCities.includes(option.label)} name="cities" type="checkbox" value={option.label} />
                  {option.label}
                </span>
                <span className="c">{option.count}</span>
              </label>
            ))}

            <h6>Рейтинг</h6>
            {ratingOptions.map((option) => (
              <label key={option.value} className="fopt">
                <span>
                  <input defaultChecked={filters.minRating === option.value} name="rating" type="radio" value={String(option.value)} />
                  {option.value.toFixed(1)} и выше
                </span>
                <span className="c">{option.count}</span>
              </label>
            ))}

            <h6>Бюджет</h6>
            <div className="slider-wrap">
              <div className="track">
                <div className="fill" />
                <div className="h a" />
                <div className="h b" />
              </div>
              <div className="range">
                <span>2 200 000 ₸</span>
                <span>3 400 000 ₸</span>
              </div>
            </div>

            <h6>Дополнительно</h6>
            <label className="fopt">
              <span>
                <input defaultChecked type="checkbox" />
                Рассрочка Kaspi
              </span>
            </label>
            <label className="fopt">
              <span>
                <input defaultChecked type="checkbox" />
                Казахоязычный гид
              </span>
            </label>
            <label className="fopt">
              <span>
                <input type="checkbox" />
                Медкуратор
              </span>
            </label>
            <label className="fopt">
              <span>
                <input type="checkbox" />
                Отель ≤500 м от Харама
              </span>
            </label>
            <label className="fopt">
              <span>
                <input type="checkbox" />
                Прямой рейс Saudia
              </span>
            </label>

            <button className="btn btn-dark btn-sm" style={{ marginTop: 18, width: "100%" }} type="submit">
              Применить фильтры
            </button>
          </aside>

          <div>
            <div className="catalog-results-top">
              <div className="res">
                Показано <b>{totalCount}</b> оператора из <b>{allOperators.length}</b>
              </div>
              <div className="row g12">
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Сортировать:</span>
                <select
                  defaultValue={filters.sort}
                  name="sort"
                  style={{
                    fontFamily: "inherit",
                    border: "1px solid var(--line)",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    background: "var(--paper)",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  <option value="rating">По рейтингу</option>
                  <option value="price">По цене</option>
                  <option value="quota">По свободной квоте</option>
                </select>
              </div>
            </div>

            <div className="catalog-grid">
              {operators.map((operator) => (
                <PublicOperatorCard key={operator.slug} operator={operator} />
              ))}
            </div>

            <div className="paginator" style={{ marginTop: "32px" }}>
              <span>Страница {currentPage} из {pageCount}</span>
              <div className="row g12">
                {currentPage > 1 ? (
                  <Link className="chip" href={buildHref(filters, { page: currentPage - 1 })}>
                    ‹ Назад
                  </Link>
                ) : (
                  <span className="chip">‹ Назад</span>
                )}
                {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                  <Link key={page} className={`chip ${page === currentPage ? "on" : ""}`} href={buildHref(filters, { page })}>
                    {page}
                  </Link>
                ))}
                {currentPage < pageCount ? (
                  <Link className="chip" href={buildHref(filters, { page: currentPage + 1 })}>
                    Вперёд ›
                  </Link>
                ) : (
                  <span className="chip">Вперёд ›</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
