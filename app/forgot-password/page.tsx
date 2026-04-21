"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";

import { requestPasswordResetAction } from "@/lib/actions/password-actions";

const initialState = { status: "idle" as const, message: "", fieldErrors: {} };

export default function ForgotPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordResetAction, initialState);

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <h1 className="mb-2 text-2xl font-semibold text-gray-900">Восстановление пароля</h1>
      <p className="mb-8 text-sm text-gray-600">
        Укажите email, на который вы регистрировали аккаунт. Мы отправим ссылку для сброса
        пароля.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {state.fieldErrors?.email?.[0] && (
            <p className="mt-1 text-xs text-red-600">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        {state.message && (
          <div
            className={`rounded-lg px-3 py-2 text-sm ${
              state.status === "error"
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {state.message}
          </div>
        )}

        <SubmitButton />

        <div className="pt-2 text-center">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Вернуться ко входу
          </Link>
        </div>
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
      {pending ? "Отправка..." : "Отправить ссылку"}
    </button>
  );
}
