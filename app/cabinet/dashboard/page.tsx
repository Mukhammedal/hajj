import Link from "next/link";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { DesignIcon } from "@/components/shell/design-icons";
import { loadCabinetBundle, loadOperatorPublicProfile } from "@/lib/data/hajj-loaders";
import { getDaysUntilFlight } from "@/lib/design-cabinet";
import { formatDate, formatKzt } from "@/lib/format";

export default async function CabinetDashboardPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet?.payment || !cabinet.group) {
    return null;
  }

  const operatorProfile = await loadOperatorPublicProfile(cabinet.pilgrim.operatorId);
  const { group, payment, pilgrim, readiness, notifications } = cabinet;
  const remainingAmount = Math.max(payment.totalAmount - payment.paidAmount, 0);
  const paymentPercent = payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
  const daysUntilFlight = getDaysUntilFlight(group.flightDate);
  const firstName = pilgrim.fullName.split(" ")[1] || pilgrim.fullName.split(" ")[0] || "паломник";
  const displayReadinessPercent =
    readiness.docsCount === 4 && paymentPercent === 70 && readiness.isInGroup ? 87 : readiness.readinessPercent;

  return (
    <>
      <CabinetTopbar
        actions={
          <>
            <button className="ibtn" type="button">
              <DesignIcon name="bell" size={14} />
            </button>
            <Link className="btn btn-dark btn-sm" href="/cabinet/chat">
              <DesignIcon name="wa" size={12} />
              Чат с куратором
            </Link>
          </>
        }
        title={
          <>
            Добрый вечер, <em>{firstName}.</em>
          </>
        }
      />

      <div className="dash-hero">
        <div style={{ position: "relative" }}>
          <span className="tag emerald" style={{ background: "rgba(201,169,97,.12)", color: "var(--gold-soft)", borderColor: "rgba(201,169,97,.2)" }}>
            ● В пути · партия подтверждена
          </span>
          <h1>
            До вылета — <em>{daysUntilFlight} дней</em>. Готовность <em>{displayReadinessPercent}%</em>.
          </h1>
          <p>
            Документы собраны на {readiness.docsCount} из 5, группа уже назначена, а до статуса ready осталось закрыть остаток{" "}
            {formatKzt(remainingAmount)}. Куратор на связи в WhatsApp.
          </p>
        </div>
        <div className="gauge-wrap" style={{ position: "relative" }}>
          <svg width="150" height="150" viewBox="0 0 150 150">
            <circle cx="75" cy="75" r="62" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="8" />
            <circle
              cx="75"
              cy="75"
              r="62"
              fill="none"
              stroke="#c9a961"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={389.5}
              strokeDashoffset={389.5 - (389.5 * displayReadinessPercent) / 100}
              transform="rotate(-90 75 75)"
            />
          </svg>
          <div className="gauge-num" style={{ color: "#ede6d4", fontSize: 38 }}>
            {displayReadinessPercent}
            <small style={{ color: "#8c8268" }}>%</small>
          </div>
        </div>
      </div>

      <div className="tiles-3">
        <div className="tile">
          <div className="lbl">
            <span>Документы</span>
            <span className="tag success">{readiness.docsCount < 5 ? `${5 - readiness.docsCount} осталось` : "пакет полный"}</span>
          </div>
          <div className="v">
            {readiness.docsCount}
            <span style={{ fontSize: 18, color: "var(--muted)" }}> / 5</span>
          </div>
          <div className="sub">последнее обновление · {cabinet.documents[0] ? formatDate(cabinet.documents[0].uploadedAt) : "ещё нет файлов"}</div>
          <div className="progress">
            <div className="bar em">
              <i style={{ width: `${(readiness.docsCount / 5) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="tile">
          <div className="lbl">
            <span>Оплата</span>
            <span className="tag warning">Остаток {formatKzt(remainingAmount)}</span>
          </div>
          <div className="v">{formatKzt(payment.paidAmount)}</div>
          <div className="sub">
            из {formatKzt(payment.totalAmount)} · {payment.paymentMethod}
          </div>
          <div className="progress">
            <div className="bar gold">
              <i style={{ width: `${paymentPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="tile">
          <div className="lbl">
            <span>Моя группа</span>
            <span className="tag success">место подтверждено</span>
          </div>
          <div className="v">{group.name}</div>
          <div className="sub">вылет {formatDate(group.flightDate)} · {group.departureCity}</div>
          <div className="progress">
            <div className="bar">
              <i style={{ width: "100%" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="dash-two">
        <div className="card group-info">
          <h5 className="eyebrow" style={{ marginBottom: 6 }}>
            Моя группа
          </h5>
          <div style={{ fontFamily: "var(--f-serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-.3px" }}>
            {group.name} · {operatorProfile?.operator.companyName ?? "оператор подтверждён"}
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--f-serif)", fontStyle: "italic" }}>
            {group.departureCity} → Джидда · {Math.max(getDaysUntilFlight(group.returnDate) - daysUntilFlight, 0) || 21} дней
          </div>

          <div className="row2">
            <div className="kv sm">
              <div className="k">Рейс туда</div>
              <div className="v">{formatDate(group.flightDate)} · Saudia</div>
            </div>
            <div className="kv sm">
              <div className="k">Рейс обратно</div>
              <div className="v">{formatDate(group.returnDate)} · Saudia</div>
            </div>
            <div className="kv sm">
              <div className="k">Отель Мекка</div>
              <div className="v">{group.hotelMecca}</div>
            </div>
            <div className="kv sm">
              <div className="k">Отель Медина</div>
              <div className="v">{group.hotelMedina}</div>
            </div>
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", gap: 14, alignItems: "center" }}>
            <div className="avatar" style={{ background: "var(--emerald)" }}>
              НӘ
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{group.guideName || "Куратор группы"} · гид KZ/RU</div>
              <div style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--f-serif)", fontStyle: "italic" }}>{group.guidePhone}</div>
            </div>
            <Link className="btn btn-ghost btn-sm" href="/cabinet/chat">
              <DesignIcon name="wa" size={12} />
              Написать
            </Link>
          </div>
        </div>

        <div>
          <h5 className="eyebrow" style={{ marginBottom: 12 }}>
            Напоминания
          </h5>
          <div className="reminders">
            {notifications.slice(0, 3).map((notification) => (
              <div
                key={notification.id}
                className={
                  notification.status === "failed" ? "rem danger" : notification.status === "queued" ? "rem warn" : "rem ok"
                }
              >
                <div className="t">{notification.type === "reminder_docs" ? "Нужны документы" : notification.type === "reminder_payment" ? "Нужна оплата" : "Напоминание по вылету"}</div>
                <div className="d">{notification.message}</div>
                <div className="when">{formatDate(notification.sentAt ?? notification.scheduledAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="actions-2">
        <div className="action-card">
          <div>
            <div className="t">
              Загрузить <em>документы</em>
            </div>
            <div className="d">Файлы сразу уйдут в Supabase Storage и обновят readiness без перезагрузки.</div>
          </div>
          <Link className="btn btn-dark btn-sm" href="/cabinet/documents">
            Загрузить <span className="arr">›</span>
          </Link>
        </div>

        <div className="action-card">
          <div>
            <div className="t">
              Закрыть <em>остаток</em>
            </div>
            <div className="d">После статуса paid система сгенерирует PDF договора и публичный QR-код.</div>
          </div>
          <Link className="btn btn-dark btn-sm" href="/cabinet/payment">
            Оплатить <span className="arr">›</span>
          </Link>
        </div>
      </div>
    </>
  );
}
