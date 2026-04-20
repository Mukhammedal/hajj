import "server-only";

import { randomUUID } from "node:crypto";

import { fetchSheetSnapshot } from "@/lib/google-sheets";
import { mapSheetRows, type NormalizedSheetRow } from "@/lib/sheet-mapper";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PaymentStatus, PilgrimStatus } from "@/types/domain";

export interface SyncResult {
  created: number;
  errors: string[];
  skipped: number;
  updated: number;
}

type AdminClient = ReturnType<typeof createAdminClient>;

type PaymentRow = {
  created_at: string;
  id: string;
  paid_amount: number | string;
  status: PaymentStatus;
  total_amount: number | string;
};

type PilgrimGroupLinkRow = {
  group_id: string;
  joined_at: string;
};

function derivePilgrimStatus(paymentStatus: PaymentStatus | null): PilgrimStatus {
  if (paymentStatus === "paid") {
    return "docs_pending";
  }

  if (paymentStatus === "partial") {
    return "payment_partial";
  }

  if (paymentStatus === "pending") {
    return "payment_pending";
  }

  return "new";
}

function derivePaymentSnapshot(row: NormalizedSheetRow, existingPayment?: PaymentRow | null) {
  const status = row.payment_status ?? existingPayment?.status ?? "pending";
  const existingTotal = existingPayment ? Number(existingPayment.total_amount) : 0;
  const existingPaid = existingPayment ? Number(existingPayment.paid_amount) : 0;
  const sheetAmount = row.payment_amount ?? null;
  const totalAmount = sheetAmount ?? existingTotal;

  if (status === "paid") {
    return {
      status,
      totalAmount,
      paidAmount: totalAmount,
    };
  }

  if (status === "partial") {
    const baselineTotal = totalAmount || existingTotal;
    const fallbackPaid = baselineTotal > 0 ? Number((baselineTotal / 2).toFixed(2)) : 0;

    return {
      status,
      totalAmount: baselineTotal,
      paidAmount: Math.min(existingPaid || fallbackPaid, baselineTotal || existingPaid || fallbackPaid),
    };
  }

  return {
    status,
    totalAmount,
    paidAmount: 0,
  };
}

async function ensureGroupForRow(
  supabase: AdminClient,
  operatorId: string,
  row: NormalizedSheetRow,
) {
  if (!row.group_name) {
    return null;
  }

  const { data: existingGroup, error: existingGroupError } = await supabase
    .from("groups")
    .select("id")
    .eq("operator_id", operatorId)
    .eq("name", row.group_name)
    .maybeSingle();

  if (existingGroupError) {
    throw existingGroupError;
  }

  if (existingGroup?.id) {
    return existingGroup.id;
  }

  const flightDate = row.flight_date ?? new Date().toISOString().slice(0, 10);
  const { data: createdGroup, error: createGroupError } = await supabase
    .from("groups")
    .insert({
      operator_id: operatorId,
      name: row.group_name,
      flight_date: flightDate,
      return_date: flightDate,
      quota_total: 500,
      quota_filled: 0,
      departure_city: "Almaty",
      status: "forming",
    })
    .select("id")
    .maybeSingle();

  if (createGroupError || !createdGroup?.id) {
    throw createGroupError ?? new Error(`Failed to create group ${row.group_name}`);
  }

  return createdGroup.id;
}

async function syncPilgrimGroup(
  supabase: AdminClient,
  pilgrimId: string,
  targetGroupId: string | null,
) {
  if (!targetGroupId) {
    return false;
  }

  const { data: existingLinks, error: existingLinksError } = await supabase
    .from("pilgrim_groups")
    .select("pilgrim_id, group_id, joined_at")
    .eq("pilgrim_id", pilgrimId);

  if (existingLinksError) {
    throw existingLinksError;
  }

  if (!existingLinks?.length) {
    const { error: insertError } = await supabase.from("pilgrim_groups").insert({
      pilgrim_id: pilgrimId,
      group_id: targetGroupId,
      joined_at: new Date().toISOString(),
    });

    if (insertError) {
      throw insertError;
    }

    return true;
  }

  if (existingLinks.some((link) => link.group_id === targetGroupId)) {
    return false;
  }

  if (existingLinks.length > 1) {
    throw new Error(`Pilgrim ${pilgrimId} already linked to multiple groups; manual review required.`);
  }

  const currentLink = existingLinks[0] as PilgrimGroupLinkRow;
  const { error: updateError } = await supabase
    .from("pilgrim_groups")
    .update({
      group_id: targetGroupId,
      joined_at: currentLink.joined_at,
    })
    .eq("pilgrim_id", pilgrimId)
    .eq("group_id", currentLink.group_id);

  if (updateError) {
    throw updateError;
  }

  return true;
}

async function upsertPaymentForPilgrim(
  supabase: AdminClient,
  operatorId: string,
  pilgrimId: string,
  row: NormalizedSheetRow,
) {
  const { data: paymentRows, error: paymentError } = await supabase
    .from("payments")
    .select("id, total_amount, paid_amount, status, created_at")
    .eq("operator_id", operatorId)
    .eq("pilgrim_id", pilgrimId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (paymentError) {
    throw paymentError;
  }

  const existingPayment = (paymentRows?.[0] as PaymentRow | undefined) ?? null;
  const nextPayment = derivePaymentSnapshot(row, existingPayment);

  if (existingPayment) {
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        total_amount: nextPayment.totalAmount,
        paid_amount: nextPayment.paidAmount,
        status: nextPayment.status,
      })
      .eq("id", existingPayment.id);

    if (updateError) {
      throw updateError;
    }

    return;
  }

  const { error: insertError } = await supabase.from("payments").insert({
    pilgrim_id: pilgrimId,
    operator_id: operatorId,
    total_amount: nextPayment.totalAmount,
    paid_amount: nextPayment.paidAmount,
    payment_method: "transfer",
    installment_plan: nextPayment.status === "partial",
    status: nextPayment.status,
  });

  if (insertError) {
    throw insertError;
  }
}

async function logSyncResult(
  supabase: AdminClient,
  operatorId: string,
  sheetId: string,
  sheetName: string,
  result: SyncResult,
) {
  await Promise.all([
    supabase.from("sync_logs").insert({
      operator_id: operatorId,
      sheet_id: sheetId,
      sheet_name: sheetName,
      rows_created: result.created,
      rows_updated: result.updated,
      rows_skipped: result.skipped,
      errors: result.errors,
    }),
    supabase
      .from("operators")
      .update({
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", operatorId),
  ]);
}

export async function syncSheetToSupabase(operatorId: string, sheetId: string): Promise<SyncResult> {
  const supabase = createAdminClient();
  const snapshot = await fetchSheetSnapshot(sheetId);
  const result: SyncResult = {
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (!snapshot.sheetName) {
    result.errors.push("Google Sheet недоступен или пуст.");
    await logSyncResult(supabase, operatorId, sheetId, "", result);
    return result;
  }

  const { rows } = mapSheetRows(snapshot.rows);

  for (const row of rows) {
    if (!row.iin) {
      result.skipped += 1;
      result.errors.push(`Строка без ИИН пропущена: ${row.full_name || "без имени"}.`);
      continue;
    }

    try {
      const targetGroupId = await ensureGroupForRow(supabase, operatorId, row);
      const { data: existingPilgrim, error: pilgrimError } = await supabase
        .from("pilgrim_profiles")
        .select("id, phone")
        .eq("iin", row.iin)
        .maybeSingle();

      if (pilgrimError) {
        throw pilgrimError;
      }

      if (!existingPilgrim?.id) {
        const { data: createdPilgrim, error: createPilgrimError } = await supabase
          .from("pilgrim_profiles")
          .insert({
            user_id: randomUUID(),
            operator_id: operatorId,
            full_name: row.full_name || `Импорт из Google Sheets ${row.iin}`,
            iin: row.iin,
            phone: row.phone || null,
            status: derivePilgrimStatus(row.payment_status),
          })
          .select("id")
          .maybeSingle();

        if (createPilgrimError || !createdPilgrim?.id) {
          throw createPilgrimError ?? new Error(`Failed to create pilgrim for IIN ${row.iin}`);
        }

        await Promise.all([
          syncPilgrimGroup(supabase, createdPilgrim.id, targetGroupId),
          upsertPaymentForPilgrim(supabase, operatorId, createdPilgrim.id, row),
        ]);
        result.created += 1;
        continue;
      }

      const updates: Record<string, string | null> = {};

      if (row.phone && row.phone !== (existingPilgrim.phone ?? "")) {
        updates.phone = row.phone;
      }

      if (Object.keys(updates).length) {
        const { error: updatePilgrimError } = await supabase
          .from("pilgrim_profiles")
          .update(updates)
          .eq("id", existingPilgrim.id);

        if (updatePilgrimError) {
          throw updatePilgrimError;
        }
      }

      const [groupChanged] = await Promise.all([
        syncPilgrimGroup(supabase, existingPilgrim.id, targetGroupId),
        upsertPaymentForPilgrim(supabase, operatorId, existingPilgrim.id, row),
      ]);

      if (Object.keys(updates).length || groupChanged) {
        result.updated += 1;
      } else {
        result.skipped += 1;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sync error";
      result.errors.push(`IIN ${row.iin}: ${message}`);
    }
  }

  await logSyncResult(supabase, operatorId, sheetId, snapshot.sheetName, result);
  return result;
}
