import { FileText, WalletCards } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentContractActions } from "@/components/crm/payment-contract-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { loadCrmPilgrimDetail } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function CrmPilgrimDetailPage({ params }: { params: { id: string } }) {
  const detail = await loadCrmPilgrimDetail(params.id);

  if (!detail) {
    notFound();
  }

  const { pilgrim, documents, payment, group, readiness, timeline } = detail;

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="shell-panel p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant={readiness.isReady ? "success" : "warning"}>
                {readiness.isReady ? "Ready" : `${readiness.readinessPercent}% готовности`}
              </Badge>
              <h2 className="mt-4 text-4xl">{pilgrim.fullName}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                ИИН {pilgrim.iin} · {pilgrim.phone} · Статус {pilgrim.status}
              </p>
            </div>
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-primary/20 bg-primary/10 font-display text-4xl text-primary">
              {readiness.readinessPercent}
            </div>
          </div>
          <Progress className="mt-6" value={readiness.readinessPercent} />
          <div className="mt-8 grid gap-4">
            <DetailRow label="Группа" value={group?.name ?? "Не назначена"} />
            <DetailRow label="Вылет" value={group ? formatDate(group.flightDate) : "Ожидает"} />
            <DetailRow label="Оплата" value={payment ? `${formatKzt(payment.paidAmount)} / ${formatKzt(payment.totalAmount)}` : "Нет"} />
          </div>
          <PaymentContractActions payment={payment} />
        </div>

        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl">Документы</h3>
            <Badge variant="secondary">{documents.length} файла</Badge>
          </div>
          <div className="grid gap-3">
            {documents.map((document) => (
              <div key={document.id} className="subtle-panel flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{document.fileName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{document.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {document.fileUrl ? (
                    <Link
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Открыть
                    </Link>
                  ) : null}
                  <Badge variant={document.isVerified ? "success" : "warning"}>
                    {document.isVerified ? "Проверено" : "Ждёт проверки"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl">Платёж</h3>
            <WalletCards className="h-6 w-6 text-primary" />
          </div>
          {payment ? (
            <div className="grid gap-3">
              <DetailRow label="Метод" value={payment.paymentMethod} />
              <DetailRow label="Статус" value={payment.status} />
              <DetailRow label="Договор" value={payment.contractUrl ?? "Будет сгенерирован после оплаты"} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Платёж ещё не создан.</p>
          )}
        </div>

        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl">Таймлайн событий</h3>
            <Badge>{timeline.length} записи</Badge>
          </div>
          <div className="grid gap-4">
            {timeline.length ? (
              timeline.map((event) => (
                <div key={event.id} className="subtle-panel p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.timestamp)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.detail}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">История событий пока пустая.</p>
            )}
          </div>
        </div>
      </section>
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
