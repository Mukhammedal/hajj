"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionState } from "@/lib/actions/action-state";
import { generateContractForPayment } from "@/lib/contracts";
import { isSupabaseConfigured } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  groupAssignmentSchema,
  groupSchema,
  pilgrimCreateSchema,
  reminderSchema,
} from "@/lib/validation";
import { isWhapiConfigured, normalizeWhatsAppRecipient, sendWhapiTextMessage } from "@/lib/whatsapp";

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

async function resolveCurrentOperator(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Сессия не найдена. Войдите заново.", operator: null, user: null };
  }

  const { data: operator, error: operatorError } = await supabase
    .from("operators")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (operatorError || !operator) {
    return { error: "Оператор не найден для текущего пользователя.", operator: null, user };
  }

  return { error: null, operator, user };
}

async function dispatchNotifications({
  channel,
  message,
  operatorId,
  pilgrims,
  supabase,
  type,
}: {
  channel: "whatsapp" | "sms";
  message: string;
  operatorId: string;
  pilgrims: Array<{ id: string; phone: string | null }>;
  supabase: ReturnType<typeof createClient>;
  type: "reminder_docs" | "reminder_payment" | "reminder_flight" | "welcome" | "checklist";
}) {
  const whapiEnabled = channel === "whatsapp" && isWhapiConfigured();
  let sentCount = 0;
  let failedCount = 0;
  let queuedCount = 0;

  const payload = await Promise.all(
    pilgrims.map(async (pilgrim) => {
      const scheduledAt = new Date().toISOString();
      let status: "queued" | "sent" | "failed" = "queued";
      let sentAt: string | null = null;

      if (channel === "whatsapp" && whapiEnabled) {
        const recipient = normalizeWhatsAppRecipient(pilgrim.phone ?? "");

        if (!recipient) {
          status = "failed";
          failedCount += 1;
        } else {
          try {
            await sendWhapiTextMessage({
              to: recipient,
              body: message,
            });
            status = "sent";
            sentAt = new Date().toISOString();
            sentCount += 1;
          } catch {
            status = "failed";
            failedCount += 1;
          }
        }
      } else {
        queuedCount += 1;
      }

      return {
        pilgrim_id: pilgrim.id,
        operator_id: operatorId,
        channel,
        type,
        message,
        status,
        scheduled_at: scheduledAt,
        sent_at: sentAt,
      };
    }),
  );

  const { error } = await supabase.from("notifications").insert(payload);

  return {
    error,
    failedCount,
    queuedCount,
    sentCount,
    totalCount: pilgrims.length,
    whapiEnabled,
  };
}

function formatDispatchMessage({
  channel,
  failedCount,
  queuedCount,
  sentCount,
  totalCount,
  whapiEnabled,
}: {
  channel: "whatsapp" | "sms";
  failedCount: number;
  queuedCount: number;
  sentCount: number;
  totalCount: number;
  whapiEnabled: boolean;
}) {
  if (channel === "whatsapp" && whapiEnabled) {
    return {
      status: failedCount ? ("error" as const) : ("success" as const),
      message: `WhatsApp: отправлено ${sentCount}, ошибок ${failedCount}, в очереди ${queuedCount}.`,
    };
  }

  return {
    status: "success" as const,
    message:
      channel === "whatsapp"
        ? `${totalCount} уведомлений записано. Для реальной отправки задайте WHATSAPP_API_KEY.`
        : `${totalCount} уведомлений поставлено в очередь.`,
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
    supabase.from("groups").select("id, quota_total, quota_filled, name").eq("id", parsed.data.groupId).eq("operator_id", operator.id).maybeSingle(),
    supabase.from("pilgrim_profiles").select("id").in("id", parsed.data.pilgrimIds).eq("operator_id", operator.id),
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

  const { data: existingLinks } = await supabase.from("pilgrim_groups").select("pilgrim_id").eq("group_id", group.id);
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
  const { operator, error: operatorMessage } = await resolveCurrentOperator(supabase);

  if (!operator) {
    return {
      status: "error",
      message: operatorMessage ?? "Оператор не найден.",
      fieldErrors: {},
    };
  }

  const { data: pilgrimRows, error: pilgrimError } = await supabase
    .from("pilgrim_profiles")
    .select("id, full_name, phone")
    .in("id", parsed.data.pilgrimIds)
    .eq("operator_id", operator.id);

  if (pilgrimError) {
    return {
      status: "error",
      message: pilgrimError.message,
      fieldErrors: {},
    };
  }

  const dispatch = await dispatchNotifications({
    supabase,
    operatorId: operator.id,
    pilgrims: (pilgrimRows ?? []).map((pilgrim) => ({
      id: pilgrim.id,
      phone: pilgrim.phone,
    })),
    channel: parsed.data.channel,
    type: parsed.data.type,
    message: parsed.data.message,
  });

  if (dispatch.error) {
    return {
      status: "error",
      message: dispatch.error.message,
      fieldErrors: {},
    };
  }

  revalidatePath("/crm/notifications");
  revalidatePath("/crm/dashboard");

  const result = formatDispatchMessage({
    channel: parsed.data.channel,
    failedCount: dispatch.failedCount,
    queuedCount: dispatch.queuedCount,
    sentCount: dispatch.sentCount,
    totalCount: dispatch.totalCount,
    whapiEnabled: dispatch.whapiEnabled,
  });

  return {
    status: result.status,
    message: result.message,
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
    .select("id, name, flight_date, departure_city, guide_name, guide_phone")
    .eq("id", groupId)
    .eq("operator_id", operator.id)
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
    .eq("group_id", group.id);

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
    .eq("operator_id", operator.id);

  if (pilgrimError) {
    return {
      status: "error",
      message: pilgrimError.message,
      fieldErrors: {},
    };
  }

  const flightDate = formatDate(group.flight_date);
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

  const result = formatDispatchMessage({
    channel: "whatsapp",
    failedCount: dispatch.failedCount,
    queuedCount: dispatch.queuedCount,
    sentCount: dispatch.sentCount,
    totalCount: dispatch.totalCount,
    whapiEnabled: dispatch.whapiEnabled,
  });

  return {
    status: result.status,
    message: `Группа «${group.name}»: ${result.message}`,
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
  z.string().min(1).parse(paymentId);

  if (!isSupabaseConfigured()) {
    revalidatePaymentViews();
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
    .select("id, pilgrim_id, total_amount")
    .eq("id", paymentId)
    .maybeSingle();

  if (!paymentRow) {
    return;
  }

  await supabase
    .from("payments")
    .update({
      paid_amount: paymentRow.total_amount,
      status: "paid",
    })
    .eq("id", paymentId);

  await generateContractForPayment(supabase, paymentId);
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
    .maybeSingle();

  if (!paymentRow) {
    return;
  }

  await generateContractForPayment(supabase, paymentId);
  revalidatePaymentViews(paymentRow.pilgrim_id);
}
