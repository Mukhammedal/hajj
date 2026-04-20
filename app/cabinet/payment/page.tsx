import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { buildInstallmentSchedule } from "@/lib/contracts";
import { formatShortDate, mapPaymentMethodLabel } from "@/lib/design-cabinet";
import { loadCabinetBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

export default async function CabinetPaymentPage() {
  const cabinet = await loadCabinetBundle();
  const payment = cabinet?.payment;

  if (!payment) {
    return null;
  }

  const installmentPlan = buildInstallmentSchedule(payment);
  const remainingAmount = Math.max(payment.totalAmount - payment.paidAmount, 0);
  const paymentPercent = payment.totalAmount > 0 ? Math.round((payment.paidAmount / payment.totalAmount) * 100) : 0;
  const qrDataUrl = payment.qrCode ? await QRCode.toDataURL(payment.qrCode) : null;

  return (
    <>
      <CabinetTopbar
        actions={
          <>
            {payment.contractUrl ? (
              <Link className="btn btn-ghost btn-sm" href={payment.contractUrl} target="_blank">
                Договор PDF
              </Link>
            ) : null}
            <Link className="btn btn-dark btn-sm" href="/cabinet/contract">
              Закрыть остаток
            </Link>
          </>
        }
        title={
          <>
            Оплата — остаток <em>{formatKzt(remainingAmount)}.</em>
          </>
        }
      />

      <div className="pay-summary">
        <div>
          <div className="k">Сумма договора</div>
          <div className="v">{formatKzt(payment.totalAmount)}</div>
        </div>
        <div>
          <div className="k">Оплачено</div>
          <div className="v" style={{ color: "var(--success)" }}>
            {formatKzt(payment.paidAmount)}
          </div>
        </div>
        <div>
          <div className="k">Остаток</div>
          <div className="v" style={{ color: "var(--warning)" }}>
            {formatKzt(remainingAmount)}
          </div>
        </div>
        <div className="prog">
          <div className="k">Прогресс · {paymentPercent}%</div>
          <div className="bar gold">
            <i style={{ width: `${paymentPercent}%` }} />
          </div>
          <div className="meta">
            {installmentPlan.length} транзакции · последняя {formatShortDate(payment.createdAt)} · {mapPaymentMethodLabel(payment.paymentMethod)}
          </div>
        </div>
      </div>

      <div className="method-tabs">
        {[
          { active: payment.paymentMethod === "kaspi", label: "Kaspi" },
          { active: payment.paymentMethod === "halyk", label: "Halyk" },
          { active: payment.paymentMethod === "kaspi", label: "Kaspi QR" },
          { active: payment.paymentMethod === "cash", label: "Наличные" },
        ].map((item) => (
          <div key={item.label} className={item.active ? "tab on" : "tab"}>
            {item.label}
          </div>
        ))}
      </div>

      <div className="pay-main">
        <div className="installments">
          <h4>
            Рассрочка <em>Kaspi Red</em>
          </h4>
          <div className="s">0% на выбранный срок. Платёж фиксируется в истории и отражается в readiness.</div>
          <div className="inst-grid">
            {[3, 6, 12, 18].map((months) => {
              const monthly = remainingAmount > 0 ? Math.round(remainingAmount / months) : 0;
              return (
                <div key={months} className={months === (payment.installmentMonths ?? 6) ? "inst on" : "inst"}>
                  <div className="n">{months}</div>
                  <div className="u">мес</div>
                  <div className="per">{formatKzt(monthly)}/мес</div>
                </div>
              );
            })}
          </div>

          <div className="calc-out">
            <div>
              <div className="eyebrow">{payment.installmentMonths ?? 6} месяцев · 0%</div>
              <div className="pl" style={{ marginTop: 4 }}>
                {formatKzt(Math.round(remainingAmount / Math.max(payment.installmentMonths ?? 6, 1)))}
                <span style={{ color: "var(--muted)", fontFamily: "var(--f-serif)", fontStyle: "italic", fontSize: 14 }}> / мес</span>
              </div>
            </div>
            <Link className="btn btn-dark" href="/cabinet/contract">
              Оформить <span className="arr">›</span>
            </Link>
          </div>

          <div style={{ marginTop: 28 }}>
            <h5 className="eyebrow" style={{ marginBottom: 14 }}>
              История транзакций
            </h5>
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th>Метод</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {installmentPlan.map((entry, index) => (
                  <tr key={`${entry.label}-${index}`}>
                    <td>{typeof entry.label === "string" ? entry.label : formatShortDate(entry.label.toISOString())}</td>
                    <td className="am">{formatKzt(entry.amount)}</td>
                    <td>
                      <span className="method-pill">
                        <span className="m">{mapPaymentMethodLabel(payment.paymentMethod).slice(0, 1)}</span>
                        {mapPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                    </td>
                    <td>
                      <span className={entry.status === "paid" ? "tag success" : entry.status === "partial" ? "tag warning" : "tag"}>
                        {entry.status === "paid" ? "✓ Оплачен" : entry.status === "partial" ? "Частично" : "Ожидает"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="pay-side">
          <div className="card p-6">
            <h5>Публичная QR-ссылка договора</h5>
            <div className="qr-link">
              <div className="qr">
                {qrDataUrl ? <Image alt="QR" className="h-[68px] w-[68px]" height={68} src={qrDataUrl} unoptimized width={68} /> : null}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontFamily: "var(--f-serif)", fontStyle: "italic", color: "var(--muted)", marginBottom: 6 }}>
                  hajjcrm.kz/verify/
                </div>
                <div className="link-box">{payment.qrCode ?? "QR будет создан после полной оплаты"}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  {payment.qrCode ? (
                    <Link className="btn btn-ghost btn-sm" href={`/verify/${payment.qrCode}`}>
                      Открыть
                    </Link>
                  ) : null}
                  <Link className="btn btn-ghost btn-sm" href="/cabinet/contract">
                    Поделиться
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h5>Договор PDF</h5>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div className="pdf-preview" style={{ flex: 1, border: 0, background: "transparent", padding: 0 }}>
                <div className="pdficon">PDF</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Договор №{payment.id.slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic", fontFamily: "var(--f-serif)" }}>
                    4 стр · {payment.contractGeneratedAt ? formatShortDate(payment.contractGeneratedAt) : "ожидает генерации"}
                  </div>
                </div>
              </div>
              {payment.contractUrl ? (
                <Link className="btn btn-dark btn-sm" href={payment.contractUrl} target="_blank">
                  Скачать
                </Link>
              ) : (
                <span className="btn btn-dark btn-sm opacity-50">Скачать</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
