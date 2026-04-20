"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { initialActionState, createPilgrimAction } from "@/lib/actions/hajj-actions";
import { pilgrimCreateSchema, type PilgrimCreateInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialValues: PilgrimCreateInput = {
  fullName: "",
  iin: "",
  phone: "",
  dateOfBirth: "",
  gender: "male",
  email: "",
  password: "",
};

export function PilgrimCreateForm() {
  const [state, action] = useFormState(createPilgrimAction, initialActionState);
  const [values, setValues] = useState<PilgrimCreateInput>(initialValues);
  const validation = useMemo(() => pilgrimCreateSchema.safeParse(values), [values]);
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  return (
    <form action={action} className="grid gap-4">
      <FormField label="ФИО" error={clientErrors.fullName?.[0] ?? state.fieldErrors?.fullName?.[0]}>
        <Input
          name="fullName"
          value={values.fullName}
          onChange={(event) => setValues((prev) => ({ ...prev, fullName: event.target.value }))}
          placeholder="Айгерим Нурланова"
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="ИИН" error={clientErrors.iin?.[0] ?? state.fieldErrors?.iin?.[0]}>
          <Input
            name="iin"
            value={values.iin}
            maxLength={12}
            onChange={(event) => setValues((prev) => ({ ...prev, iin: event.target.value.replace(/\D/g, "") }))}
            placeholder="990101300123"
            required
          />
        </FormField>
        <FormField label="Телефон" error={clientErrors.phone?.[0] ?? state.fieldErrors?.phone?.[0]}>
          <Input
            name="phone"
            value={values.phone}
            onChange={(event) => setValues((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+7 700 123 45 67"
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Дата рождения" error={clientErrors.dateOfBirth?.[0] ?? state.fieldErrors?.dateOfBirth?.[0]}>
          <Input
            name="dateOfBirth"
            type="date"
            value={values.dateOfBirth}
            onChange={(event) => setValues((prev) => ({ ...prev, dateOfBirth: event.target.value }))}
            required
          />
        </FormField>
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">Пол</label>
          <select
            name="gender"
            value={values.gender}
            onChange={(event) => setValues((prev) => ({ ...prev, gender: event.target.value as PilgrimCreateInput["gender"] }))}
            className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
          {clientErrors.gender?.[0] ?? state.fieldErrors?.gender?.[0] ? (
            <p className="mt-2 text-sm text-danger">{clientErrors.gender?.[0] ?? state.fieldErrors?.gender?.[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email для входа" error={clientErrors.email?.[0] ?? state.fieldErrors?.email?.[0]}>
          <Input
            name="email"
            type="email"
            value={values.email}
            onChange={(event) => setValues((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="pilgrim@hajjcrm.kz"
            required
          />
        </FormField>
        <FormField label="Пароль" error={clientErrors.password?.[0] ?? state.fieldErrors?.password?.[0]}>
          <Input
            name="password"
            type="password"
            value={values.password}
            onChange={(event) => setValues((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Минимум 8 символов"
            required
          />
        </FormField>
      </div>

      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-danger" : "text-sm text-success"}>{state.message}</p>
      ) : null}
      <SubmitButton disabled={!validation.success} />
    </form>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-muted-foreground">{label}</label>
      {children}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Создаём..." : "Создать паломника"}
    </Button>
  );
}
