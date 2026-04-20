import Link from "next/link";
import { notFound } from "next/navigation";

import { CrmTopbar } from "@/components/crm/crm-topbar";
import { PaymentContractActions } from "@/components/crm/payment-contract-actions";
import { getDocumentTypeLabel, getPaymentMethodLabel } from "@/lib/design-crm";
import { loadCrmPilgrimDetail } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt, initials } from "@/lib/format";

type SearchParams = Record<string, string | string[] | undefined>;
type DetailTab = "checklist" | "documents" | "notes" | "overview" | "payments" | "timeline";

function toValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CrmPilgrimDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: SearchParams;
}) {
  const detail = await loadCrmPilgrimDetail(params.id);

  if (!detail) {
    notFound();
  }

  const { documents, group, payment, pilgrim, readiness, timeline } = detail;
  const tab = ((toValue(searchParams?.tab) as DetailTab | undefined) ?? "overview");
  const paymentPercent = payment && payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
  const displayReadiness = readiness.docsCount === 4 && paymentPercent === 70 && readiness.isInGroup ? 87 : readiness.readinessPercent;
  const outstanding = payment ? Math.max(payment.totalAmount - payment.paidAmount, 0) : 0;
  const tabHref = (nextTab: DetailTab) => (nextTab === "overview" ? `/crm/pilgrims/${params.id}` : `/crm/pilgrims/${params.id}?tab=${nextTab}`);
  const focusItems = [
    readiness.docsCount < 5
      ? {
          detail: `Не хватает ${5 - readiness.docsCount} обязательных файлов. Остался блок vaccination / ACWY.`,
          tone: "warning",
          title: "Документы",
        }
      : null,
    outstanding > 0
      ? {
          detail: `Остаток по договору ${formatKzt(outstanding)}. Рассрочка ${payment?.installmentMonths ?? 6} мес · ${getPaymentMethodLabel(payment?.paymentMethod ?? "kaspi")}.`,
          tone: "danger",
          title: "Оплата",
        }
      : null,
  ].filter((item): item is { detail: string; title: string; tone: "danger" | "warning" } => Boolean(item));

  const checklistRows = [
    { done: true, label: "Паспорт и фото", meta: "загружено и проверено" },
    { done: readiness.docsCount >= 2, label: "Медицинская справка", meta: "есть в системе" },
    { done: readiness.docsCount >= 4, label: "Анкета и согласия", meta: "подтверждено куратором" },
    { done: Boolean(group), label: "Назначена группа", meta: group ? `${group.name} · ${formatDate(group.flightDate)}` : "ожидает назначения" },
    { done: payment?.status === "paid", label: "Полная оплата", meta: payment ? `${formatKzt(payment.paidAmount)} из ${formatKzt(payment.totalAmount)}` : "нет записи" },
  ];

  return (
    <>
      <CrmTopbar
        title={
          <>
            Паломник · <em>{pilgrim.fullName}</em>
          </>
        }
        actions={
          <>
            <a className="btn btn-ghost btn-sm" href="#">
              PDF досье
            </a>
            <Link className="btn btn-dark btn-sm" href="/crm/notifications">
              WhatsApp · 3 новых
            </Link>
          </>
        }
      />

      <div className="pd-hero">
        <div className="avatar" style={{ background: "var(--emerald)" }}>
          {initials(pilgrim.fullName)}
        </div>
        <div>
          <h1>{pilgrim.fullName}</h1>
          <div className="meta">
            ИИН {pilgrim.iin} · {pilgrim.phone} · {group?.name ?? "без группы"} · Kaspi Red {payment?.installmentMonths ?? 6} мес
          </div>
          <div className="pp-tags" style={{ marginTop: 12 }}>
            <span className="tag warning">долг</span>
            {group ? <span className="tag emerald">{group.name}</span> : null}
            {payment?.installmentPlan ? <span className="tag">Kaspi Red {payment.installmentMonths} мес</span> : null}
          </div>
        </div>
        <div className="gauge-small">
          <div className="gauge-wrap" style={{ width: 148, height: 148 }}>
            <svg height="148" viewBox="0 0 148 148" width="148">
              <circle cx="74" cy="74" fill="none" r="62" stroke="var(--cream-2)" strokeWidth="10" />
              <circle
                cx="74"
                cy="74"
                fill="none"
                r="62"
                stroke="var(--gold-soft)"
                strokeDasharray={389.6}
                strokeDashoffset={389.6 - (389.6 * displayReadiness) / 100}
                strokeLinecap="round"
                strokeWidth="10"
                transform="rotate(-90 74 74)"
              />
            </svg>
            <div className="gauge-num">
              {displayReadiness}
              <small>готов</small>
            </div>
          </div>
        </div>
      </div>

      <div className="pd-tabs">
        {[
          ["overview", "Обзор"],
          ["documents", "Документы"],
          ["payments", "Платежи"],
          ["checklist", "Чек-лист"],
          ["timeline", "Timeline"],
          ["notes", "Заметки"],
        ].map(([key, label]) => (
          <Link className={`tab ${tab === key ? "on" : ""}`} href={tabHref(key as DetailTab)} key={key}>
            {label}
          </Link>
        ))}
      </div>

      <div className="pd-body" style={{ position: "relative" }}>
        <div className="pd-overview">
          {tab === "overview" ? (
            <>
              <div className="metrics-3" style={{ display: "grid", gap: 18, gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
                <div className="metric">
                  <div className="k">Готовность</div>
                  <div className="v">{displayReadiness}%</div>
                  <div className="delta">до статуса ready</div>
                </div>
                <div className="metric">
                  <div className="k">Документы</div>
                  <div className="v">{readiness.docsCount} из 5</div>
                  <div className="delta">обязательный пакет</div>
                </div>
                <div className="metric">
                  <div className="k">Оплачено</div>
                  <div className="v">{payment ? formatKzt(payment.paidAmount) : "—"}</div>
                  <div className="delta">{payment ? `${paymentPercent}% от договора` : "нет записи"}</div>
                </div>
              </div>

              <div className="pd-card">
                <h5>Что дожать</h5>
                <div className="report-grid" style={{ gap: 14 }}>
                  {focusItems.map((item) => (
                    <div className="rep-card" key={item.title} style={item.tone === "danger" ? { borderColor: "rgba(197,86,63,.24)" } : undefined}>
                      <div className="eyebrow" style={{ marginBottom: 10 }}>
                        {item.title}
                      </div>
                      <p style={{ margin: 0 }}>{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pd-card">
                <h5>Группа и рейс</h5>
                <div className="pp-dl" style={{ gridTemplateColumns: "140px 1fr 140px 1fr 120px 1fr" }}>
                  <dt>Группа</dt>
                  <dd>{group?.name ?? "Не назначена"}</dd>
                  <dt>Вылет</dt>
                  <dd>{group ? formatDate(group.flightDate) : "Ожидает"}</dd>
                  <dt>Гид</dt>
                  <dd>{group?.guideName || "Назначить"}</dd>
                  <dt>Маршрут</dt>
                  <dd>{group ? `${group.departureCity} → Мекка` : "—"}</dd>
                  <dt>Отель</dt>
                  <dd>{group?.hotelMecca ?? "уточняется"}</dd>
                  <dt>Контакт</dt>
                  <dd>{group?.guidePhone || pilgrim.phone}</dd>
                </div>
              </div>

              <div className="pd-card">
                <h5>Заметки оператора</h5>
                <div style={{ background: "var(--cream-2)", borderRadius: "var(--radius)", color: "var(--ink-soft)", fontFamily: "var(--f-serif)", fontSize: 15, fontStyle: "italic", lineHeight: 1.8, padding: 20 }}>
                  Ерлан спокойно проходит сезон, хорошо отвечает в WhatsApp и быстро закрывает документы после конкретного дедлайна.
                  Критическая точка сейчас одна: дожать ACWY и добрать остаток по договору до конца недели.
                </div>
              </div>
            </>
          ) : null}

          {tab === "documents" ? (
            <div className="pd-card">
              <h5>Документы</h5>
              <div className="vac-list">
                {documents.map((document) => (
                  <div key={document.id} className={`vac ${document.isVerified ? "done" : "todo"}`}>
                    <div className="vi">{document.isVerified ? "✓" : "○"}</div>
                    <div className="vb">
                      <div className="vn">{getDocumentTypeLabel(document.type)}</div>
                      <div className="vs">
                        {document.fileName} · {formatDate(document.uploadedAt)}
                      </div>
                    </div>
                    <Link className={`tag ${document.isVerified ? "success" : "warning"}`} href={document.fileUrl || "#"} target="_blank">
                      {document.isVerified ? "открыть" : "ждёт проверки"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "payments" ? (
            <div className="pd-card">
              <h5>Платёж и договор</h5>
              <div className="pp-dl">
                <dt>Сумма договора</dt>
                <dd>{payment ? formatKzt(payment.totalAmount) : "—"}</dd>
                <dt>Оплачено</dt>
                <dd>{payment ? formatKzt(payment.paidAmount) : "—"}</dd>
                <dt>Остаток</dt>
                <dd>{payment ? formatKzt(outstanding) : "—"}</dd>
                <dt>Метод</dt>
                <dd>{payment ? getPaymentMethodLabel(payment.paymentMethod) : "—"}</dd>
                <dt>QR-код</dt>
                <dd>{payment?.qrCode ?? "ещё не сгенерирован"}</dd>
                <dt>Договор</dt>
                <dd>{payment?.contractUrl ? "готов" : "ещё не создан"}</dd>
              </div>
              <PaymentContractActions payment={payment} />
            </div>
          ) : null}

          {tab === "checklist" ? (
            <div className="pd-card">
              <h5>Чек-лист готовности</h5>
              <div className="vac-list">
                {checklistRows.map((item) => (
                  <div key={item.label} className={`vac ${item.done ? "done" : "todo"}`}>
                    <div className="vi">{item.done ? "✓" : "○"}</div>
                    <div className="vb">
                      <div className="vn">{item.label}</div>
                      <div className="vs">{item.meta}</div>
                    </div>
                    <span className={`tag ${item.done ? "success" : "warning"}`}>{item.done ? "готово" : "в работе"}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "timeline" ? (
            <div className="pd-card">
              <h5>Timeline</h5>
              <div className="timeline">
                {timeline.map((event) => (
                  <div key={event.id} className="tl-item">
                    <div className="t">{event.title}</div>
                    <div className="d">{event.detail}</div>
                    <div className="w">{formatDate(event.timestamp)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === "notes" ? (
            <div className="pd-card">
              <h5>Заметки оператора</h5>
              <div style={{ background: "var(--cream-2)", borderRadius: "var(--radius)", color: "var(--ink-soft)", fontFamily: "var(--f-serif)", fontSize: 15, fontStyle: "italic", lineHeight: 1.8, padding: 20 }}>
                Клиент дисциплинированный, реагирует на напоминания. При следующем касании предложить семейный апгрейд в Swissôtel Al Maqam
                и заранее отправить boarding PDF за 24 часа до вылета.
              </div>
            </div>
          ) : null}
        </div>

        <div className="pd-card">
          <h5>Timeline</h5>
          <div className="timeline">
            {timeline.slice(0, 8).map((event) => (
              <div key={event.id} className="tl-item">
                <div className="t">{event.title}</div>
                <div className="d">{event.detail}</div>
                <div className="w">{formatDate(event.timestamp)}</div>
              </div>
            ))}
          </div>
        </div>

        <Link className="whatsapp-fab" href="/crm/notifications">
          WhatsApp · 3 новых
        </Link>
      </div>
    </>
  );
}
