import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export interface AuthState {
  isConfigured: boolean;
  isAuthenticated: boolean;
  mode: "demo" | "live";
  role: UserRole | null;
  user: User | null;
}

function normalizeRole(role: unknown): UserRole | null {
  return role === "admin" || role === "operator" || role === "pilgrim" ? role : null;
}

export function routeForRole(role: unknown) {
  const normalized = normalizeRole(role);

  if (normalized === "admin") {
    return "/admin/operators";
  }

  if (normalized === "operator") {
    return "/crm/dashboard";
  }

  if (normalized === "pilgrim") {
    return "/cabinet/dashboard";
  }

  return "/";
}

export async function getAuthState(): Promise<AuthState> {
  if (!isSupabaseConfigured()) {
    return {
      isConfigured: false,
      isAuthenticated: false,
      mode: "demo",
      role: null,
      user: null,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let role = normalizeRole(user?.app_metadata?.role ?? user?.user_metadata?.role);

  if (user && !role) {
    const [{ data: operator }, { data: pilgrim }] = await Promise.all([
      supabase.from("operators").select("id").eq("user_id", user.id).maybeSingle(),
      supabase.from("pilgrim_profiles").select("id").eq("user_id", user.id).maybeSingle(),
    ]);

    role = operator ? "operator" : pilgrim ? "pilgrim" : null;
  }

  return {
    isConfigured: true,
    isAuthenticated: Boolean(user),
    mode: "live",
    role,
    user,
  };
}

export async function requireAnyRole(allowedRoles: UserRole[]) {
  const auth = await getAuthState();

  if (!auth.isConfigured) {
    return auth;
  }

  if (!auth.user || !auth.role) {
    redirect("/login");
  }

  if (auth.role !== "admin" && !allowedRoles.includes(auth.role)) {
    redirect(routeForRole(auth.role));
  }

  return auth;
}
