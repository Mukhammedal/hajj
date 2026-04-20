"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";

import { initialActionState } from "@/lib/actions/action-state";
import { sendBulkReminderAction } from "@/lib/actions/hajj-actions";
import { reminderSchema, type ReminderInput } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { PilgrimProfile } from "@/types/domain";

const templates: Array<{ type: ReminderInput["type"]; label: string; message: string }> = [
  {
    type: "reminder_flight",
    label: "Перед вылетом",
    message: "Напоминание перед вылетом: проверьте документы, оплату, время сбора и чек-лист в кабинете паломника.",
  },
  {
    type: "reminder_docs",
    label: "Документы",
    message: "Напоминание: проверьте список документов в кабинете и загрузите недостающие файлы.",
  },
  {
    type: "reminder_payment",
    label: "Оплата",
    message: "Напоминание: по вашему договору есть незакрытый остаток. Завершите оплату в кабинете.",
  },
  {
    type: "welcome",
    label: "Welcome",
    message: "Добро пожаловать в кабинет паломника. Здесь вы найдёте договор, чек-лист и статусы документов.",
  },
  {
    type: "checklist",
    label: "Checklist",
    message: "Проверьте дорожный чек-лист и убедитесь, что все обязательные пункты отмечены.",
  },
];

export function BulkNotificationForm({ pilgrims }: { pilgrims: PilgrimProfile[] }) {
  const [state, action] = useFormState(sendBulkReminderAction, initialActionState);
  const [selected, setSelected] = useState<string[]>(pilgrims.slice(0, 2).map((item) => item.id));
  const [channel, setChannel] = useState<ReminderInput["channel"]>("whatsapp");
  const [type, setType] = useState<ReminderInput["type"]>("reminder_flight");
  const [message, setMessage] = useState(templates[0].message);

  const validation = useMemo(
    () =>
      reminderSchema.safeParse({
        pilgrimIds: selected,
        channel,
        type,
        message,
      }),
    [channel, message, selected, type],
  );
  const clientErrors = validation.success ? {} : validation.error.flatten().fieldErrors;

  function togglePilgrim(pilgrimId: string, checked: boolean) {
    setSelected((prev) => (checked ? Array.from(new Set([...prev, pilgrimId])) : prev.filter((item) => item !== pilgrimId)));
  }

  function applyTemplate(nextType: ReminderInput["type"]) {
    const template = templates.find((item) => item.type === nextType);
    setType(nextType);
    if (template) {
      setMessage(template.message);
    }
  }

  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="channel" value={channel} />
      <input type="hidden" name="type" value={type} />

      <div className="flex flex-wrap gap-3">
        {templates.map((template) => (
          <button
            key={template.type}
            type="button"
            onClick={() => applyTemplate(template.type)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              type === template.type ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
            }`}
          >
            {template.label}
          </button>
        ))}
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Канал</label>
        <div className="flex gap-3">
          <ChannelButton active={channel === "whatsapp"} onClick={() => setChannel("whatsapp")} label="WhatsApp" />
          <ChannelButton active={channel === "sms"} onClick={() => setChannel("sms")} label="SMS" />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Получатели</label>
        <div className="grid max-h-56 gap-3 overflow-y-auto rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
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

      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Сообщение</label>
        <Textarea
          name="message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Текст сообщения"
        />
        {clientErrors.message?.[0] ?? state.fieldErrors?.message?.[0] ? (
          <p className="mt-2 text-sm text-danger">{clientErrors.message?.[0] ?? state.fieldErrors?.message?.[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p className={state.status === "error" ? "text-sm text-danger" : "text-sm text-success"}>{state.message}</p>
      ) : null}
      <SubmitButton disabled={!validation.success} />
    </form>
  );
}

function ChannelButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
        active ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/5 text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending}>
      {pending ? "Ставим в очередь..." : "Поставить в очередь"}
    </Button>
  );
}
