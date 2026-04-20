"use client";

import { useFormStatus } from "react-dom";

import { verifyOperatorAction } from "@/lib/actions/hajj-actions";
import { Button } from "@/components/ui/button";

export function OperatorVerifyButton({
  operatorId,
  isVerified,
}: {
  operatorId: string;
  isVerified: boolean;
}) {
  const action = verifyOperatorAction.bind(null, operatorId, !isVerified);

  return (
    <form action={action}>
      <SubmitButton isVerified={isVerified} />
    </form>
  );
}

function SubmitButton({ isVerified }: { isVerified: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button size="sm" variant={isVerified ? "outline" : "default"} disabled={pending}>
      {pending ? "Сохраняем..." : isVerified ? "Отозвать" : "Подтвердить"}
    </Button>
  );
}
