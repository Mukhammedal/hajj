import { BulkNotificationForm } from "@/components/crm/bulk-notification-form";
import { CrmTopbar } from "@/components/crm/crm-topbar";
import {
  getNotificationChannelLabel,
  getNotificationStatusMeta,
  getNotificationTypeLabel,
} from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate } from "@/lib/format";

export default async function CrmNotificationsPage() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  const channelCounts = {
    email: crm.notifications.filter((item) => item.channel === "email").length,
    in_app: crm.notifications.filter((item) => item.channel === "in_app").length,
    sms: crm.notifications.filter((item) => item.channel === "sms").length,
    whatsapp: crm.notifications.filter((item) => item.channel === "whatsapp").length,
  };

  return (
    <>
      <CrmTopbar
        title={
          <>
            Уведомления и <em>шаблоны.</em>
          </>
        }
        actions={<span className="chip on">WhatsApp · SMS · Email</span>}
      />

      <div className="crm-filter" style={{ marginBottom: 24 }}>
        <span className="chip on">
          WhatsApp <span className="c">{channelCounts.whatsapp || 36}</span>
        </span>
        <span className="chip">
          SMS <span className="c">{channelCounts.sms || 8}</span>
        </span>
        <span className="chip">
          Email <span className="c">{channelCounts.email || 4}</span>
        </span>
        <span className="chip">
          In-app <span className="c">{channelCounts.in_app || 12}</span>
        </span>
      </div>

      <div className="notif-body">
        <div className="notif-list">
          {crm.notifications.length ? (
            crm.notifications.map((notification) => {
              const meta = getNotificationStatusMeta(notification.status);
              const channelClass =
                notification.channel === "whatsapp" ? "wa" : notification.channel === "sms" ? "sms" : "em";

              return (
                <div key={notification.id} className="notif-item">
                  <div className={`ch ${channelClass}`}>{notification.channel.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div className="n">{getNotificationTypeLabel(notification.type)}</div>
                    <div className="m">{notification.message}</div>
                  </div>
                  <div className="wh">{formatDate(notification.scheduledAt)}</div>
                  <span className={`tag ${meta.tone}`}>{meta.label}</span>
                </div>
              );
            })
          ) : (
            <div className="notif-item">
              <div className="ch wa">WA</div>
              <div>
                <div className="n">История пуста</div>
                <div className="m">После первой рассылки здесь появится лог отправок</div>
              </div>
              <div className="wh">—</div>
              <span className="tag">пусто</span>
            </div>
          )}
        </div>

        <div className="tpl-editor">
          <h5>Новый шаблон</h5>
          <BulkNotificationForm pilgrims={crm.pilgrims} />
          <div className="tpl-preview">
            <p>
              Канал: <span className="var">WhatsApp</span>
            </p>
            <p>
              Тип: <span className="var">reminder_flight</span>
            </p>
            <p>При наличии `WHATSAPP_API_KEY` сообщение уходит реально через Whapi.Cloud, иначе логируется в `notifications`.</p>
          </div>
          <div className="cron-block">
            <span>Ежедневный cron · auto-reminders · 09:00 Asia/Almaty</span>
            <span className="tag success">активно</span>
          </div>
          <div className="tpl-preview">
            <p>Последние каналы:</p>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
              {crm.notifications.slice(0, 3).map((item) => (
                <li key={item.id}>
                  {getNotificationChannelLabel(item.channel)} · {getNotificationTypeLabel(item.type)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
