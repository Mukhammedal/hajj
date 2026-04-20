"use client";

import { useFormStatus } from "react-dom";
import { FilePlus2, WalletMinimal, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateContractAction, markPaymentPaidAction } from "@/lib/actions/hajj-actions";
import type { PaymentRecord } from "@/types/domain";

export function PaymentContractActions({ payment }: { payment: PaymentRecord | null }) {
  if (!payment) {
    return null;
  }

  const markPaid = markPaymentPaidAction.bind(null, payment.id);
  const generateContract = generateContractAction.bind(null, payment.id);

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {payment.status !== "paid" ? (
        <form action={markPaid}>
          <SubmitButton icon={WalletMinimal} pendingLabel="Обновляем..." label="Отметить как оплаченный" />
        </form>
      ) : null}
      <form action={generateContract}>
        <SubmitButton
          icon={FilePlus2}
          pendingLabel="Генерируем..."
          label={payment.contractUrl ? "Перегенерировать договор" : "Сгенерировать договор"}
          disabled={payment.status !== "paid"}
          variant={payment.status === "paid" ? "outline" : "secondary"}
        />
      </form>
    </div>
  );
}

function SubmitButton({
  disabled,
  icon: Icon,
  label,
  pendingLabel,
  variant = "default",
}: {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  pendingLabel: string;
  variant?: "default" | "outline" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <Button disabled={disabled || pending} variant={variant}>
      <Icon className="h-4 w-4" />
      {pending ? pendingLabel : label}
    </Button>
  );
}
