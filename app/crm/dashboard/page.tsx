import type { ComponentType } from "react";
import { AlertTriangle, CircleDollarSign, PlaneTakeoff, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

export default async function CrmDashboardPage() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const { pilgrims, groups, payments, readiness } = crm;
  const readinessMap = new Map(readiness.map((item) => [item.pilgrimId, item]));
  const readyCount = readiness.filter((item) => item.isReady).length;
  const revenue = payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const readinessAverage = pilgrims.length
    ? Math.round(pilgrims.reduce((sum, pilgrim) => sum + (readinessMap.get(pilgrim.id)?.readinessPercent ?? 0), 0) / pilgrims.length)
    : 0;
  const totalQuota = groups.reduce((sum, group) => sum + group.quotaTotal, 0);
  const quotaFilledPercent = totalQuota
    ? Math.round((groups.reduce((sum, group) => sum + group.quotaFilled, 0) / totalQuota) * 100)
    : 0;
  const alerts = pilgrims.flatMap((pilgrim) => {
    const item = readinessMap.get(pilgrim.id);
    return item && !item.isReady ? [{ pilgrim, readiness: item }] : [];
  }).slice(0, 3);

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-4">
        <MetricCard icon={Users} title="Всего паломников" value={String(pilgrims.length)} detail="Активная воронка текущего сезона" />
        <MetricCard icon={PlaneTakeoff} title="Готовы к вылету" value={String(readyCount)} detail="Статус ready по SQL view" />
        <MetricCard icon={CircleDollarSign} title="Выручка" value={formatKzt(revenue)} detail="Фактически оплачено" />
        <MetricCard
          icon={AlertTriangle}
          title="Квота заполнена"
          value={`${quotaFilledPercent}%`}
          detail={`${groups.reduce((sum, group) => sum + group.quotaFilled, 0)} мест занято`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Badge>Readiness gauge</Badge>
              <h2 className="mt-4 text-3xl">Готовность портфеля</h2>
            </div>
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-4xl text-primary">
              {readinessAverage}%
            </div>
          </div>
          <Progress value={readinessAverage} />
          <div className="mt-8 grid gap-3">
            {pilgrims.map((pilgrim) => {
              const item = readinessMap.get(pilgrim.id);
              return (
                <div key={pilgrim.id} className="subtle-panel p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{pilgrim.fullName}</span>
                    <span className="text-muted-foreground">{item?.readinessPercent ?? 0}%</span>
                  </div>
                  <Progress value={item?.readinessPercent ?? 0} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Badge variant="warning">Алерты</Badge>
              <h2 className="mt-4 text-3xl">Кого дожимать сегодня</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {alerts.map((entry) => (
              <div key={entry.pilgrim.id} className="subtle-panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{entry.pilgrim.fullName}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Документы: {entry.readiness.docsCount}/5 · Оплата: {entry.readiness.isPaymentComplete ? "готово" : "не закрыта"} ·
                      Группа: {entry.readiness.isInGroup ? "назначена" : "нет"}
                    </p>
                  </div>
                  <Badge variant="warning">{entry.readiness.readinessPercent}%</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  detail,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="shell-panel p-5">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
