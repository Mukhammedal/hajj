import { BellRing, MessageSquareText } from "lucide-react";

import { BulkNotificationForm } from "@/components/crm/bulk-notification-form";
import { Badge } from "@/components/ui/badge";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate } from "@/lib/format";

export default async function CrmNotificationsPage() {
  const crm = await loadCrmBundle();
  const history = crm?.notifications ?? [];
  const pilgrims = crm?.pilgrims ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="shell-panel p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Badge>Bulk messaging</Badge>
            <h2 className="mt-4 text-4xl">Уведомления</h2>
          </div>
          <BellRing className="h-6 w-6 text-primary" />
        </div>
        <div className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquareText className="h-4 w-4 text-primary" />
          При наличии `WHATSAPP_API_KEY` WhatsApp уходит реально через Whapi.Cloud, иначе запись остаётся в notifications.
        </div>
        <BulkNotificationForm pilgrims={pilgrims} />
      </section>

      <section className="shell-panel overflow-hidden p-0">
        <div className="border-b border-white/10 px-6 py-5">
          <h3 className="text-3xl">История уведомлений</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <tr>
                <th className="px-5 py-4">Канал</th>
                <th className="px-5 py-4">Тип</th>
                <th className="px-5 py-4">Статус</th>
                <th className="px-5 py-4">Дата</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry) => (
                <tr key={entry.id} className="border-b border-white/8 last:border-b-0">
                  <td className="px-5 py-4">{entry.channel}</td>
                  <td className="px-5 py-4">{entry.type}</td>
                  <td className="px-5 py-4">
                    <Badge variant={entry.status === "sent" ? "success" : entry.status === "failed" ? "danger" : "warning"}>
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">{formatDate(entry.scheduledAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
