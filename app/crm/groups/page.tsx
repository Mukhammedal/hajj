import Link from "next/link";
import { BellRing, PlusCircle, Printer } from "lucide-react";

import { GroupFlightBroadcastButton } from "@/components/crm/group-flight-broadcast-button";
import { GroupCreateForm } from "@/components/crm/group-create-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function CrmGroupsPage() {
  const crm = await loadCrmBundle();
  const groups = crm?.groups ?? [];
  const readinessMap = new Map((crm?.readiness ?? []).map((item) => [item.pilgrimId, item]));
  const paymentMap = new Map((crm?.payments ?? []).map((item) => [item.pilgrimId, item]));
  const pilgrimMap = new Map((crm?.pilgrims ?? []).map((item) => [item.id, item]));
  const membersByGroup = new Map(
    groups.map((group) => [
      group.id,
      (crm?.groupLinks ?? [])
        .filter((link) => link.groupId === group.id)
        .map((link) => ({
          pilgrim: pilgrimMap.get(link.pilgrimId),
          readiness: readinessMap.get(link.pilgrimId),
          payment: paymentMap.get(link.pilgrimId),
        }))
        .filter((item) => item.pilgrim),
    ]),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="shell-panel p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Badge>Группы и квоты</Badge>
            <h2 className="mt-4 text-4xl">Рейсы сезона</h2>
          </div>
        </div>
        <div className="grid gap-4">
          {groups.map((group) => {
            const percent = Math.round((group.quotaFilled / group.quotaTotal) * 100);
            const members = membersByGroup.get(group.id) ?? [];
            return (
              <div key={group.id} className="subtle-panel p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-2xl font-semibold">{group.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatDate(group.flightDate)} - {formatDate(group.returnDate)} · {group.departureCity}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {group.hotelMecca} / {group.hotelMedina}
                    </p>
                  </div>
                  <div className="min-w-[180px]">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Квота</span>
                      <span>{group.quotaFilled}/{group.quotaTotal}</span>
                    </div>
                    <Progress value={percent} />
                    <p className="mt-3 text-sm text-muted-foreground">Прайс от {formatKzt(group.priceFrom)}</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href={`/print/groups/${group.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
                  >
                    <Printer className="h-4 w-4" />
                    Печать списка
                  </Link>
                  <GroupFlightBroadcastButton groupId={group.id} isDisabled={!members.length} />
                </div>
                <div className="mt-5 grid gap-3 border-t border-white/10 pt-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Состав группы</span>
                    <Badge variant={members.length ? "default" : "muted"}>{members.length} паломн.</Badge>
                  </div>
                  {members.length ? (
                    members.map((member) => (
                      <div key={member.pilgrim?.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div>
                            <p className="font-semibold">{member.pilgrim?.fullName}</p>
                            <p className="mt-1 text-sm text-muted-foreground">{member.pilgrim?.phone}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant={member.payment?.status === "paid" ? "success" : member.payment?.status === "partial" ? "warning" : "muted"}>
                              {member.payment?.status === "paid"
                                ? "Оплачено"
                                : member.payment?.status === "partial"
                                  ? "Частично"
                                  : "Ожидает оплату"}
                            </Badge>
                            <Badge variant={member.readiness?.isReady ? "success" : "warning"}>
                              {formatPercent(member.readiness?.readinessPercent ?? 0)}
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-3">
                          <Progress value={member.readiness?.readinessPercent ?? 0} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-7 text-muted-foreground">
                      В этой группе пока нет назначенных паломников. Назначение делается на странице CRM паломников.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="shell-panel p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-3xl">Создать группу</h3>
            <p className="mt-2 text-sm text-muted-foreground">Поля соответствуют ТЗ: рейс, отели, квота, гид и город вылета.</p>
          </div>
          <PlusCircle className="h-6 w-6 text-primary" />
        </div>
        <div className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <BellRing className="h-4 w-4 text-primary" />
          Отсюда оператор печатает список группы и запускает массовую рассылку перед вылетом.
        </div>
        <GroupCreateForm />
      </section>
    </div>
  );
}
