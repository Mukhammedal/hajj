"use server";

import { redirect } from "next/navigation";

import { initialActionState, type ActionState } from "@/lib/actions/action-state";
import { routeForRole } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validation";

export async function signInAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Проверьте логин и пароль",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "error",
      message: "Supabase не настроен. В демо-режиме вход не требуется.",
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return {
      status: "error",
      message: error?.message ?? "Не удалось выполнить вход",
      fieldErrors: {},
    };
  }

  let role = data.user.app_metadata?.role ?? data.user.user_metadata?.role;

  if (!role) {
    const [{ data: operator }, { data: pilgrim }] = await Promise.all([
      supabase.from("operators").select("id").eq("user_id", data.user.id).maybeSingle(),
      supabase.from("pilgrim_profiles").select("id").eq("user_id", data.user.id).maybeSingle(),
    ]);

    role = operator ? "operator" : pilgrim ? "pilgrim" : null;
  }

  redirect(routeForRole(role));
}

export async function signOutAction(): Promise<void> {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export { initialActionState };
