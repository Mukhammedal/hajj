import { CrmTopbar } from "@/components/crm/crm-topbar";
import { whatsappScenarios } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";

export default async function CrmWhatsappPage() {
  const crm = await loadCrmBundle();

  if (!crm) {
    return null;
  }

  return (
    <>
      <CrmTopbar
        title={
          <>
            WhatsApp <em>Business API.</em>
          </>
        }
        actions={
          <>
            <span className="bot-status">
              <span className="dot" /> Подключён · +7 727 311 42 00
            </span>
            <a className="btn btn-dark btn-sm" href="/crm/notifications">
              + Новый сценарий
            </a>
          </>
        }
      />

      <div className="metrics-4" style={{ marginBottom: 24 }}>
        <div className="metric">
          <div className="k">Диалогов · апрель</div>
          <div className="v">{crm.notifications.length * 22}</div>
          <div className="delta">▲ журнал уведомлений и чатов</div>
        </div>
        <div className="metric">
          <div className="k">Avg response</div>
          <div className="v">12 мин</div>
          <div className="delta">куратор · 08–22</div>
        </div>
        <div className="metric">
          <div className="k">Автоответов</div>
          <div className="v">{crm.notifications.filter((item) => item.channel === "whatsapp").length}</div>
          <div className="delta">FAQ + reminders</div>
        </div>
        <div className="metric">
          <div className="k">Uptime · 30д</div>
          <div className="v">99.8%</div>
          <div className="delta">1 сбой · 12 мин</div>
        </div>
      </div>

      <div className="wa-split">
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Активные сценарии · {whatsappScenarios.length}</div>
          {whatsappScenarios.map((scenario) => (
            <div key={scenario.title} className="wa-scenario">
              <div className="sh">
                <div className="sn">{scenario.title}</div>
                <span className={`tag ${scenario.tone}`}>{scenario.status}</span>
              </div>
              <div className="sb">{scenario.detail}</div>
              <div className="sm">
                {scenario.meta.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>Превью · «Напоминание о платеже»</div>
          <div className="wa-preview">
            <div className="wph">
              <div className="ava" />
              <div>
                <div className="name">HajjCRM · Al-Safa</div>
                <div className="sub">бизнес · онлайн</div>
              </div>
            </div>
            <div className="wpb">
              <div className="bub them">
                Ассалаумағалейкум, Ерлан! Напоминаем: до платежа по договору осталось 3 дня. Сумма к оплате — 950 000 ₸.
              </div>
              <div className="bub them">
                Оплатить можно через Kaspi / Halyk. Нужна помощь? Напишите «куратор».
              </div>
              <div className="bub me">спасибо, оплачу сегодня через Kaspi</div>
              <div className="bub them">Барекелла! После оплаты пришлю чек автоматически.</div>
            </div>
            <div className="wpi">
              <div className="in">Написать сообщение…</div>
              <div className="sbtn">➤</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
