"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { initialActionState, createGroupAction } from "@/lib/actions/hajj-actions";
import { groupSchema, type GroupInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initialValues: GroupInput = {
  name: "",
  flightDate: "",
  returnDate: "",
  hotelMecca: "",
  hotelMedina: "",
  quotaTotal: 40,
  guideName: "",
  guidePhone: "",
  departureCity: "Almaty",
};

export function GroupCreateForm() {
  const [state, action] = useFormState(createGroupAction, initialActionState);
  const [values, setValues] = useState<GroupInput>(initialValues);
  const validation = useMemo(() => groupSchema.safeParse(values), [values]);
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  return (
    <form action={action} className="grid gap-4">
      <FormField label="Название группы" error={clientErrors.name?.[0] ?? state.fieldErrors?.name?.[0]}>
        <Input
          name="name"
          value={values.name}
          onChange={(event) => setValues((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Хадж 2026 | Алматы B"
          required
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Дата вылета" error={clientErrors.flightDate?.[0] ?? state.fieldErrors?.flightDate?.[0]}>
          <Input
            name="flightDate"
            type="date"
            value={values.flightDate}
            onChange={(event) => setValues((prev) => ({ ...prev, flightDate: event.target.value }))}
            required
          />
        </FormField>
        <FormField label="Дата возврата" error={clientErrors.returnDate?.[0] ?? state.fieldErrors?.returnDate?.[0]}>
          <Input
            name="returnDate"
            type="date"
            value={values.returnDate}
            onChange={(event) => setValues((prev) => ({ ...prev, returnDate: event.target.value }))}
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Отель в Мекке" error={clientErrors.hotelMecca?.[0] ?? state.fieldErrors?.hotelMecca?.[0]}>
          <Input
            name="hotelMecca"
            value={values.hotelMecca}
            onChange={(event) => setValues((prev) => ({ ...prev, hotelMecca: event.target.value }))}
            placeholder="Swissotel Makkah"
            required
          />
        </FormField>
        <FormField label="Отель в Медине" error={clientErrors.hotelMedina?.[0] ?? state.fieldErrors?.hotelMedina?.[0]}>
          <Input
            name="hotelMedina"
            value={values.hotelMedina}
            onChange={(event) => setValues((prev) => ({ ...prev, hotelMedina: event.target.value }))}
            placeholder="Anwar Al Madinah"
            required
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Квота" error={clientErrors.quotaTotal?.[0] ?? state.fieldErrors?.quotaTotal?.[0]}>
          <Input
            name="quotaTotal"
            type="number"
            min={1}
            value={String(values.quotaTotal)}
            onChange={(event) => setValues((prev) => ({ ...prev, quotaTotal: Number(event.target.value || 0) }))}
            required
          />
        </FormField>
        <div>
          <label className="mb-2 block text-sm text-muted-foreground">Город вылета</label>
          <select
            name="departureCity"
            value={values.departureCity}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, departureCity: event.target.value as GroupInput["departureCity"] }))
            }
            className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Almaty">Алматы</option>
            <option value="Astana">Астана</option>
            <option value="Shymkent">Шымкент</option>
            <option value="Turkestan">Туркестан</option>
            <option value="Aktau">Актау</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Имя гида" error={clientErrors.guideName?.[0] ?? state.fieldErrors?.guideName?.[0]}>
          <Input
            name="guideName"
            value={values.guideName}
            onChange={(event) => setValues((prev) => ({ ...prev, guideName: event.target.value }))}
            placeholder="Мурат Абдуллаев"
            required
          />
        </FormField>
        <FormField label="Телефон гида" error={clientErrors.guidePhone?.[0] ?? state.fieldErrors?.guidePhone?.[0]}>
          <Input
            name="guidePhone"
            value={values.guidePhone}
            onChange={(event) => setValues((prev) => ({ ...prev, guidePhone: event.target.value }))}
            placeholder="+7 707 700 12 12"
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
      {pending ? "Создаём..." : "Создать группу"}
    </Button>
  );
}
