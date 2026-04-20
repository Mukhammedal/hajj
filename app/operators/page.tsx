import { Filter, Star } from "lucide-react";

import { OperatorCard } from "@/components/marketing/operator-card";
import { SiteHeader } from "@/components/shell/site-header";
import { Badge } from "@/components/ui/badge";
import { loadPublicOperatorCards } from "@/lib/data/hajj-loaders";

const filters = [
  "Город: Алматы",
  "Город: Астана",
  "Рейтинг 4.5+",
  "Свободная квота > 10",
];

export default async function OperatorsPage() {
  const operators = await loadPublicOperatorCards();

  return (
    <div className="page-wrap">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge>Открытый реестр</Badge>
            <h1 className="mt-4 text-5xl">Проверенные хадж-операторы</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
              Каталог для лидогенерации: карточки показывают рейтинг, лицензию, свободную квоту и дают быстрый переход к
              бронированию.
            </p>
          </div>
          <div className="shell-panel flex items-center gap-3 px-5 py-4">
            <Filter className="h-5 w-5 text-primary" />
            <span className="text-sm text-muted-foreground">Фильтры можно связать с Server Actions или search params.</span>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {filters.map((filter, index) => (
            <div key={filter} className={`data-chip ${index === 2 ? "border-primary/20 bg-primary/10 text-primary" : ""}`}>
              {index === 2 ? <Star className="h-4 w-4" /> : null}
              {filter}
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {operators.map((item) => (
            <OperatorCard key={item.operator.id} operator={item.operator} city={item.city} quotaLeft={item.quotaLeft} />
          ))}
        </div>
      </main>
    </div>
  );
}
