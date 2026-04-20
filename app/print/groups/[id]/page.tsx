import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintPageButton } from "@/components/print/print-page-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireAnyRole } from "@/lib/auth";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function PrintGroupPage({ params }: { params: { id: string } }) {
  await requireAnyRole(["operator"]);

  const crm = await loadCrmBundle();

  if (!crm) {
    notFound();
  }

  const group = crm.groups.find((item) => item.id === params.id);

  if (!group) {
    notFound();
  }

  const readinessMap = new Map(crm.readiness.map((item) => [item.pilgrimId, item]));
  const paymentMap = new Map(crm.payments.map((item) => [item.pilgrimId, item]));
  const pilgrimMap = new Map(crm.pilgrims.map((item) => [item.id, item]));
  const members = crm.groupLinks
    .filter((link) => link.groupId === group.id)
    .map((link) => ({
      pilgrim: pilgrimMap.get(link.pilgrimId),
      readiness: readinessMap.get(link.pilgrimId),
      payment: paymentMap.get(link.pilgrimId),
    }))
    .filter((item) => item.pilgrim);

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href="/crm/groups" className={cn(buttonVariants({ variant: "outline" }), "border-slate-300 bg-white text-slate-900")}>
            Назад в CRM
          </Link>
          <PrintPageButton />
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Badge className="border-slate-300 bg-slate-100 text-slate-700">Печатная форма</Badge>
              <h1 className="mt-4 text-4xl text-slate-900">{group.name}</h1>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Вылет {formatDate(group.flightDate)} · Возврат {formatDate(group.returnDate)} · {group.departureCity}
              </p>
              <p className="text-sm leading-7 text-slate-600">
                {group.hotelMecca} / {group.hotelMedina}
              </p>
            </div>
            <div className="grid gap-2 text-sm text-slate-600">
              <p>Оператор: {crm.operator?.companyName ?? "HajjCRM"}</p>
              <p>Гид: {group.guideName || "Не указан"}</p>
              <p>Телефон гида: {group.guidePhone || "Не указан"}</p>
              <p>Квота: {group.quotaFilled}/{group.quotaTotal}</p>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Паломник</th>
                  <th className="px-4 py-3">ИИН</th>
                  <th className="px-4 py-3">Телефон</th>
                  <th className="px-4 py-3">Оплата</th>
                  <th className="px-4 py-3">Готовность</th>
                </tr>
              </thead>
              <tbody>
                {members.length ? (
                  members.map((member) => (
                    <tr key={member.pilgrim?.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 font-medium text-slate-900">{member.pilgrim?.fullName}</td>
                      <td className="px-4 py-3">{member.pilgrim?.iin}</td>
                      <td className="px-4 py-3">{member.pilgrim?.phone}</td>
                      <td className="px-4 py-3">
                        {member.payment?.status === "paid"
                          ? "Оплачено"
                          : member.payment?.status === "partial"
                            ? "Частично"
                            : "Ожидает"}
                      </td>
                      <td className="px-4 py-3">{formatPercent(member.readiness?.readinessPercent ?? 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      В группе пока нет паломников.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
