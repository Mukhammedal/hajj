"use client";

import { useMemo, useState } from "react";

import { DesignIcon } from "@/components/shell/design-icons";
import { registerSchema } from "@/lib/validation";
import { cn } from "@/lib/utils";

type RegisterFormState = {
  accepted: boolean;
  email: string;
  firstName: string;
  iin: string;
  lastName: string;
  password: string;
  phone: string;
  role: "pilgrim" | "operator";
};

export function RegisterForm() {
  const [values, setValues] = useState<RegisterFormState>({
    role: "pilgrim",
    firstName: "Ерлан",
    lastName: "Мухаметов",
    email: "erlan.mukhametov@gmail.com",
    phone: "+77075551123",
    iin: "900815000123",
    password: "",
    accepted: true,
  });

  const validation = useMemo(() => registerSchema.safeParse(values), [values]);
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  return (
    <form className="grid gap-5" onSubmit={(event) => event.preventDefault()}>
      <div className="role-switch">
        <button
          className={cn("role", values.role === "pilgrim" && "on")}
          onClick={() => setValues((prev) => ({ ...prev, role: "pilgrim" }))}
          type="button"
        >
          <div className="ic" style={values.role === "pilgrim" ? { background: "var(--ink)", color: "var(--cream)" } : undefined}>
            <DesignIcon name="pin" size={16} />
          </div>
          <h5>Паломник</h5>
          <p>Я иду в хадж или умру · частное лицо</p>
        </button>
        <button
          className={cn("role", values.role === "operator" && "on")}
          onClick={() => setValues((prev) => ({ ...prev, role: "operator" }))}
          type="button"
        >
          <div className="ic">
            <DesignIcon name="doc" size={16} />
          </div>
          <h5>Оператор</h5>
          <p>Лицензированная турфирма · CRM для групп</p>
        </button>
      </div>

      <div className="grid-2">
        <Field
          error={clientErrors.firstName?.[0]}
          label="Имя"
          name="firstName"
          onChange={(value) => setValues((prev) => ({ ...prev, firstName: value }))}
          value={values.firstName}
        />
        <Field
          error={clientErrors.lastName?.[0]}
          label="Фамилия"
          name="lastName"
          onChange={(value) => setValues((prev) => ({ ...prev, lastName: value }))}
          value={values.lastName}
        />
      </div>

      <Field
        error={clientErrors.email?.[0]}
        label="Email"
        name="email"
        onChange={(value) => setValues((prev) => ({ ...prev, email: value }))}
        type="email"
        value={values.email}
      />

      <div className="grid-2">
        <Field
          error={clientErrors.phone?.[0]}
          hint="+7XXXXXXXXXX"
          label="Телефон"
          name="phone"
          onChange={(value) => setValues((prev) => ({ ...prev, phone: value }))}
          value={values.phone}
        />
        <Field
          error={clientErrors.iin?.[0]}
          hint="12 цифр, середина маскируется"
          label="ИИН"
          name="iin"
          onChange={(value) => setValues((prev) => ({ ...prev, iin: value }))}
          value={values.iin}
        />
      </div>

      <Field
        error={clientErrors.password?.[0]}
        hint="минимум 10 символов, 1 цифра"
        label="Пароль"
        name="password"
        onChange={(value) => setValues((prev) => ({ ...prev, password: value }))}
        type="password"
        value={values.password}
      />

      <label className="check-row" style={{ cursor: "pointer" }}>
        <input
          checked={values.accepted}
          onChange={(event) => setValues((prev) => ({ ...prev, accepted: event.target.checked }))}
          type="checkbox"
        />
        <div>
          Согласен с <a href="#">офертой</a> и <a href="#">политикой</a>. Обработка персональных данных регулируется
          законом РК <b>№94-V</b> «О персональных данных».
        </div>
      </label>
      <FieldError error={clientErrors.accepted?.[0]} />

      <button className="btn btn-dark btn-lg" disabled={!validation.success} style={{ justifyContent: "center" }} type="submit">
        Создать аккаунт <span className="arr">›</span>
      </button>
    </form>
  );
}

function Field({
  error,
  hint,
  label,
  name,
  onChange,
  type = "text",
  value,
}: {
  error?: string;
  hint?: string;
  label: string;
  name: string;
  onChange: (value: string) => void;
  type?: string;
  value: string;
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} onChange={(event) => onChange(event.target.value)} type={type} value={value} />
      {hint ? <span className="hint">{hint}</span> : null}
      <FieldError error={error} />
    </div>
  );
}

function FieldError({ error }: { error?: string }) {
  return error ? <p className="text-sm text-danger">{error}</p> : null;
}
