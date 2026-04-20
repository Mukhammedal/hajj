"use client";

import { useFormStatus } from "react-dom";

import { verifyOperatorAction } from "@/lib/actions/hajj-actions";

export function OperatorDecisionActions({ operatorId }: { operatorId?: string }) {
  const approveAction = operatorId ? verifyOperatorAction.bind(null, operatorId, true) : null;
  const rejectAction = operatorId ? verifyOperatorAction.bind(null, operatorId, false) : null;

  return (
    <>
      {approveAction ? (
        <form action={approveAction}>
          <ApproveButton />
        </form>
      ) : (
        <button className="btn btn-dark btn-sm" style={{ background: "var(--success)" }} type="button">
          ✓ Approve
        </button>
      )}
      {rejectAction ? (
        <form action={rejectAction}>
          <RejectButton />
        </form>
      ) : (
        <button className="btn btn-ghost btn-sm" type="button">
          ✕ Reject
        </button>
      )}
    </>
  );
}

function ApproveButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-dark btn-sm" style={{ background: "var(--success)" }} disabled={pending} type="submit">
      {pending ? "Сохраняем..." : "✓ Approve"}
    </button>
  );
}

function RejectButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn btn-ghost btn-sm" disabled={pending} type="submit">
      {pending ? "Сохраняем..." : "✕ Reject"}
    </button>
  );
}
