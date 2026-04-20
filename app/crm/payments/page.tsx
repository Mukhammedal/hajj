import { Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";

function monthLabel(date: string) {
  return new Intl.DateTimeFormat("ru-RU", { month: "long" }).format(new Date(date));
}

export default async function CrmPaymentsPage() {
  const crm = await loadCrmBundle();
  const pilgrimMap = new Map((crm?.pilgrims ?? []).map((pilgrim) => [pilgrim.id, pilgrim]));
  const payments = (crm?.payments ?? [])
    .map((payment) => {
      const pilgrim = pilgrimMap.get(payment.pilgrimId);
      return pilgrim ? { pilgrim, payment } : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  const monthlyRevenue = Array.from(
    (crm?.payments ?? []).reduce((accumulator, payment) => {
      const key = payment.createdAt.slice(0, 7);
      const current = accumulator.get(key) ?? { month: monthLabel(payment.createdAt), value: 0 };
      current.value += payment.paidAmount;
      accumulator.set(key, current);
      return accumulator;
    }, new Map<string, { month: string; value: number }>()),
  )
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([, value]) => value);

  const chartData = monthlyRevenue.length ? monthlyRevenue : [{ month: "Нет данных", value: 0 }];
  const maxRevenue = Math.max(1, ...chartData.map((entry) => entry.value));

  return (
    <div className="grid gap-6">
      <section className="shell-panel p-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge>Платёжный контур v1</Badge>
            <h2 className="mt-4 text-4xl">Оплаты и выручка</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
              Реальный эквайринг не входит в v1, но таблица и вебхук-заглушка уже готовы для Kaspi/Halyk интеграции.
            </p>
          </div>
          <Button variant="outline">Статус: все</Button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl">Выручка по месяцам</h3>
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {chartData.map((entry) => (
              <div key={entry.month} className="flex flex-col justify-end rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                <div
                  className="rounded-2xl bg-gradient-to-t from-secondary via-primary to-accent"
                  style={{ height: `${Math.max(20, (entry.value / maxRevenue) * 180)}px` }}
                />
                <p className="mt-4 text-sm text-muted-foreground">{entry.month}</p>
                <p className="mt-2 text-lg font-semibold">{formatKzt(entry.value)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-panel overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Паломник</th>
                  <th className="px-5 py-4">Сумма</th>
                  <th className="px-5 py-4">Оплачено</th>
                  <th className="px-5 py-4">Статус</th>
                  <th className="px-5 py-4">Создано</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(({ pilgrim, payment }) => (
                  <tr key={payment.id} className="border-b border-white/8 last:border-b-0">
                    <td className="px-5 py-4">{pilgrim.fullName}</td>
                    <td className="px-5 py-4">{formatKzt(payment.totalAmount)}</td>
                    <td className="px-5 py-4">{formatKzt(payment.paidAmount)}</td>
                    <td className="px-5 py-4">
                      <Badge variant={payment.status === "paid" ? "success" : payment.status === "partial" ? "warning" : "muted"}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-2">
                        <p>{formatDate(payment.createdAt)}</p>
                        <Badge variant={payment.contractUrl ? "success" : "muted"}>
                          {payment.contractUrl ? "Договор готов" : "Договор не создан"}
                        </Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
