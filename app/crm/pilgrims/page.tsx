import { Download, Filter, Layers3, UserPlus2 } from "lucide-react";

import { GroupAssignmentForm } from "@/components/crm/group-assignment-form";
import { PilgrimCreateForm } from "@/components/crm/pilgrim-create-form";
import { PilgrimTable } from "@/components/crm/pilgrim-table";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "@/types/domain";

const filters = ["Статус: все", "Группа: все", "Готовность > 70%", "Нужна оплата"];

export default async function CrmPilgrimsPage() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const readinessMap = new Map(crm.readiness.map((item) => [item.pilgrimId, item]));
  const paymentMap = new Map(crm.payments.map((item) => [item.pilgrimId, item]));
  const groupByPilgrim = new Map(
    crm.groupLinks.map((link) => [link.pilgrimId, crm.groups.find((group) => group.id === link.groupId)?.name ?? null]),
  );
  const docsByPilgrim = new Map(
    crm.pilgrims.map((pilgrim) => [
      pilgrim.id,
      crm.documents.filter((document) => document.pilgrimId === pilgrim.id),
    ]),
  );
  const resolveDocState = (documents: DocumentRecord[], type: DocumentRecord["type"]): "verified" | "uploaded" | "missing" => {
    const item = documents.find((document) => document.type === type);
    return item?.isVerified ? "verified" : item ? "uploaded" : "missing";
  };

  const rows = crm.pilgrims.map((pilgrim) => ({
    pilgrim,
    docs: docsByPilgrim.get(pilgrim.id) ?? [],
  })).map(({ pilgrim, docs }) => ({
    pilgrim,
    docs: {
      passport: resolveDocState(docs, "passport"),
      medical_certificate: resolveDocState(docs, "medical_certificate"),
      photo: resolveDocState(docs, "photo"),
      questionnaire: resolveDocState(docs, "questionnaire"),
      vaccination: resolveDocState(docs, "vaccination"),
    },
    groupName: groupByPilgrim.get(pilgrim.id) ?? null,
    paymentStatus: paymentMap.get(pilgrim.id)?.status ?? null,
    readinessPercent: readinessMap.get(pilgrim.id)?.readinessPercent ?? 0,
    docsCount: readinessMap.get(pilgrim.id)?.docsCount ?? 0,
  }));
  const readyCount = rows.filter((row) => row.readinessPercent === 100).length;
  const unassignedCount = rows.filter((row) => !row.groupName).length;
  const paymentPendingCount = rows.filter((row) => row.paymentStatus !== "paid").length;

  return (
    <div className="grid gap-6">
      <section className="shell-panel p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge>CRM ядро</Badge>
            <h2 className="mt-4 text-4xl">Паломники и readiness</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Здесь оператор видит документы, оплату, назначение в группу и может запускать массовые действия по фильтру.
            </p>
          </div>
          <a href="/api/crm/pilgrims/export" className={cn(buttonVariants({ variant: "default" }), "w-fit")}>
            <Download className="h-4 w-4" />
            Экспорт в Excel
          </a>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {filters.map((filter, index) => (
            <div key={filter} className={`data-chip ${index === 2 ? "border-primary/25 bg-primary/10 text-primary" : ""}`}>
              <Filter className="h-4 w-4" />
              {filter}
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="subtle-panel p-4">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Всего в CRM</p>
            <p className="mt-2 text-3xl font-semibold">{rows.length}</p>
          </div>
          <div className="subtle-panel p-4">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Готовы к вылету</p>
            <p className="mt-2 text-3xl font-semibold">{readyCount}</p>
          </div>
          <div className="subtle-panel p-4">
            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">Требуют внимания</p>
            <p className="mt-2 text-3xl font-semibold">{Math.max(unassignedCount, paymentPendingCount)}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Без группы: {unassignedCount} · Не оплачено: {paymentPendingCount}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="shell-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Badge variant="secondary">Новый паломник</Badge>
              <h3 className="mt-4 text-3xl">Создать карточку и доступ</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Создаётся `Supabase Auth` пользователь, профиль паломника, базовый платёж и стартовый чек-лист.
              </p>
            </div>
            <UserPlus2 className="h-6 w-6 text-secondary" />
          </div>
          <PilgrimCreateForm />
        </div>

        <div className="shell-panel p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <Badge variant="warning">Назначение</Badge>
              <h3 className="mt-4 text-3xl">Распределить по группе</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                Назначение учитывает квоту группы. Если паломник уже был в другой группе, связь будет перенесена.
              </p>
            </div>
            <Layers3 className="h-6 w-6 text-warning" />
          </div>
          <GroupAssignmentForm groups={crm.groups} pilgrims={crm.pilgrims} />
        </div>
      </section>

      <section className="shell-panel overflow-hidden p-0">
        <div className="border-b border-white/10 px-6 py-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-3xl">Таблица паломников</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Readiness считается из SQL view, документы показываются по всем 5 обязательным типам.
              </p>
            </div>
            <Badge>{formatPercent(rows.reduce((sum, row) => sum + row.readinessPercent, 0) / Math.max(rows.length, 1))} средняя готовность</Badge>
          </div>
        </div>
        <PilgrimTable rows={rows} />
      </section>
    </div>
  );
}
