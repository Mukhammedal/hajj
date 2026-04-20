import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";

export default async function CrmAnalyticsPage() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const { groups, pilgrims, readiness } = crm;
  const readinessMap = new Map(readiness.map((item) => [item.pilgrimId, item]));
  const avgDocCompletion = pilgrims.length
    ? Math.round(
        (pilgrims.reduce((sum, pilgrim) => sum + (readinessMap.get(pilgrim.id)?.docsCount ?? 0) / 5, 0) / pilgrims.length) * 100,
      )
    : 0;
  const paymentCollection = Math.round(
    ((pilgrims.length
      ? pilgrims.reduce((sum, pilgrim) => {
          const item = readinessMap.get(pilgrim.id);
          return sum + Number(item?.isPaymentComplete);
        }, 0) / pilgrims.length
      : 0) *
      100),
  );
  const funnel = [
    { label: "new", value: 3 },
    { label: "docs", value: 3 },
    { label: "payment", value: 2 },
    { label: "ready", value: 1 },
    { label: "departed", value: 0 },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-3">
        <AnalyticsCard title="Утилизация квот" value="74%" detail="Средняя загрузка по группам оператора" />
        <AnalyticsCard title="Документы" value={`${avgDocCompletion}%`} detail="Средняя полнота пакета документов" />
        <AnalyticsCard title="Сбор оплат" value={`${paymentCollection}%`} detail="Доля паломников с полным статусом paid" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Badge>Quota utilization</Badge>
              <h2 className="mt-4 text-3xl">Нагрузка по группам</h2>
            </div>
          </div>
          <div className="grid gap-4">
            {groups.map((group) => {
              const percent = Math.round((group.quotaFilled / group.quotaTotal) * 100);
              return (
                <div key={group.id} className="subtle-panel p-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span>{group.name}</span>
                    <span className="text-muted-foreground">{percent}%</span>
                  </div>
                  <Progress value={percent} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <Badge variant="secondary">Funnel</Badge>
              <h2 className="mt-4 text-3xl">Путь паломника</h2>
            </div>
          </div>
          <div className="grid gap-3">
            {funnel.map((step, index) => (
              <div
                key={step.label}
                className="rounded-[1.7rem] border border-white/10 px-5 py-4"
                style={{ background: `rgba(255,255,255,${0.08 - index * 0.01})` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{step.label}</span>
                  <span className="text-2xl font-display text-primary">{step.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AnalyticsCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="shell-panel p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}
