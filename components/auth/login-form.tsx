"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { initialActionState, signInAction } from "@/lib/actions/auth-actions";
import { loginSchema, type LoginInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [state, action] = useFormState(signInAction, initialActionState);
  const [values, setValues] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const validation = useMemo(() => loginSchema.safeParse(values), [values]);
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Email</label>
        <Input
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="operator@hajjcrm.kz"
          required
        />
        <FieldError error={clientErrors.email?.[0] ?? state.fieldErrors?.email?.[0]} />
      </div>
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Пароль</label>
        <Input
          name="password"
          type="password"
          value={values.password}
          onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="••••••••"
          required
          minLength={6}
        />
        <FieldError error={clientErrors.password?.[0] ?? state.fieldErrors?.password?.[0]} />
      </div>
      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-danger" : "text-sm text-success"}>{state.message}</p>
      ) : null}
      <SubmitButton disabled={!validation.success} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Входим..." : "Войти"}
    </Button>
  );
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="mt-2 text-sm text-danger">{error}</p> : null;
}
