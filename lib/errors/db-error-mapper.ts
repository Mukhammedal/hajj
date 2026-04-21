import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Маппинг Postgres / Supabase ошибок в понятные юзеру сообщения.
 *
 * Без этого в UI летят сырые "duplicate key value violates unique constraint".
 *
 * Использование:
 *   const { error } = await supabase.from("pilgrim_profiles").insert(...);
 *   if (error) return { status: "error", message: mapDbError(error), fieldErrors: {} };
 */

type NullableError = PostgrestError | Error | null | undefined;

interface ConstraintMapping {
  match: RegExp;
  message: string;
  field?: string;
}

const CONSTRAINT_MAPPINGS: ConstraintMapping[] = [
  // Unique constraints
  {
    match: /pilgrim_profiles.*iin/i,
    message: "Паломник с таким ИИН уже существует.",
    field: "iin",
  },
  {
    match: /operators.*license_number/i,
    message: "Оператор с таким номером лицензии уже зарегистрирован.",
    field: "licenseNumber",
  },
  {
    match: /persons.*iin/i,
    message: "Физическое лицо с таким ИИН уже существует в системе.",
    field: "iin",
  },
  {
    match: /notifications.*idempotency_key/i,
    message: "Это уведомление уже было отправлено недавно.",
  },
  {
    match: /payments.*qr_code/i,
    message: "Конфликт QR-кода договора. Попробуйте ещё раз.",
  },
  {
    match: /documents.*pilgrim_id.*type/i,
    message: "Документ этого типа уже загружен.",
    field: "type",
  },
  // Foreign key
  {
    match: /violates foreign key constraint.*operator_id/i,
    message: "Оператор не найден.",
  },
  {
    match: /violates foreign key constraint.*pilgrim_id/i,
    message: "Паломник не найден.",
  },
  {
    match: /violates foreign key constraint.*group_id/i,
    message: "Группа не найдена.",
  },
  // Check constraints
  {
    match: /quota_total/i,
    message: "Квота группы должна быть положительным числом.",
    field: "quotaTotal",
  },
  {
    match: /total_amount.*check/i,
    message: "Сумма платежа должна быть не меньше нуля.",
  },
  // Not null
  {
    match: /null value.*column "operator_id"/i,
    message: "Не удалось определить оператора. Войдите заново.",
  },
  // RLS
  {
    match: /permission denied|row-level security/i,
    message: "Нет прав на эту операцию.",
  },
];

export interface MappedError {
  message: string;
  field?: string;
  original: string;
}

export function mapDbError(error: NullableError): MappedError {
  if (!error) {
    return { message: "Неизвестная ошибка.", original: "" };
  }

  const raw = "message" in error ? error.message : String(error);
  const details = "details" in error && error.details ? String(error.details) : "";
  const hint = "hint" in error && error.hint ? String(error.hint) : "";
  const searchText = `${raw} ${details} ${hint}`;

  for (const mapping of CONSTRAINT_MAPPINGS) {
    if (mapping.match.test(searchText)) {
      return {
        message: mapping.message,
        field: mapping.field,
        original: raw,
      };
    }
  }

  // Общий fallback. Для пользователя — дженерик; для разработчика — original в логах.
  return {
    message: "Не удалось выполнить операцию. Попробуйте ещё раз или свяжитесь с поддержкой.",
    original: raw,
  };
}

/**
 * Утилита-сокращение для использования в server actions:
 *   if (error) return dbErrorToActionState(error);
 */
export function dbErrorToActionState(error: NullableError) {
  const mapped = mapDbError(error);
  console.error("[db-error]", mapped.original);
  return {
    status: "error" as const,
    message: mapped.message,
    fieldErrors: mapped.field ? { [mapped.field]: [mapped.message] } : {},
  };
}
