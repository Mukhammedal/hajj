import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { Download, QrCode, ReceiptText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";
import { buildInstallmentSchedule } from "@/lib/contracts";
import { cn } from "@/lib/utils";

export default async function CabinetPaymentPage() {
  const cabinet = await loadCabinetBundle();
  const payment = cabinet?.payment;

  if (!payment) {
    return null;
  }

  const qrDataUrl = await QRCode.toDataURL(payment.qrCode ?? "pending-contract");
  const installmentPlan = buildInstallmentSchedule(payment);
  const remainingAmount = Math.max(payment.totalAmount - payment.paidAmount, 0);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="shell-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant={payment.status === "paid" ? "success" : payment.status === "partial" ? "warning" : "muted"}>
              {payment.status === "paid" ? "Оплата завершена" : payment.status === "partial" ? "Частичная оплата" : "Ожидает оплаты"}
            </Badge>
            <h2 className="mt-4 text-4xl">Оплата и договор</h2>
          </div>
          <ReceiptText className="h-7 w-7 text-primary" />
        </div>

        <div className="mt-8 grid gap-4">
          <DetailRow label="Общая сумма" value={formatKzt(payment.totalAmount)} />
          <DetailRow label="Оплачено" value={formatKzt(payment.paidAmount)} />
          <DetailRow label="Остаток" value={formatKzt(remainingAmount)} />
          <DetailRow
            label="Статус"
            value={payment.status === "paid" ? "Оплачено" : payment.status === "partial" ? "Частично оплачено" : "Ожидает"}
          />
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {payment.contractUrl ? (
            <Link href={payment.contractUrl} target="_blank" rel="noreferrer" className={cn(buttonVariants())}>
              <Download className="h-4 w-4" />
              Скачать PDF договора
            </Link>
          ) : (
            <span className={cn(buttonVariants(), "pointer-events-none opacity-50")}>
              <Download className="h-4 w-4" />
              Договор появится после статуса paid
            </span>
          )}

          {payment.qrCode ? (
            <Link href={`/verify/${payment.qrCode}`} className={cn(buttonVariants({ variant: "outline" }))}>
              <QrCode className="h-4 w-4" />
              Открыть QR-проверку
            </Link>
          ) : (
            <span className={cn(buttonVariants({ variant: "outline" }), "pointer-events-none opacity-50")}>
              <QrCode className="h-4 w-4" />
              QR появится после генерации договора
            </span>
          )}
        </div>
      </section>

      <section className="grid gap-6">
        <div className="shell-panel p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-3xl">График оплаты</h3>
            <Badge variant="secondary">{payment.installmentPlan ? `${payment.installmentMonths ?? 0} месяца` : "Без рассрочки"}</Badge>
          </div>
          <div className="grid gap-3">
            {installmentPlan.map((entry, index) => (
              <div key={`${index}-${entry.amount}`} className="subtle-panel flex items-center justify-between p-4">
                <div>
                  <p className="font-semibold">{entry.label instanceof Date ? formatDate(entry.label.toISOString()) : entry.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{formatKzt(entry.amount)}</p>
                </div>
                <Badge variant={entry.status === "paid" ? "success" : entry.status === "partial" ? "warning" : "muted"}>
                  {entry.status === "paid" ? "Оплачен" : entry.status === "partial" ? "Частично" : "Ожидает"}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="shell-panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-3xl font-semibold">QR договора</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                После генерации договора QR-код открывает публичную страницу проверки без авторизации.
              </p>
            </div>
            <Badge variant="muted">Hash: {payment.qrCode ?? "ещё не присвоен"}</Badge>
          </div>
          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-center">
            <Image
              src={qrDataUrl}
              alt="QR договора"
              width={160}
              height={160}
              unoptimized
              className="h-40 w-40 rounded-[1.8rem] border border-white/10 bg-white p-3"
            />
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Сгенерирован: {payment.contractGeneratedAt ? formatDate(payment.contractGeneratedAt) : "ещё не создан"}</p>
              <p>Способ оплаты: {payment.paymentMethod}</p>
              <p>Создан платёж: {formatDate(payment.createdAt)}</p>
              <p>История: зафиксировано {formatKzt(payment.paidAmount)} из {formatKzt(payment.totalAmount)}</p>
            </div>
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
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
