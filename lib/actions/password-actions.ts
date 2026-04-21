"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import type { ActionState } from "@/lib/actions/action-state";
import { routeForRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
});

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(10, "Минимум 10 символов")
      .regex(/\d/, "Добавьте хотя бы одну цифру"),
    passwordConfirm: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Пароли не совпадают",
    path: ["passwordConfirm"],
  });

export async function requestPasswordResetAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте email",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: "Демо-режим: письмо не отправляется. Задайте Supabase env.",
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const redirectTo = `${siteUrl}/reset-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo,
  });

  if (error) {
    console.warn("[auth] password reset request failed", {
      email: parsed.data.email,
      error: error.message,
    });
  }

  return {
    status: "success",
    message:
      "Если указанный email зарегистрирован, на него отправлена ссылка для сброса пароля.",
    fieldErrors: {},
  };
}

export async function resetPasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте заполнение формы",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Supabase не настроен.",
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return {
      status: "error",
      message: "Ссылка для сброса пароля недействительна или истекла. Запросите новую.",
      fieldErrors: {},
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: {},
    };
  }

  const role = userData.user.app_metadata?.role ?? userData.user.user_metadata?.role ?? null;
  redirect(routeForRole(role));
}

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Введите текущий пароль"),
    newPassword: z
      .string()
      .min(10, "Минимум 10 символов")
      .regex(/\d/, "Добавьте хотя бы одну цифру"),
    newPasswordConfirm: z.string().min(1, "Подтвердите новый пароль"),
  })
  .refine((v) => v.newPassword === v.newPasswordConfirm, {
    message: "Пароли не совпадают",
    path: ["newPasswordConfirm"],
  });

export async function changePasswordAction(
  _: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    newPasswordConfirm: formData.get("newPasswordConfirm"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте заполнение формы",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Supabase не настроен.",
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user?.email) {
    return {
      status: "error",
      message: "Сессия не найдена.",
      fieldErrors: {},
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: userData.user.email,
    password: parsed.data.currentPassword,
  });

  if (signInError) {
    return {
      status: "error",
      message: "Текущий пароль неверен.",
      fieldErrors: { currentPassword: ["Текущий пароль неверен"] },
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: {},
    };
  }

  return {
    status: "success",
    message: "Пароль обновлён.",
    fieldErrors: {},
  };
}
