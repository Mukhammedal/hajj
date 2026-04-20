"use client";

import { BellRing } from "lucide-react";
import { useFormState, useFormStatus } from "react-dom";

import { initialActionState } from "@/lib/actions/action-state";
import { sendFlightBroadcastAction } from "@/lib/actions/hajj-actions";
import { Button } from "@/components/ui/button";

export function GroupFlightBroadcastButton({
  groupId,
  isDisabled,
}: {
  groupId: string;
  isDisabled: boolean;
}) {
  const [state, action] = useFormState(sendFlightBroadcastAction.bind(null, groupId), initialActionState);

  return (
    <div className="grid gap-2">
      <form action={action}>
        <SubmitButton disabled={isDisabled} />
      </form>
      {state.message ? (
        <p className={state.status === "error" ? "text-xs text-danger" : "text-xs text-success"}>{state.message}</p>
      ) : null}
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="sm" variant="secondary" disabled={disabled || pending}>
      <BellRing className="h-4 w-4" />
      {pending ? "Отправляем..." : "Рассылка перед вылетом"}
    </Button>
  );
}
