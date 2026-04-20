import type { ComponentType } from "react";
import Link from "next/link";
import { Bell, CalendarDays, CreditCard, FileText, PlaneTakeoff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";

export default async function CabinetDashboardPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet?.payment || !cabinet.group) {
    return null;
  }

  const { pilgrim, readiness, payment, group, notifications: reminders } = cabinet;

  const remainingAmount = payment.totalAmount - payment.paidAmount;

  return (
    <>
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="shell-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="warning">Текущий статус: частичная оплата</Badge>
              <h2 className="mt-4 text-4xl">Добрый вечер, {pilgrim.fullName.split(" ")[0]}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                Система видит, что пакет документов почти закрыт, группа уже назначена, а до перехода в статус ready осталось
                довести оплату и загрузить сертификат вакцинации.
              </p>
            </div>
            <div className="flex h-28 w-28 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-4xl text-primary">
              {readiness.readinessPercent}%
            </div>
          </div>

          <Progress className="mt-6" value={readiness.readinessPercent} />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <SummaryCard
              icon={FileText}
              title="Документы"
              value={`${readiness.docsCount} из 5`}
              detail="Анкета на проверке, вакцинация ещё не загружена"
            />
            <SummaryCard
              icon={CreditCard}
              title="Оплата"
              value={formatKzt(payment.paidAmount)}
              detail={`Осталось ${formatKzt(remainingAmount)}`}
            />
            <SummaryCard
              icon={PlaneTakeoff}
              title="Группа"
              value={group.name}
              detail={`Вылет ${formatDate(group.flightDate)}`}
            />
          </div>
        </div>

        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold">Ближайшие напоминания</p>
              <p className="mt-2 text-sm text-muted-foreground">Очередь уведомлений из CRM и ежедневного cron-джоба.</p>
            </div>
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div className="grid gap-3">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="subtle-panel p-4">
                <div className="flex items-center justify-between gap-3">
                  <Badge variant={reminder.status === "sent" ? "success" : "warning"}>
                    {reminder.status === "sent" ? "Отправлено" : "В очереди"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{formatDate(reminder.scheduledAt)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{reminder.message}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl">Информация по группе</h3>
            <CalendarDays className="h-6 w-6 text-accent" />
          </div>
          <div className="grid gap-4">
            <DetailRow label="Рейс" value={`${formatDate(group.flightDate)} - ${formatDate(group.returnDate)}`} />
            <DetailRow label="Отель в Мекке" value={group.hotelMecca} />
            <DetailRow label="Отель в Медине" value={group.hotelMedina} />
            <DetailRow label="Гид" value={`${group.guideName} · ${group.guidePhone}`} />
            <DetailRow label="Город вылета" value={group.departureCity} />
          </div>
        </div>

        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-3xl">Следующие шаги</h3>
              <p className="mt-2 text-sm text-muted-foreground">Два коротких действия, чтобы выйти на 100% готовности.</p>
            </div>
            <Badge variant="secondary">Optimistic UX</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ActionCard
              href="/cabinet/documents"
              title="Загрузить сертификат вакцинации"
              detail="Документ сразу поднимет процент готовности и уйдёт оператору на проверку."
            />
            <ActionCard
              href="/cabinet/payment"
              title="Закрыть остаток по оплате"
              detail="После статуса paid система автоматически подготовит PDF и QR-проверку договора."
            />
          </div>
        </div>
      </section>
    </>
  );
}

function SummaryCard({
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
    <div className="subtle-panel p-5">
      <Icon className="h-6 w-6 text-primary" />
      <p className="mt-4 text-sm uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold">{value}</p>
    </div>
  );
}

function ActionCard({ href, title, detail }: { href: string; title: string; detail: string }) {
  return (
    <div className="subtle-panel p-5">
      <p className="text-xl font-semibold">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
      <Link href={href} className="mt-4 inline-block">
        <Button variant="outline">Открыть</Button>
      </Link>
    </div>
  );
}
