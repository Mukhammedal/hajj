"use client";

import { useFormStatus } from "react-dom";

import { signOutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="outline" size="sm" disabled={pending}>
      {pending ? "Выход..." : "Выйти"}
    </Button>
  );
}
