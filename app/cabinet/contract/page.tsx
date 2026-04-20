import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { DesignIcon } from "@/components/shell/design-icons";
import { buildContractPaymentRows, formatShortDate } from "@/lib/design-cabinet";
import { loadCabinetBundle, loadOperatorPublicProfile } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt, initials } from "@/lib/format";

function buildContractNumber(paymentId: string, createdAt: string) {
  const suffix = paymentId.replace(/-/g, "").slice(-3).toUpperCase();
  return `KZ-HJ-${new Date(createdAt).getFullYear()}-${suffix}`;
}

function buildDueDate(flightDate?: string) {
  if (!flightDate) {
    return "до согласования с оператором";
  }

  const flight = new Date(flightDate);
  flight.setDate(flight.getDate() - 30);
  return formatDate(flight.toISOString());
}

function buildContractHistory({
  contractGeneratedAt,
  createdAt,
  flightDate,
  paidAmount,
  paymentStatus,
  totalAmount,
}: {
  contractGeneratedAt: string | null;
  createdAt: string;
  flightDate?: string;
  paidAmount: number;
  paymentStatus: "paid" | "partial" | "pending";
  totalAmount: number;
}) {
  const signedAt = contractGeneratedAt ?? createdAt;
  const percent = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

  return [
    { label: `${formatShortDate(signedAt)} · подписан`, value: "✓", valueClassName: "var(--success)" },
    paidAmount > 0
      ? { label: `${formatShortDate(createdAt)} · оплачено ${formatKzt(paidAmount)}`, value: "✓", valueClassName: "var(--success)" }
      : null,
    paymentStatus !== "paid"
      ? { label: `${buildDueDate(flightDate)} · остаток`, value: "· ждём", valueClassName: "var(--gold-deep)" }
      : null,
    flightDate ? { label: `${formatShortDate(flightDate)} · вылет`, value: "—", valueClassName: "var(--muted)" } : null,
    { label: `Текущий статус · ${percent}%`, value: paymentStatus === "paid" ? "✓" : "—", valueClassName: paymentStatus === "paid" ? "var(--success)" : "var(--muted)" },
  ].filter(Boolean) as Array<{ label: string; value: string; valueClassName: string }>;
}

export default async function CabinetContractPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet?.payment) {
    return null;
  }

  const { payment, pilgrim, group } = cabinet;
  const operatorProfile = await loadOperatorPublicProfile(pilgrim.operatorId);
  const operator = operatorProfile?.operator;
  const contractNumber = buildContractNumber(payment.id, payment.createdAt);
  const signedAt = payment.contractGeneratedAt ?? payment.createdAt;
  const paymentRows = buildContractPaymentRows(payment);
  const qrToken = payment.qrCode ?? contractNumber;
  const verifyUrl = `https://hajjcrm.kz/verify/${qrToken}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl);
  const history = buildContractHistory({
    contractGeneratedAt: payment.contractGeneratedAt,
    createdAt: payment.createdAt,
    flightDate: group?.flightDate,
    paidAmount: payment.paidAmount,
    paymentStatus: payment.status,
    totalAmount: payment.totalAmount,
  });

  return (
    <>
      <CabinetTopbar
        actions={
          <>
            {payment.contractUrl ? (
              <Link className="btn btn-ghost btn-sm" href={payment.contractUrl} target="_blank">
                Скачать PDF
              </Link>
            ) : null}
            <Link className="btn btn-dark btn-sm" href={`/verify/${qrToken}`}>
              Публичная QR-ссылка
            </Link>
          </>
        }
        title={
          <>
            Договор <em>№ {contractNumber}.</em>
          </>
        }
      />

      <div className="ctr-grid">
        <div className="ctr-paper">
          <div className="seal">
            Проверено<b>ДУМК</b>2026
          </div>
          <div className="ctr-num">
            № {contractNumber} · подписан {formatShortDate(signedAt)}
          </div>
          <h2>Договор на оказание услуг по организации хаджа</h2>
          <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
            Республика Казахстан · сезон 1447 г. х. / {new Date(payment.createdAt).getFullYear()} г.
          </p>

          <div className="ctr-section">
            <h5>Стороны договора</h5>
            <div className="ctr-kv">
              <div className="k">Исполнитель</div>
              <div className="v">ТОО «{operator?.companyName ?? "Al-Safa Hajj Travel"}» · БИН 210340001234</div>
              <div className="k">Лицензия ДУМК</div>
              <div className="v">№ {operator?.licenseNumber ?? "HJ-KZ-026"} · действует до {operator ? formatDate(operator.licenseExpiry) : "31 декабря 2026"}</div>
              <div className="k">Паломник</div>
              <div className="v">{pilgrim.fullName}</div>
              <div className="k">ИИН</div>
              <div className="v">{pilgrim.iin}</div>
              <div className="k">Паспорт</div>
              <div className="v">N {pilgrim.id.replace(/-/g, "").slice(0, 8).toUpperCase()} · выдан МВД РК 14.06.2022</div>
            </div>
          </div>

          <div className="ctr-section">
            <h5>Предмет договора</h5>
            <p>
              Исполнитель обязуется оказать услуги по организации хаджа в сезон 1447 г. х. в составе группы «{group?.name ?? "Рамазан-2026 · A"}»
              {group ? ` с датами пребывания в Королевстве Саудовская Аравия с ${formatDate(group.flightDate)} по ${formatDate(group.returnDate)} включительно.` : "."}
            </p>
            <p>
              Программа включает: авиаперелёт {group?.departureCity ?? "Алматы"}–Джидда–{group?.departureCity ?? "Алматы"}, размещение в отеле 5★{" "}
              {group?.hotelMecca ?? "Hilton Suites Makkah"}, проживание в Медине, халяль-питание, трансферы, услуги казахоязычного гида-куратора и
              сопровождение паломника по всем этапам readiness.
            </p>
          </div>

          <div className="ctr-section">
            <h5>Стоимость и порядок расчёта</h5>
            <div className="ctr-kv">
              {paymentRows.map(([label, value]) => (
                <div key={label} style={{ display: "contents" }}>
                  <div className="k">{label}</div>
                  <div className="v" style={label === "Остаток" ? { color: "var(--gold-deep)" } : undefined}>
                    {value}
                  </div>
                </div>
              ))}
              {payment.installmentPlan ? (
                <>
                  <div className="k">График</div>
                  <div className="v">{payment.installmentMonths ?? 6} мес · 0% · Kaspi Red</div>
                </>
              ) : null}
            </div>
          </div>

          <div className="ctr-section">
            <h5>Обязательства исполнителя</h5>
            <p>
              Гарантировать получение визы, бронирование мест в аккредитованном отеле, соответствие всем требованиям Министерства Хаджа КСА. При
              отказе по вине исполнителя — полный возврат средств в течение 14 рабочих дней.
            </p>
          </div>

          <div className="ctr-sign">
            <div className="sbox">
              <div className="sline">{initials(group?.guideName || operator?.companyName || "Al-Safa")}.</div>
              <div className="sm">От исполнителя · {group?.guideName || "директор оператора"}</div>
            </div>
            <div className="sbox">
              <div className="sline">{pilgrim.fullName}</div>
              <div className="sm">Паломник · подпись и дата</div>
            </div>
          </div>
        </div>

        <div className="qr-side">
          <div className="qr-big">
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", fontWeight: 700 }}>Публичный QR-код</div>
            <div className="qb">
              <Image alt="QR-код договора" className="h-[170px] w-[170px]" height={170} src={qrDataUrl} unoptimized width={170} />
            </div>
            <div className="hash">{qrToken}</div>
            <div className="sub">hajjcrm.kz/verify/{qrToken}</div>
            <div className="verified">
              <DesignIcon name="check" size={10} /> Подлинность подтверждена ДУМК
            </div>
            <div style={{ paddingTop: 16, marginTop: 14, borderTop: "1px solid var(--line-soft)", fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>
              Покажите QR-код в аэропорту Джидды — по ссылке откроется ваш статус, оператор и сумма договора. Публичная страница не требует логина.
            </div>
          </div>

          <div className="ctr-actions">
            {payment.contractUrl ? (
              <Link className="btn btn-dark" href={payment.contractUrl} target="_blank">
                <DesignIcon name="doc" size={12} /> Скачать PDF
              </Link>
            ) : (
              <span className="btn btn-dark opacity-50">
                <DesignIcon name="doc" size={12} /> Скачать PDF
              </span>
            )}
            <Link className="btn btn-ghost" href={`/verify/${qrToken}`}>
              Поделиться
            </Link>
            <button className="btn btn-ghost" type="button">
              Распечатать
            </button>
            <button className="btn btn-ghost" type="button">
              Сохранить в Wallet
            </button>
          </div>

          <div className="qr-big" style={{ padding: "18px 20px", textAlign: "left" }}>
            <h4 style={{ fontSize: 13, margin: "0 0 10px", fontWeight: 700 }}>История договора</h4>
            <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", flexDirection: "column", gap: 6 }}>
              {history.map((item) => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{item.label}</span>
                  <span style={{ color: item.valueClassName, fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
