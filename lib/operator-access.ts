import "server-only";

import { getAuthState } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface OperatorAccess {
  error: string | null;
  operatorId: string | null;
  role: "admin" | "operator" | "pilgrim" | null;
  status: number;
}

export async function resolveOperatorAccess(requestedOperatorId?: string): Promise<OperatorAccess> {
  const auth = await getAuthState();

  if (!auth.isConfigured || !auth.user || !auth.role) {
    return {
      error: "Требуется авторизация.",
      operatorId: null,
      role: null,
      status: 401,
    };
  }

  const supabase = createClient();

  if (auth.role === "admin") {
    if (!requestedOperatorId) {
      return {
        error: "Для администратора требуется operator_id.",
        operatorId: null,
        role: auth.role,
        status: 400,
      };
    }

    const { data: operator } = await supabase.from("operators").select("id").eq("id", requestedOperatorId).maybeSingle();

    if (!operator?.id) {
      return {
        error: "Оператор не найден.",
        operatorId: null,
        role: auth.role,
        status: 404,
      };
    }

    return {
      error: null,
      operatorId: operator.id,
      role: auth.role,
      status: 200,
    };
  }

  if (auth.role !== "operator") {
    return {
      error: "Доступ разрешён только оператору или администратору.",
      operatorId: null,
      role: auth.role,
      status: 403,
    };
  }

  const { data: operator } = await supabase.from("operators").select("id").eq("user_id", auth.user.id).maybeSingle();

  if (!operator?.id) {
    return {
      error: "Профиль оператора не найден.",
      operatorId: null,
      role: auth.role,
      status: 404,
    };
  }

  if (requestedOperatorId && requestedOperatorId !== operator.id) {
    return {
      error: "Нельзя запускать синк для другого оператора.",
      operatorId: null,
      role: auth.role,
      status: 403,
    };
  }

  return {
    error: null,
    operatorId: operator.id,
    role: auth.role,
    status: 200,
  };
}
