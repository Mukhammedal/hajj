"use client";

import { useFormState, useFormStatus } from "react-dom";

import { resetPasswordAction } from "@/lib/actions/password-actions";

const initialState = { status: "idle" as const, message: "", fieldErrors: {} };

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(resetPasswordAction, initialState);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Новый пароль</h1>
      <p className="mb-8 text-sm text-gray-600">
        Задайте новый пароль. Минимум 10 символов, должна быть хотя бы одна цифра.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
            Новый пароль
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {state.fieldErrors?.password?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="passwordConfirm"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Повторите пароль
          </label>
          <input
            id="passwordConfirm"
            name="passwordConfirm"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {state.fieldErrors?.passwordConfirm?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.passwordConfirm[0]}</p>
          )}
        </div>

        {state.message && state.status === "error" && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.message}
          </div>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
    >
      {pending ? "Обновление..." : "Сохранить пароль"}
    </button>
  );
}
