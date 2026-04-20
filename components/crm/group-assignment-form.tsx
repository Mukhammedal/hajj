"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { assignPilgrimsToGroupAction, initialActionState } from "@/lib/actions/hajj-actions";
import { groupAssignmentSchema, type GroupAssignmentInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import type { GroupRecord, PilgrimProfile } from "@/types/domain";

export function GroupAssignmentForm({
  groups,
  pilgrims,
}: {
  groups: GroupRecord[];
  pilgrims: PilgrimProfile[];
}) {
  const [state, action] = useFormState(assignPilgrimsToGroupAction, initialActionState);
  const [groupId, setGroupId] = useState<string>(groups[0]?.id ?? "");
  const [selected, setSelected] = useState<string[]>([]);

  const validation = useMemo(
    () =>
      groupAssignmentSchema.safeParse({
        groupId,
        pilgrimIds: selected,
      }),
    [groupId, selected],
  );
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  function togglePilgrim(pilgrimId: string, checked: boolean) {
    setSelected((prev) => (checked ? Array.from(new Set([...prev, pilgrimId])) : prev.filter((item) => item !== pilgrimId)));
  }

  if (!groups.length) {
    return <p className="text-sm leading-7 text-muted-foreground">Сначала создайте хотя бы одну группу, затем можно будет назначать паломников.</p>;
  }

  if (!pilgrims.length) {
    return <p className="text-sm leading-7 text-muted-foreground">Пока нет паломников. Сначала создайте карточку паломника.</p>;
  }

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Группа назначения</label>
        <select
          name="groupId"
          value={groupId}
          onChange={(event) => setGroupId(event.target.value)}
          className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        {clientErrors.groupId?.[0] ?? state.fieldErrors?.groupId?.[0] ? (
          <p className="mt-2 text-sm text-danger">{clientErrors.groupId?.[0] ?? state.fieldErrors?.groupId?.[0]}</p>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Паломники</label>
        <div className="grid max-h-60 gap-3 overflow-y-auto rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
          {pilgrims.map((pilgrim) => (
            <label key={pilgrim.id} className="flex items-center gap-3 text-sm text-foreground">
              <input
                type="checkbox"
                name="pilgrimIds"
                value={pilgrim.id}
                checked={selected.includes(pilgrim.id)}
                onChange={(event: ChangeEvent<HTMLInputElement>) => togglePilgrim(pilgrim.id, event.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <span>{pilgrim.fullName}</span>
            </label>
          ))}
        </div>
        {clientErrors.pilgrimIds?.[0] ?? state.fieldErrors?.pilgrimIds?.[0] ? (
          <p className="mt-2 text-sm text-danger">{clientErrors.pilgrimIds?.[0] ?? state.fieldErrors?.pilgrimIds?.[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-danger" : "text-sm text-success"}>{state.message}</p>
      ) : null}
      <SubmitButton disabled={!validation.success} />
    </form>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Назначаем..." : "Назначить в группу"}
    </Button>
  );
}
