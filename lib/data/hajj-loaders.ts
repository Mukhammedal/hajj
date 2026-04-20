import { cache } from "react";

import { getAuthState } from "@/lib/auth";
import { resolveSignedContractUrl } from "@/lib/contracts";
import { computeReadinessFromDocuments, isStorageObjectPath } from "@/lib/documents";
import { isSupabaseConfigured } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import {
  checklistItems as mockChecklistItems,
  documents as mockDocuments,
  getOperatorById as getMockOperatorById,
  getOperatorGroups as getMockOperatorGroups,
  getOperatorPilgrims as getMockOperatorPilgrims,
  getOperatorReadyCount as getMockOperatorReadyCount,
  getOperatorRevenue as getMockOperatorRevenue,
  getOperatorReviews as getMockOperatorReviews,
  getPilgrimById as getMockPilgrimById,
  getPilgrimChecklist as getMockPilgrimChecklist,
  getPilgrimDocuments as getMockPilgrimDocuments,
  getPilgrimGroup as getMockPilgrimGroup,
  getPilgrimNotifications as getMockPilgrimNotifications,
  getPilgrimPayment as getMockPilgrimPayment,
  getPilgrimReadiness as getMockPilgrimReadiness,
  getPilgrimTimeline as getMockPilgrimTimeline,
  getPrimaryCity as getMockPrimaryCity,
  getPublicVerification as getMockPublicVerification,
  getQuotaLeft as getMockQuotaLeft,
  getReadinessView as getMockReadinessView,
  getVerifiedOperators as getMockVerifiedOperators,
  notifications as mockNotifications,
  operators as mockOperators,
  payments as mockPayments,
  pilgrims as mockPilgrims,
  reviews as mockReviews,
} from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/server";
import type {
  ChecklistItem,
  DepartureCity,
  DocumentRecord,
  GroupRecord,
  NotificationRecord,
  Operator,
  OperatorReview,
  PaymentRecord,
  PilgrimProfile,
  PilgrimReadiness,
  TimelineEvent,
} from "@/types/domain";

type OperatorRow = {
  address: string | null;
  company_name: string;
  created_at: string;
  id: string;
  is_verified: boolean;
  license_expiry: string;
  license_number: string;
  phone: string | null;
  rating: number | string;
  total_reviews: number;
  user_id: string;
};

type PilgrimRow = {
  created_at: string;
  date_of_birth: string | null;
  full_name: string;
  gender: string | null;
  id: string;
  iin: string;
  operator_id: string;
  phone: string | null;
  status: PilgrimProfile["status"];
  user_id: string;
};

type DocumentRow = {
  file_name: string;
  file_url: string;
  id: string;
  is_verified: boolean;
  pilgrim_id: string;
  type: DocumentRecord["type"];
  uploaded_at: string;
};

type GroupRow = {
  created_at: string;
  departure_city: DepartureCity;
  flight_date: string;
  guide_name: string | null;
  guide_phone: string | null;
  hotel_mecca: string | null;
  hotel_medina: string | null;
  id: string;
  name: string;
  operator_id: string;
  quota_filled: number;
  quota_total: number;
  return_date: string;
  status: GroupRecord["status"];
};

type PaymentRow = {
  contract_generated_at: string | null;
  contract_url: string | null;
  created_at: string;
  id: string;
  installment_months: number | null;
  installment_plan: boolean;
  operator_id: string;
  paid_amount: number | string;
  payment_method: PaymentRecord["paymentMethod"];
  pilgrim_id: string;
  qr_code: string | null;
  status: PaymentRecord["status"];
  total_amount: number | string;
};

type ReviewRow = {
  comment: string | null;
  created_at: string;
  id: string;
  is_visible: boolean;
  operator_id: string;
  pilgrim_id: string;
  rating: number;
};

type NotificationRow = {
  channel: NotificationRecord["channel"];
  id: string;
  message: string;
  operator_id: string;
  pilgrim_id: string;
  scheduled_at: string;
  sent_at: string | null;
  status: NotificationRecord["status"];
  type: NotificationRecord["type"];
};

type ChecklistRow = {
  category: ChecklistItem["category"];
  id: string;
  is_checked: boolean;
  item_name: string;
  pilgrim_id: string;
};

type ReadinessRow = {
  docs_count: number;
  is_in_group: boolean;
  is_payment_complete: boolean;
  is_ready: boolean;
  pilgrim_id: string;
  readiness_percent: number;
};

type PilgrimGroupLinkRow = {
  group_id: string;
  joined_at: string;
  pilgrim_id: string;
};

function fallbackGroupPrice(city: DepartureCity) {
  const prices: Record<DepartureCity, number> = {
    Almaty: 1550000,
    Astana: 1620000,
    Shymkent: 1480000,
    Turkestan: 1490000,
    Aktau: 1580000,
  };

  return prices[city];
}

function mapOperator(row: OperatorRow): Operator {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    licenseNumber: row.license_number,
    licenseExpiry: row.license_expiry,
    isVerified: row.is_verified,
    rating: Number(row.rating),
    totalReviews: row.total_reviews,
    phone: row.phone ?? "",
    address: row.address ?? "",
    description: `${row.company_name} ведёт хадж-группы с централизованным документооборотом, CRM-контролем статусов и поддержкой паломников.`,
    createdAt: row.created_at,
  };
}

function mapPilgrim(row: PilgrimRow): PilgrimProfile {
  return {
    id: row.id,
    userId: row.user_id,
    operatorId: row.operator_id,
    fullName: row.full_name,
    iin: row.iin,
    phone: row.phone ?? "",
    dateOfBirth: row.date_of_birth ?? "",
    gender: row.gender ?? "",
    status: row.status,
    createdAt: row.created_at,
  };
}

function mapDocument(row: DocumentRow): DocumentRecord {
  return {
    id: row.id,
    pilgrimId: row.pilgrim_id,
    type: row.type,
    fileUrl: row.file_url,
    fileName: row.file_name,
    isVerified: row.is_verified,
    uploadedAt: row.uploaded_at,
  };
}

function mapGroup(row: GroupRow): GroupRecord {
  return {
    id: row.id,
    operatorId: row.operator_id,
    name: row.name,
    flightDate: row.flight_date,
    returnDate: row.return_date,
    hotelMecca: row.hotel_mecca ?? "",
    hotelMedina: row.hotel_medina ?? "",
    quotaTotal: row.quota_total,
    quotaFilled: row.quota_filled,
    guideName: row.guide_name ?? "",
    guidePhone: row.guide_phone ?? "",
    departureCity: row.departure_city,
    status: row.status,
    createdAt: row.created_at,
    priceFrom: fallbackGroupPrice(row.departure_city),
  };
}

function mapPayment(row: PaymentRow): PaymentRecord {
  return {
    id: row.id,
    pilgrimId: row.pilgrim_id,
    operatorId: row.operator_id,
    totalAmount: Number(row.total_amount),
    paidAmount: Number(row.paid_amount),
    paymentMethod: row.payment_method,
    installmentPlan: row.installment_plan,
    installmentMonths: row.installment_months,
    status: row.status,
    contractUrl: row.contract_url,
    qrCode: row.qr_code,
    contractGeneratedAt: row.contract_generated_at,
    createdAt: row.created_at,
  };
}

function mapReview(row: ReviewRow): OperatorReview {
  return {
    id: row.id,
    operatorId: row.operator_id,
    pilgrimId: row.pilgrim_id,
    rating: row.rating,
    comment: row.comment ?? "",
    isVisible: row.is_visible,
    createdAt: row.created_at,
  };
}

function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    pilgrimId: row.pilgrim_id,
    operatorId: row.operator_id,
    channel: row.channel,
    type: row.type,
    message: row.message,
    status: row.status,
    scheduledAt: row.scheduled_at,
    sentAt: row.sent_at,
  };
}

function mapChecklist(row: ChecklistRow): ChecklistItem {
  return {
    id: row.id,
    pilgrimId: row.pilgrim_id,
    itemName: row.item_name,
    category: row.category,
    isChecked: row.is_checked,
  };
}

function mapReadiness(row: ReadinessRow): PilgrimReadiness {
  return {
    pilgrimId: row.pilgrim_id,
    docsCount: row.docs_count,
    isPaymentComplete: row.is_payment_complete,
    isInGroup: row.is_in_group,
    readinessPercent: row.readiness_percent,
    isReady: row.is_ready,
  };
}

function defaultTimelineFromNotifications(items: NotificationRecord[], pilgrimId: string): TimelineEvent[] {
  return items.slice(0, 5).map((item) => ({
    id: item.id,
    pilgrimId,
    title: item.type,
    detail: item.message,
    timestamp: item.sentAt ?? item.scheduledAt,
  }));
}

function safeCityFromGroups(groups: GroupRecord[]) {
  return groups[0]?.departureCity ?? "Almaty";
}

function findMockOperatorBySlugOrId(operatorId: string) {
  return mockOperators.find((operator) => operator.id === operatorId || slugify(operator.companyName) === operatorId);
}

function safeQuotaLeft(groups: GroupRecord[]) {
  return groups.reduce((sum, group) => sum + Math.max(group.quotaTotal - group.quotaFilled, 0), 0);
}

async function resolveDocumentUrls(
  supabase: ReturnType<typeof createClient>,
  documents: DocumentRecord[],
) {
  return Promise.all(
    documents.map(async (document) => {
      if (!isStorageObjectPath(document.fileUrl)) {
        return document;
      }

      const { data, error } = await supabase.storage.from("documents").createSignedUrl(document.fileUrl, 60 * 60);

      if (error || !data?.signedUrl) {
        return document;
      }

      return {
        ...document,
        fileUrl: data.signedUrl,
      };
    }),
  );
}

async function resolvePaymentContract(
  supabase: ReturnType<typeof createClient>,
  payment: PaymentRecord | null,
) {
  if (!payment) {
    return payment;
  }

  return {
    ...payment,
    contractUrl: await resolveSignedContractUrl(supabase, payment.contractUrl),
  };
}

function computeReadinessFromLocal(
  pilgrimId: string,
  docs: DocumentRecord[],
  payment: PaymentRecord | null,
  group: GroupRecord | null,
): PilgrimReadiness {
  return computeReadinessFromDocuments(pilgrimId, docs, payment?.status === "paid", Boolean(group));
}

async function resolveCurrentPilgrimId() {
  if (!isSupabaseConfigured()) {
    return "pl-erlan";
  }

  const auth = await getAuthState();

  if (!auth.user) {
    return null;
  }

  const supabase = createClient();
  const { data } = await supabase.from("pilgrim_profiles").select("id").eq("user_id", auth.user.id).maybeSingle();

  return data?.id ?? null;
}

async function resolveCurrentOperatorId() {
  if (!isSupabaseConfigured()) {
    return "op-al-safa";
  }

  const auth = await getAuthState();

  if (!auth.user) {
    return null;
  }

  const supabase = createClient();
  const { data } = await supabase.from("operators").select("id").eq("user_id", auth.user.id).maybeSingle();

  return data?.id ?? null;
}

const loadPublicOperatorsFromSupabase = cache(async () => {
  const supabase = createClient();
  const { data: operatorRows, error: operatorError } = await supabase
    .from("operators")
    .select("*")
    .eq("is_verified", true)
    .order("rating", { ascending: false });

  if (operatorError || !operatorRows) {
    throw operatorError ?? new Error("operators not found");
  }

  const operatorIds = operatorRows.map((row) => row.id);
  const { data: groupRows, error: groupError } = operatorIds.length
    ? await supabase.from("groups").select("*").in("operator_id", operatorIds)
    : { data: [], error: null };

  if (groupError) {
    throw groupError;
  }

  const groups = (groupRows ?? []).map((row) => mapGroup(row as GroupRow));

  return operatorRows.map((row) => {
    const operator = mapOperator(row as OperatorRow);
    const operatorGroups = groups.filter((group) => group.operatorId === operator.id);

    return {
      operator,
      city: safeCityFromGroups(operatorGroups),
      quotaLeft: safeQuotaLeft(operatorGroups),
    };
  });
});

export async function loadPublicOperatorCards() {
  if (!isSupabaseConfigured()) {
    return getMockVerifiedOperators().map((operator) => ({
      operator,
      city: getMockPrimaryCity(operator.id),
      quotaLeft: getMockQuotaLeft(operator.id),
    }));
  }

  try {
    return await loadPublicOperatorsFromSupabase();
  } catch {
    return getMockVerifiedOperators().map((operator) => ({
      operator,
      city: getMockPrimaryCity(operator.id),
      quotaLeft: getMockQuotaLeft(operator.id),
    }));
  }
}

export async function loadOperatorPublicProfile(operatorId: string) {
  if (!isSupabaseConfigured()) {
    const operator = findMockOperatorBySlugOrId(operatorId) ?? getMockOperatorById(operatorId);
    if (!operator) {
      return null;
    }

    const groups = getMockOperatorGroups(operator.id);
    return {
      operator,
      city: getMockPrimaryCity(operator.id),
      groups,
      reviews: getMockOperatorReviews(operator.id),
    };
  }

  try {
    const supabase = createClient();
    let { data: operatorRow } = await supabase.from("operators").select("*").eq("id", operatorId).maybeSingle();

    if (!operatorRow) {
      const { data: operatorRows } = await supabase.from("operators").select("*").eq("is_verified", true);
      operatorRow = (operatorRows ?? []).find((row) => slugify((row as OperatorRow).company_name) === operatorId) ?? null;
    }

    if (!operatorRow) {
      const fallbackOperator = findMockOperatorBySlugOrId(operatorId);

      if (!fallbackOperator) {
        return null;
      }

      return {
        operator: fallbackOperator,
        city: getMockPrimaryCity(fallbackOperator.id),
        groups: getMockOperatorGroups(fallbackOperator.id),
        reviews: getMockOperatorReviews(fallbackOperator.id),
      };
    }

    const operator = mapOperator(operatorRow as OperatorRow);
    const [{ data: groupRows }, { data: reviewRows }] = await Promise.all([
      supabase.from("groups").select("*").eq("operator_id", operator.id).order("flight_date"),
      supabase.from("operator_reviews").select("*").eq("operator_id", operator.id).eq("is_visible", true).order("created_at", {
        ascending: false,
      }),
    ]);
    const groups = (groupRows ?? []).map((row) => mapGroup(row as GroupRow));
    const reviews = (reviewRows ?? []).map((row) => mapReview(row as ReviewRow));

    return {
      operator,
      city: safeCityFromGroups(groups),
      groups,
      reviews,
    };
  } catch {
    const operator = findMockOperatorBySlugOrId(operatorId) ?? getMockOperatorById(operatorId);
    if (!operator) {
      return null;
    }

    return {
      operator,
      city: getMockPrimaryCity(operatorId),
      groups: getMockOperatorGroups(operatorId),
      reviews: getMockOperatorReviews(operatorId),
    };
  }
}

export async function loadPublicVerification(qrCode: string) {
  if (!isSupabaseConfigured()) {
    return getMockPublicVerification(qrCode);
  }

  try {
    const supabase = createAdminClient();
    const { data: paymentRow } = await supabase.from("payments").select("*").eq("qr_code", qrCode).maybeSingle();

    if (!paymentRow) {
      return getMockPublicVerification(qrCode);
    }

    const payment = mapPayment(paymentRow as PaymentRow);
    const [{ data: pilgrimRow }, { data: operatorRow }] = await Promise.all([
      supabase.from("pilgrim_profiles").select("*").eq("id", payment.pilgrimId).maybeSingle(),
      supabase.from("operators").select("*").eq("id", payment.operatorId).maybeSingle(),
    ]);

    if (!pilgrimRow || !operatorRow) {
      return null;
    }

    return {
      payment,
      pilgrim: mapPilgrim(pilgrimRow as PilgrimRow),
      operator: mapOperator(operatorRow as OperatorRow),
    };
  } catch {
    return getMockPublicVerification(qrCode);
  }
}

export async function loadCabinetBundle() {
  const pilgrimId = await resolveCurrentPilgrimId();

  if (!pilgrimId) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    const pilgrim = getMockPilgrimById(pilgrimId);
    if (!pilgrim) {
      return null;
    }

    return {
      pilgrim,
      documents: getMockPilgrimDocuments(pilgrimId),
      payment: getMockPilgrimPayment(pilgrimId),
      group: getMockPilgrimGroup(pilgrimId),
      notifications: getMockPilgrimNotifications(pilgrimId),
      checklist: getMockPilgrimChecklist(pilgrimId),
      readiness: getMockPilgrimReadiness(pilgrimId),
    };
  }

  try {
    const supabase = createClient();
    const [{ data: pilgrimRow }, { data: documentRows }, { data: paymentRows }, { data: linkRows }, { data: notificationRows }, { data: checklistRows }, { data: readinessRow }] =
      await Promise.all([
        supabase.from("pilgrim_profiles").select("*").eq("id", pilgrimId).maybeSingle(),
        supabase.from("documents").select("*").eq("pilgrim_id", pilgrimId).order("uploaded_at", { ascending: false }),
        supabase.from("payments").select("*").eq("pilgrim_id", pilgrimId).order("created_at", { ascending: false }),
        supabase.from("pilgrim_groups").select("*").eq("pilgrim_id", pilgrimId).limit(1),
        supabase.from("notifications").select("*").eq("pilgrim_id", pilgrimId).order("scheduled_at", { ascending: false }).limit(5),
        supabase.from("checklist_items").select("*").eq("pilgrim_id", pilgrimId),
        supabase.from("pilgrim_readiness_view").select("*").eq("pilgrim_id", pilgrimId).maybeSingle(),
      ]);

    if (!pilgrimRow) {
      return null;
    }

    const documents = await resolveDocumentUrls(
      supabase,
      (documentRows ?? []).map((row) => mapDocument(row as DocumentRow)),
    );
    const payment = await resolvePaymentContract(
      supabase,
      paymentRows?.[0] ? mapPayment(paymentRows[0] as PaymentRow) : null,
    );
    const notifications = (notificationRows ?? []).map((row) => mapNotification(row as NotificationRow));
    const checklist = (checklistRows ?? []).map((row) => mapChecklist(row as ChecklistRow));
    const groupId = (linkRows?.[0] as PilgrimGroupLinkRow | undefined)?.group_id;
    const groupRow = groupId ? await supabase.from("groups").select("*").eq("id", groupId).maybeSingle() : { data: null };
    const group = groupRow.data ? mapGroup(groupRow.data as GroupRow) : null;
    const readiness = readinessRow
      ? mapReadiness(readinessRow as ReadinessRow)
      : computeReadinessFromLocal(pilgrimId, documents, payment, group);

    return {
      pilgrim: mapPilgrim(pilgrimRow as PilgrimRow),
      documents,
      payment,
      group,
      notifications,
      checklist,
      readiness,
    };
  } catch {
    const pilgrim = getMockPilgrimById(pilgrimId);
    if (!pilgrim) {
      return null;
    }

    return {
      pilgrim,
      documents: getMockPilgrimDocuments(pilgrimId),
      payment: getMockPilgrimPayment(pilgrimId),
      group: getMockPilgrimGroup(pilgrimId),
      notifications: getMockPilgrimNotifications(pilgrimId),
      checklist: getMockPilgrimChecklist(pilgrimId),
      readiness: getMockPilgrimReadiness(pilgrimId),
    };
  }
}

export async function loadCrmBundle() {
  const operatorId = await resolveCurrentOperatorId();

  if (!operatorId) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    const pilgrims = getMockOperatorPilgrims(operatorId);
    const groups = getMockOperatorGroups(operatorId);

    return {
      operator: getMockOperatorById(operatorId),
      pilgrims,
      groups,
      payments: mockPayments.filter((payment) => payment.operatorId === operatorId),
      notifications: mockNotifications.filter((notification) => notification.operatorId === operatorId),
      readiness: getMockReadinessView().filter((item) => pilgrims.some((pilgrim) => pilgrim.id === item.pilgrimId)),
      documents: mockDocuments.filter((document) => pilgrims.some((pilgrim) => pilgrim.id === document.pilgrimId)),
      groupLinks: mockPilgrims
        .flatMap((pilgrim) => {
          const group = getMockPilgrimGroup(pilgrim.id);
          return group ? [{ pilgrimId: pilgrim.id, groupId: group.id }] : [];
        })
        .filter((link) => pilgrims.some((pilgrim) => pilgrim.id === link.pilgrimId)),
    };
  }

  try {
    const supabase = createClient();
    const [{ data: operatorRow }, { data: pilgrimRows }, { data: groupRows }, { data: paymentRows }, { data: notificationRows }] =
      await Promise.all([
        supabase.from("operators").select("*").eq("id", operatorId).maybeSingle(),
        supabase.from("pilgrim_profiles").select("*").eq("operator_id", operatorId).order("created_at", { ascending: false }),
        supabase.from("groups").select("*").eq("operator_id", operatorId).order("flight_date", { ascending: true }),
        supabase.from("payments").select("*").eq("operator_id", operatorId).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("operator_id", operatorId).order("scheduled_at", { ascending: false }),
      ]);

    if (!operatorRow) {
      return null;
    }

    const pilgrims = (pilgrimRows ?? []).map((row) => mapPilgrim(row as PilgrimRow));
    const groups = (groupRows ?? []).map((row) => mapGroup(row as GroupRow));
    const payments = (paymentRows ?? []).map((row) => mapPayment(row as PaymentRow));
    const notifications = (notificationRows ?? []).map((row) => mapNotification(row as NotificationRow));
    const pilgrimIds = pilgrims.map((pilgrim) => pilgrim.id);
    const [{ data: readinessRows }, { data: documentRows }, { data: groupLinkRows }] = await Promise.all([
      pilgrimIds.length ? supabase.from("pilgrim_readiness_view").select("*").in("pilgrim_id", pilgrimIds) : Promise.resolve({ data: [] }),
      pilgrimIds.length ? supabase.from("documents").select("*").in("pilgrim_id", pilgrimIds) : Promise.resolve({ data: [] }),
      pilgrimIds.length ? supabase.from("pilgrim_groups").select("*").in("pilgrim_id", pilgrimIds) : Promise.resolve({ data: [] }),
    ]);

    return {
      operator: mapOperator(operatorRow as OperatorRow),
      pilgrims,
      groups,
      payments,
      notifications,
      readiness: (readinessRows ?? []).map((row) => mapReadiness(row as ReadinessRow)),
      documents: (documentRows ?? []).map((row) => mapDocument(row as DocumentRow)),
      groupLinks: (groupLinkRows ?? []).map((row) => ({
        pilgrimId: (row as PilgrimGroupLinkRow).pilgrim_id,
        groupId: (row as PilgrimGroupLinkRow).group_id,
      })),
    };
  } catch {
    const pilgrims = getMockOperatorPilgrims(operatorId);
    return {
      operator: getMockOperatorById(operatorId),
      pilgrims,
      groups: getMockOperatorGroups(operatorId),
      payments: mockPayments.filter((payment) => payment.operatorId === operatorId),
      notifications: mockNotifications.filter((notification) => notification.operatorId === operatorId),
      readiness: getMockReadinessView().filter((item) => pilgrims.some((pilgrim) => pilgrim.id === item.pilgrimId)),
      documents: mockDocuments.filter((document) => pilgrims.some((pilgrim) => pilgrim.id === document.pilgrimId)),
      groupLinks: mockPilgrims
        .flatMap((pilgrim) => {
          const group = getMockPilgrimGroup(pilgrim.id);
          return group ? [{ pilgrimId: pilgrim.id, groupId: group.id }] : [];
        })
        .filter((link) => pilgrims.some((pilgrim) => pilgrim.id === link.pilgrimId)),
    };
  }
}

export async function loadCrmPilgrimDetail(pilgrimId: string) {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const resolvedPilgrimId =
    crm.pilgrims.find((pilgrim) => pilgrim.id === pilgrimId || slugify(pilgrim.fullName) === pilgrimId)?.id ?? pilgrimId;

  if (!isSupabaseConfigured()) {
    const pilgrim = getMockPilgrimById(resolvedPilgrimId);
    if (!pilgrim) {
      return null;
    }

    return {
      pilgrim,
      documents: getMockPilgrimDocuments(resolvedPilgrimId),
      payment: getMockPilgrimPayment(resolvedPilgrimId),
      group: getMockPilgrimGroup(resolvedPilgrimId),
      readiness: getMockPilgrimReadiness(resolvedPilgrimId),
      timeline: getMockPilgrimTimeline(resolvedPilgrimId),
    };
  }

  try {
    const supabase = createClient();
    const [{ data: pilgrimRow }, { data: documentRows }, { data: paymentRows }, { data: linkRows }, { data: notificationRows }, { data: readinessRow }] =
      await Promise.all([
        supabase.from("pilgrim_profiles").select("*").eq("id", resolvedPilgrimId).maybeSingle(),
        supabase.from("documents").select("*").eq("pilgrim_id", resolvedPilgrimId).order("uploaded_at", { ascending: false }),
        supabase.from("payments").select("*").eq("pilgrim_id", resolvedPilgrimId).order("created_at", { ascending: false }),
        supabase.from("pilgrim_groups").select("*").eq("pilgrim_id", resolvedPilgrimId).limit(1),
        supabase.from("notifications").select("*").eq("pilgrim_id", resolvedPilgrimId).order("scheduled_at", { ascending: false }).limit(5),
        supabase.from("pilgrim_readiness_view").select("*").eq("pilgrim_id", resolvedPilgrimId).maybeSingle(),
      ]);

    if (!pilgrimRow) {
      return null;
    }

    const documents = await resolveDocumentUrls(
      supabase,
      (documentRows ?? []).map((row) => mapDocument(row as DocumentRow)),
    );
    const payment = await resolvePaymentContract(
      supabase,
      paymentRows?.[0] ? mapPayment(paymentRows[0] as PaymentRow) : null,
    );
    const groupId = (linkRows?.[0] as PilgrimGroupLinkRow | undefined)?.group_id;
    const groupRow = groupId ? await supabase.from("groups").select("*").eq("id", groupId).maybeSingle() : { data: null };
    const group = groupRow.data ? mapGroup(groupRow.data as GroupRow) : null;
    const notifications = (notificationRows ?? []).map((row) => mapNotification(row as NotificationRow));
    const readiness = readinessRow
      ? mapReadiness(readinessRow as ReadinessRow)
      : computeReadinessFromLocal(resolvedPilgrimId, documents, payment, group);

    return {
      pilgrim: mapPilgrim(pilgrimRow as PilgrimRow),
      documents,
      payment,
      group,
      readiness,
      timeline: defaultTimelineFromNotifications(notifications, resolvedPilgrimId),
    };
  } catch {
    const pilgrim = getMockPilgrimById(resolvedPilgrimId);
    if (!pilgrim) {
      return null;
    }

    return {
      pilgrim,
      documents: getMockPilgrimDocuments(resolvedPilgrimId),
      payment: getMockPilgrimPayment(resolvedPilgrimId),
      group: getMockPilgrimGroup(resolvedPilgrimId),
      readiness: getMockPilgrimReadiness(resolvedPilgrimId),
      timeline: getMockPilgrimTimeline(resolvedPilgrimId),
    };
  }
}

export async function loadAdminBundle() {
  if (!isSupabaseConfigured()) {
    return {
      operators: mockOperators,
      reviews: mockReviews,
      pilgrims: mockPilgrims,
      payments: mockPayments,
    };
  }

  try {
    const supabase = createClient();
    const [{ data: operatorRows }, { data: reviewRows }, { data: pilgrimRows }, { data: paymentRows }] = await Promise.all([
      supabase.from("operators").select("*").order("created_at", { ascending: false }),
      supabase.from("operator_reviews").select("*").order("created_at", { ascending: false }),
      supabase.from("pilgrim_profiles").select("*"),
      supabase.from("payments").select("*"),
    ]);

    return {
      operators: (operatorRows ?? []).map((row) => mapOperator(row as OperatorRow)),
      reviews: (reviewRows ?? []).map((row) => mapReview(row as ReviewRow)),
      pilgrims: (pilgrimRows ?? []).map((row) => mapPilgrim(row as PilgrimRow)),
      payments: (paymentRows ?? []).map((row) => mapPayment(row as PaymentRow)),
    };
  } catch {
    return {
      operators: mockOperators,
      reviews: mockReviews,
      pilgrims: mockPilgrims,
      payments: mockPayments,
    };
  }
}
