import { AlertOctagon, BadgeCheck, Shield } from "lucide-react";

import { SiteHeader } from "@/components/shell/site-header";
import { Badge } from "@/components/ui/badge";
import { loadPublicVerification } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";

export default async function VerifyQrPage({ params }: { params: { qr_code: string } }) {
  const verification = await loadPublicVerification(params.qr_code);

  return (
    <div className="page-wrap">
      <SiteHeader />
      <main className="mx-auto flex max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <section className="shell-panel w-full p-8">
          <div className="flex flex-col gap-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Публичная проверка контракта</p>
                <h1 className="mt-3 text-5xl">QR verification</h1>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Shield className="h-8 w-8" />
              </div>
            </div>

            {verification ? (
              <>
                <Badge variant="success" className="w-fit">
                  VERIFIED
                </Badge>
                <div className="grid gap-4 sm:grid-cols-2">
                  <InfoCard label="Оператор" value={verification.operator.companyName} />
                  <InfoCard label="Паломник" value={verification.pilgrim.fullName} />
                  <InfoCard label="Сумма договора" value={formatKzt(verification.payment.totalAmount)} />
                  <InfoCard
                    label="Статус оплаты"
                    value={
                      verification.payment.status === "paid"
                        ? "Оплачено"
                        : verification.payment.status === "partial"
                          ? "Частично"
                          : "Ожидает"
                    }
                  />
                  <InfoCard
                    label="Дата генерации договора"
                    value={verification.payment.contractGeneratedAt ? formatDate(verification.payment.contractGeneratedAt) : "Не создан"}
                  />
                  <InfoCard label="QR код" value={verification.payment.qrCode ?? "Не присвоен"} />
                </div>
              </>
            ) : (
              <>
                <Badge variant="danger" className="w-fit">
                  NOT FOUND
                </Badge>
                <div className="subtle-panel flex items-start gap-4 p-5">
                  <AlertOctagon className="mt-1 h-6 w-6 text-danger" />
                  <div>
                    <p className="text-xl font-semibold">Контракт не найден</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">
                      Проверьте корректность QR-кода. Если проблема сохраняется, обратитесь к вашему оператору хаджа.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="subtle-panel p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-xl font-semibold">{value}</p>
    </div>
  );
}
