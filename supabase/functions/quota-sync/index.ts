import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

interface WebhookPayload {
  type: "INSERT" | "DELETE";
  record?: { group_id?: string };
  old_record?: { group_id?: string };
}

Deno.serve(async (request) => {
  const payload = (await request.json()) as WebhookPayload;
  const groupId = payload.record?.group_id ?? payload.old_record?.group_id;

  if (!groupId) {
    return new Response(JSON.stringify({ ok: false, error: "Missing group_id" }), { status: 400 });
  }

  const delta = payload.type === "INSERT" ? 1 : -1;

  const { data: group, error: groupError } = await supabase
    .from("groups")
    .select("id, quota_filled, quota_total, status")
    .eq("id", groupId)
    .single();

  if (groupError || !group) {
    return new Response(JSON.stringify({ ok: false, error: groupError?.message ?? "Group not found" }), { status: 404 });
  }

  const nextFilled = Math.max(0, group.quota_filled + delta);
  const nextStatus = nextFilled >= group.quota_total ? "full" : group.status === "full" ? "forming" : group.status;

  const { error: updateError } = await supabase
    .from("groups")
    .update({ quota_filled: nextFilled, status: nextStatus })
    .eq("id", groupId);

  if (updateError) {
    return new Response(JSON.stringify({ ok: false, error: updateError.message }), { status: 500 });
  }

  return Response.json({ ok: true, groupId, quotaFilled: nextFilled, status: nextStatus });
});
