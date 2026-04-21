"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/lib/actions/action-state";
import { logAudit } from "@/lib/audit/log";
import { generateContractForPayment } from "@/lib/contracts";
import { isSupabaseConfigured } from "@/lib/env";
import { dbErrorToActionState } from "@/lib/errors/db-error-mapper";
import {
  dispatchNotifications,
  type NotificationChannel,
  type NotificationType,
} from "@/lib/notifications/dispatch";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  groupAssignmentSchema,
  groupSchema,
  pilgrimCreateSchema,
  reminderSchema,
} from "@/lib/validation";

const ruDateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function fromZodError(error: z.ZodError): ActionState {
  return {
    status: "error",
    message: "Проверьте заполнение формы",
    fieldErrors: error.flatten().fieldErrors,
  };
}

function revalidatePaymentViews(pilgrimId?: string) {
  revalidatePath("/crm/dashboard");
  revalidatePath("/crm/payments");
  revalidatePath("/cabinet/dashboard");
  revalidatePath("/cabinet/payment");

  if (pilgrimId) {
    revalidatePath(`/crm/pilgrims/${pilgrimId}`);
  }
}

function revalidateCrmCore(pilgrimIds: string[] = []) {
  revalidatePath("/crm/dashboard");
  revalidatePath("/crm/pilgrims");
  revalidatePath("/crm/groups");
  revalidatePath("/crm/notifications");

  pilgrimIds.forEach((pilgrimId) => {
    revalidatePath(`/crm/pilgrims/${pilgrimId}`);
  });
}

function revalidateGroupSeatViews() {
  revalidatePath("/crm/groups");
  revalidatePath("/crm/dashboard");
  revalidatePath("/cabinet/group");
  revalidatePath("/cabinet/dashboard");
}

async function resolveCurrentOperator(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Сессия не найдена. Войдите заново.", operator: null, user: null };
  }

  const [{ data: operator }, { data: teamMember, error: teamError }] = await Promise.all([
    supabase.from("operators").select("id").eq("user_id", user.id).limit(1).maybeSingle(),
    supabase
      .from("operator_team_members")
      .select("operator_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
  ]);

  if (!operator && !teamMember) {
    return { error: "Оператор не найден для текущего пользователя.", operator: null, user };
  }

  return {
    error: teamError?.message ?? null,
    operator: operator ?? ({ id: (teamMember as { operator_id: string }).operator_id } as { id: string }),
    user,
  };
}

export async function createGroupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = groupSchema.safeParse({
    name: formData.get("name"),
    flightDate: formData.get("flightDate"),
    returnDate: formData.get("returnDate"),
    hotelMecca: formData.get("hotelMecca"),
    hotelMedina: formData.get("hotelMedina"),
    quotaTotal: formData.get("quotaTotal"),
    guideName: formData.get("guideName"),
    guidePhone: formData.get("guidePhone"),
    departureCity: formData.get("departureCity"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: `Демо-режим: группа «${parsed.data.name}» прошла валидацию.`,
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { operator, error: operatorMessage } = await resolveCurrentOperator(supabase);

  if (!operator) {
    return {
      status: "error",
      message: operatorMessage ?? "Оператор не найден.",
      fieldErrors: {},
    };
  }

  const { error } = await supabase.from("groups").insert({
    operator_id: operator.id,
    name: parsed.data.name,
    flight_date: parsed.data.flightDate,
    return_date: parsed.data.returnDate,
    hotel_mecca: parsed.data.hotelMecca,
    hotel_medina: parsed.data.hotelMedina,
    quota_total: parsed.data.quotaTotal,
    quota_filled: 0,
    guide_name: parsed.data.guideName,
    guide_phone: parsed.data.guidePhone,
    departure_city: parsed.data.departureCity,
    seat_map_released: false,
    status: "forming",
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: {},
    };
  }

  revalidatePath("/crm/groups");
  revalidatePath("/crm/dashboard");

  return {
    status: "success",
    message: `Группа «${parsed.data.name}» создана.`,
    fieldErrors: {},
  };
}

export async function toggleGroupSeatMapAction(
  groupId: string,
  nextState: boolean,
  _: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  z.string().min(1).parse(groupId);

  if (!isSupabaseConfigured()) {
    revalidateGroupSeatViews();
    return {
      status: "success",
      message: nextState
        ? "Демо-режим: места в самолёте открыты для паломников."
        : "Демо-режим: показ мест в самолёте выключен.",
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { operator, error: operatorMessage } = await resolveCurrentOperator(supabase);

  if (!operator) {
    return {
      status: "error",
      message: operatorMessage ?? "Оператор не найден.",
      fieldErrors: {},
    };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name")
    .eq("id", groupId)
    .eq("operator_id", operator.id)
    .limit(1)
    .maybeSingle();

  if (groupError || !group) {
    return {
      status: "error",
      message: groupError?.message ?? "Группа не найдена.",
      fieldErrors: {},
    };
  }

  const { error: updateError } = await supabase
    .from("groups")
    .update({ seat_map_released: nextState })
    .eq("id", group.id)
    .eq("operator_id", operator.id);

  if (updateError) {
    return {
      status: "error",
      message: updateError.message,
      fieldErrors: {},
    };
  }

  revalidateGroupSeatViews();

  return {
    status: "success",
    message: nextState
      ? `Группа «${group.name}»: места в самолёте разрешены к показу.`
      : `Группа «${group.name}»: показ мест в самолёте выключен.`,
    fieldErrors: {},
  };
}

export async function createPilgrimAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = pilgrimCreateSchema.safeParse({
    fullName: formData.get("fullName"),
    iin: formData.get("iin"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: `Демо-режим: паломник «${parsed.data.fullName}» прошёл валидацию.`,
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { operator, error: operatorMessage } = await resolveCurrentOperator(supabase);

  if (!operator) {
    return {
      status: "error",
      message: operatorMessage ?? "Оператор не найден.",
      fieldErrors: {},
    };
  }

  const adminClient = createAdminClient();
  const { data: createdUser, error: createUserError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    app_metadata: { role: "pilgrim" },
  });

  if (createUserError || !createdUser.user) {
    return {
      status: "error",
      message: createUserError?.message ?? "Не удалось создать пользователя паломника.",
      fieldErrors: {},
    };
  }

  const checklistTemplates = [
    { item_name: "Паспорт проверен", category: "documents" },
    { item_name: "Медицинская аптечка", category: "health" },
    { item_name: "Ихрам и базовая одежда", category: "clothing" },
    { item_name: "Наличные и карта", category: "finance" },
    { item_name: "Дуа и памятка по обрядам", category: "spiritual" },
  ] as const;

  const { data: profile, error: profileError } = await supabase
    .from("pilgrim_profiles")
    .insert({
      user_id: createdUser.user.id,
      operator_id: operator.id,
      full_name: parsed.data.fullName,
      iin: parsed.data.iin,
      phone: parsed.data.phone,
      date_of_birth: parsed.data.dateOfBirth,
      gender: parsed.data.gender,
      status: "new",
    })
    .select("id")
    .limit(1)
    .maybeSingle();

  if (profileError || !profile) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id).catch(() => undefined);

    return {
      status: "error",
      message: profileError?.message ?? "Не удалось создать профиль паломника.",
      fieldErrors: {},
    };
  }

  await Promise.all([
    supabase.from("payments").insert({
      pilgrim_id: profile.id,
      operator_id: operator.id,
      total_amount: 0,
      paid_amount: 0,
      payment_method: "transfer",
      installment_plan: false,
      status: "pending",
    }),
    supabase.from("checklist_items").insert(
      checklistTemplates.map((item) => ({
        pilgrim_id: profile.id,
        item_name: item.item_name,
        category: item.category,
      })),
    ),
    supabase.from("notifications").insert({
      pilgrim_id: profile.id,
      operator_id: operator.id,
      channel: "in_app",
      type: "welcome",
      message: "Добро пожаловать в кабинет паломника. Загрузите документы и проверьте статус оплаты.",
      status: "queued",
      scheduled_at: new Date().toISOString(),
    }),
  ]);

  revalidateCrmCore([profile.id]);

  return {
    status: "success",
    message: `Паломник «${parsed.data.fullName}» создан. Логин: ${parsed.data.email}`,
    fieldErrors: {},
  };
}

export async function assignPilgrimsToGroupAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = groupAssignmentSchema.safeParse({
    groupId: formData.get("groupId"),
    pilgrimIds: formData.getAll("pilgrimIds").map(String),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: `Демо-режим: ${parsed.data.pilgrimIds.length} паломников назначены в группу.`,
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { operator, error: operatorMessage } = await resolveCurrentOperator(supabase);

  if (!operator) {
    return {
      status: "error",
      message: operatorMessage ?? "Оператор не найден.",
      fieldErrors: {},
    };
  }

  const [{ data: group }, { data: pilgrims }] = await Promise.all([
    supabase
      .from("groups")
      .select("id, quota_total, quota_filled, name")
      .eq("id", parsed.data.groupId)
      .eq("operator_id", operator.id)
      .limit(1)
      .maybeSingle(),
    supabase
      .from("pilgrim_profiles")
      .select("id")
      .in("id", parsed.data.pilgrimIds)
      .eq("operator_id", operator.id)
      .limit(Math.max(parsed.data.pilgrimIds.length, 1)),
  ]);

  if (!group) {
    return {
      status: "error",
      message: "Группа не найдена или не принадлежит текущему оператору.",
      fieldErrors: {},
    };
  }

  const resolvedPilgrimIds = (pilgrims ?? []).map((item) => item.id);

  if (!resolvedPilgrimIds.length) {
    return {
      status: "error",
      message: "Не найдено ни одного паломника для назначения.",
      fieldErrors: {},
    };
  }

  const { data: existingLinks } = await supabase
    .from("pilgrim_groups")
    .select("pilgrim_id")
    .eq("group_id", group.id)
    .in("pilgrim_id", resolvedPilgrimIds)
    .limit(Math.max(resolvedPilgrimIds.length, 1));
  const alreadyInTarget = new Set((existingLinks ?? []).map((item) => item.pilgrim_id));
  const newAssignments = resolvedPilgrimIds.filter((pilgrimId) => !alreadyInTarget.has(pilgrimId));
  const availableQuota = Math.max(group.quota_total - group.quota_filled, 0);

  if (newAssignments.length > availableQuota) {
    return {
      status: "error",
      message: `В группе недостаточно мест. Свободно ${availableQuota}.`,
      fieldErrors: {},
    };
  }

  await supabase.from("pilgrim_groups").delete().in("pilgrim_id", resolvedPilgrimIds);

  const { error: insertError } = await supabase.from("pilgrim_groups").insert(
    resolvedPilgrimIds.map((pilgrimId) => ({
      pilgrim_id: pilgrimId,
      group_id: group.id,
      joined_at: new Date().toISOString(),
    })),
  );

  if (insertError) {
    return {
      status: "error",
      message: insertError.message,
      fieldErrors: {},
    };
  }

  revalidateCrmCore(resolvedPilgrimIds);

  return {
    status: "success",
    message: `${resolvedPilgrimIds.length} паломников назначены в группу «${group.name}».`,
    fieldErrors: {},
  };
}

export async function sendBulkReminderAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const rawPilgrimIds = formData.getAll("pilgrimIds").map(String);
  const parsed = reminderSchema.safeParse({
    pilgrimIds: rawPilgrimIds,
    channel: formData.get("channel"),
    type: formData.get("type"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return fromZodError(parsed.error);
  }

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: `Демо-режим: ${parsed.data.pilgrimIds.length} уведомлений поставлено в очередь.`,
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Сессия не найдена.", fieldErrors: {} };
  }

  const { data: operator } = await supabase
    .from("operators")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!operator) {
    return {
      status: "error",
      message: "Оператор не найден для текущего пользователя.",
      fieldErrors: {},
    };
  }

  const { data: pilgrimRows, error: pilgrimError } = await supabase
    .from("pilgrim_profiles")
    .select("id, phone")
    .in("id", parsed.data.pilgrimIds)
    .eq("operator_id", operator.id)
    .is("deleted_at", null);

  if (pilgrimError) {
    return dbErrorToActionState(pilgrimError);
  }

  if (!pilgrimRows || pilgrimRows.length === 0) {
    return {
      status: "error",
      message: "Не найдено ни одного паломника по переданным id.",
      fieldErrors: {},
    };
  }

  if (pilgrimRows.length > 200) {
    return {
      status: "error",
      message: "За одну операцию можно отправить не более 200 уведомлений.",
      fieldErrors: {},
    };
  }

  const result = await dispatchNotifications({
    supabase,
    operatorId: operator.id,
    pilgrims: pilgrimRows.map((pilgrim) => ({
      id: pilgrim.id,
      phone: pilgrim.phone,
    })),
    channel: parsed.data.channel as NotificationChannel,
    type: parsed.data.type as NotificationType,
    message: parsed.data.message,
    idempotencyWindow: "hour",
  });

  await logAudit(supabase, {
    actorUserId: user.id,
    actorType: "user",
    action: "notifications.bulk_send",
    entityType: "operator",
    entityId: operator.id,
    diff: {
      channel: parsed.data.channel,
      type: parsed.data.type,
      total: result.totalCount,
      sent: result.sentCount,
      failed: result.failedCount,
      skipped: result.skippedCount,
    },
  });

  revalidatePath("/crm/notifications");
  revalidatePath("/crm/dashboard");

  if (result.error) {
    return { status: "error", message: result.error.message, fieldErrors: {} };
  }

  const parts: string[] = [];
  if (result.sentCount) parts.push(`отправлено ${result.sentCount}`);
  if (result.failedCount) parts.push(`ошибок ${result.failedCount}`);
  if (result.skippedCount) parts.push(`пропущено (дубли) ${result.skippedCount}`);
  if (result.queuedCount) parts.push(`в очереди ${result.queuedCount}`);

  const summary = parts.length ? parts.join(", ") : "нет изменений";

  return {
    status: result.failedCount > 0 ? "error" : "success",
    message: result.whapiEnabled
      ? `WhatsApp: ${summary}.`
      : `${result.totalCount} уведомлений записано. Задайте WHATSAPP_API_KEY для реальной отправки.`,
    fieldErrors: {},
  };
}

export async function sendFlightBroadcastAction(
  groupId: string,
  _: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  z.string().min(1).parse(groupId);

  if (!isSupabaseConfigured()) {
    return {
      status: "success",
      message: "Демо-режим: рассылка перед вылетом поставлена в очередь.",
      fieldErrors: {},
    };
  }

  const supabase = createClient();
  const { operator, error: operatorMessage } = await resolveCurrentOperator(supabase);

  if (!operator) {
    return {
      status: "error",
      message: operatorMessage ?? "Оператор не найден.",
      fieldErrors: {},
    };
  }

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, name, flight_date, departure_city, guide_name, guide_phone, quota_total")
    .eq("id", groupId)
    .eq("operator_id", operator.id)
    .limit(1)
    .maybeSingle();

  if (groupError || !group) {
    return {
      status: "error",
      message: groupError?.message ?? "Группа не найдена.",
      fieldErrors: {},
    };
  }

  const { data: groupLinks, error: groupLinksError } = await supabase
    .from("pilgrim_groups")
    .select("pilgrim_id")
    .eq("group_id", group.id)
    .limit(Math.max(group.quota_total ?? 1, 1));

  if (groupLinksError) {
    return {
      status: "error",
      message: groupLinksError.message,
      fieldErrors: {},
    };
  }

  const pilgrimIds = Array.from(new Set((groupLinks ?? []).map((link) => link.pilgrim_id)));

  if (!pilgrimIds.length) {
    return {
      status: "error",
      message: "В группе нет паломников для рассылки.",
      fieldErrors: {},
    };
  }

  const { data: pilgrimRows, error: pilgrimError } = await supabase
    .from("pilgrim_profiles")
    .select("id, phone")
    .in("id", pilgrimIds)
    .eq("operator_id", operator.id)
    .limit(Math.max(pilgrimIds.length, 1));

  if (pilgrimError) {
    return {
      status: "error",
      message: pilgrimError.message,
      fieldErrors: {},
    };
  }

  const flightDate = ruDateFormatter.format(new Date(group.flight_date));
  const guideLine = [group.guide_name, group.guide_phone].filter(Boolean).join(", ");
  const message = [
    `Напоминание перед вылетом по группе «${group.name}».`,
    `Вылет: ${flightDate}, ${group.departure_city}.`,
    guideLine ? `Гид: ${guideLine}.` : null,
    "Проверьте документы, оплату и чек-лист в кабинете паломника.",
  ]
    .filter(Boolean)
    .join(" ");

  const dispatch = await dispatchNotifications({
    supabase,
    operatorId: operator.id,
    pilgrims: (pilgrimRows ?? []).map((pilgrim) => ({
      id: pilgrim.id,
      phone: pilgrim.phone,
    })),
    channel: "whatsapp",
    type: "reminder_flight",
    message,
    idempotencyWindow: "day",
  });

  if (dispatch.error) {
    return {
      status: "error",
      message: dispatch.error.message,
      fieldErrors: {},
    };
  }

  revalidatePath("/crm/groups");
  revalidatePath("/crm/notifications");
  revalidatePath("/crm/dashboard");

  const parts: string[] = [];
  if (dispatch.sentCount) parts.push(`отправлено ${dispatch.sentCount}`);
  if (dispatch.failedCount) parts.push(`ошибок ${dispatch.failedCount}`);
  if (dispatch.skippedCount) parts.push(`пропущено ${dispatch.skippedCount}`);
  if (dispatch.queuedCount) parts.push(`в очереди ${dispatch.queuedCount}`);
  const summary = parts.join(", ") || "нет изменений";

  return {
    status: dispatch.failedCount > 0 ? "error" : "success",
    message: dispatch.whapiEnabled
      ? `Группа «${group.name}»: ${summary}.`
      : `Группа «${group.name}»: уведомления записаны. Задайте WHATSAPP_API_KEY для реальной отправки.`,
    fieldErrors: {},
  };
}

export async function verifyOperatorAction(operatorId: string, nextState: boolean): Promise<void> {
  z.string().min(1).parse(operatorId);

  if (!isSupabaseConfigured()) {
    revalidatePath("/admin/operators");
    revalidatePath("/operators");
    revalidatePath("/");
    return;
  }

  const supabase = createClient();
  await supabase.from("operators").update({ is_verified: nextState }).eq("id", operatorId);

  revalidatePath("/admin/operators");
  revalidatePath("/admin/analytics");
  revalidatePath("/operators");
  revalidatePath("/");
}

export async function markPaymentPaidAction(paymentId: string): Promise<void> {
  z.string().uuid().parse(paymentId);

  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return;
  }

  const { data: paymentRow } = await supabase
    .from("payments")
    .select("id, pilgrim_id, operator_id, total_amount, paid_amount, status, operators!inner(user_id)")
    .eq("id", paymentId)
    .maybeSingle();

  if (!paymentRow) {
    return;
  }

  // @ts-expect-error — supabase типы для inner-join'ов неудобные
  const operatorUserId = paymentRow.operators?.user_id as string | undefined;
  const isAdmin = (user.app_metadata?.role ?? "") === "admin";

  if (!isAdmin && operatorUserId !== user.id) {
    throw new Error("Нет прав на изменение этого платежа.");
  }

  const previousStatus = paymentRow.status;
  const previousPaidAmount = Number(paymentRow.paid_amount);
  const totalAmount = Number(paymentRow.total_amount);
  const delta = totalAmount - previousPaidAmount;

  if (delta > 0) {
    const adminClient = createAdminClient();
    const { error: txError } = await adminClient.from("payment_transactions").insert({
      payment_id: paymentId,
      amount: delta,
      method: "transfer",
      status: "completed",
      note: "Ручная отметка 'оплачено полностью'",
      created_by_user_id: user.id,
    });

    if (txError) {
      throw new Error(txError.message);
    }
  } else {
    await supabase
      .from("payments")
      .update({ paid_amount: totalAmount, status: "paid" })
      .eq("id", paymentId);
  }

  await logAudit(supabase, {
    actorUserId: user.id,
    actorType: "user",
    action: "payment.marked_paid_manual",
    entityType: "payment",
    entityId: paymentId,
    diff: {
      from: { status: previousStatus, paid_amount: previousPaidAmount },
      to: { status: "paid", paid_amount: totalAmount },
    },
  });

  try {
    await generateContractForPayment(supabase, paymentId);
  } catch (error) {
    console.error("[payment] contract generation failed after manual mark", error);
  }

  revalidatePaymentViews(paymentRow.pilgrim_id);
}

export async function generateContractAction(paymentId: string): Promise<void> {
  z.string().min(1).parse(paymentId);

  if (!isSupabaseConfigured()) {
    revalidatePaymentViews();
    return;
  }

  const supabase = createClient();
  const { data: paymentRow } = await supabase
    .from("payments")
    .select("id, pilgrim_id")
    .eq("id", paymentId)
    .limit(1)
    .maybeSingle();

  if (!paymentRow) {
    return;
  }

  await generateContractForPayment(supabase, paymentId);
  revalidatePaymentViews(paymentRow.pilgrim_id);
}
