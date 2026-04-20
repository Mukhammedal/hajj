import { OperatorsCatalog } from "@/components/marketing/operators-catalog";
import { PublicTopbar } from "@/components/shell/public-topbar";
import { buildShowcaseOperators } from "@/lib/design-public";
import { loadPublicOperatorCards } from "@/lib/data/hajj-loaders";

type SearchParams = Record<string, string | string[] | undefined>;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getArrayParam(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

export default async function OperatorsPage({ searchParams }: { searchParams?: SearchParams }) {
  const allOperators = buildShowcaseOperators(await loadPublicOperatorCards());
  const query = getFirstParam(searchParams?.q)?.trim() ?? "";
  const chipCity = getFirstParam(searchParams?.city) ?? "Все";
  const selectedCities = getArrayParam(searchParams?.cities);
  const ratingValue = Number(getFirstParam(searchParams?.rating) ?? "4.8");
  const minRating = Number.isFinite(ratingValue) && ratingValue >= 4 ? ratingValue : 4.8;
  const sortParam = getFirstParam(searchParams?.sort);
  const sort = sortParam === "price" || sortParam === "quota" ? sortParam : "rating";
  const requestedPage = Number(getFirstParam(searchParams?.page) ?? "1");
  const pageSize = 12;
  const normalizedQuery = query.toLowerCase();
  const cityFilter = chipCity !== "Все" ? [chipCity] : selectedCities;

  const filteredOperators = [...allOperators]
    .filter((operator) => {
      const matchesQuery =
        !normalizedQuery ||
        operator.companyName.toLowerCase().includes(normalizedQuery) ||
        operator.licenseNumber.toLowerCase().includes(normalizedQuery);
      const matchesCity = !cityFilter.length || cityFilter.includes(operator.city);
      const matchesRating = operator.rating >= minRating;

      return matchesQuery && matchesCity && matchesRating;
    })
    .sort((left, right) => {
      if (sort === "price") {
        return left.priceFrom - right.priceFrom;
      }

      if (sort === "quota") {
        return right.quotaLeft - left.quotaLeft;
      }

      return right.rating - left.rating;
    });

  const pageCount = Math.max(1, Math.ceil(filteredOperators.length / pageSize));
  const page = Number.isFinite(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const operators = filteredOperators.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="page-wrap app-shell">
      <PublicTopbar
        activeHref="/operators"
        links={[
          { href: "/operators", label: "Операторы" },
          { href: "/#how-it-works", label: "Как это работает" },
          { href: "/verify/QR-HJ-2026-ERLAN-A4", label: "Проверить договор" },
        ]}
      />
      <main>
        <OperatorsCatalog
          allOperators={allOperators}
          currentPage={page}
          filters={{ chipCity, minRating, query, selectedCities, sort }}
          operators={operators}
          pageCount={pageCount}
          totalCount={filteredOperators.length}
        />
      </main>
    </div>
  );
}
