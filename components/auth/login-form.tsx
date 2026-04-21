"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { signInAction } from "@/lib/actions/auth-actions";
import { initialActionState } from "@/lib/actions/action-state";
import { loginSchema, type LoginInput } from "@/lib/validation";

export function LoginForm() {
  const [state, action] = useFormState(signInAction, initialActionState);
  const [values, setValues] = useState<LoginInput>({
    email: "erlan.mukhametov@gmail.com",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);

  const validation = useMemo(() => loginSchema.safeParse(values), [values]);
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  return (
    <form action={action} className="grid gap-5">
      <div className="field">
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="erlan.mukhametov@gmail.com"
          required
        />
        <FieldError error={clientErrors.email?.[0] ?? state.fieldErrors?.email?.[0]} />
      </div>
      <div className="field">
        <label>Пароль</label>
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
          placeholder="••••••••"
          required
          minLength={6}
        />
        <FieldError error={clientErrors.password?.[0] ?? state.fieldErrors?.password?.[0]} />
        <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--ink-soft)", fontWeight: 600 }}>
          Забыли пароль?
        </Link>
      </div>
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <label className="check-row" style={{ cursor: "pointer" }}>
          <input checked={rememberMe} onChange={() => setRememberMe((prev) => !prev)} type="checkbox" />
          <div>Запомнить меня на этом устройстве</div>
        </label>
      </div>
      {state.message ? <p className={state.status === "error" ? "text-sm text-danger" : "text-sm text-success"}>{state.message}</p> : null}
      <SubmitButton disabled={!validation.success} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-dark btn-lg" disabled={disabled || pending} style={{ justifyContent: "center" }} type="submit">
      {pending ? "Входим..." : "Войти"} <span className="arr">›</span>
    </button>
  );
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="text-sm text-danger">{error}</p> : null;
}
