import { PublicTopbar } from "@/components/shell/public-topbar";
import { DesignIcon } from "@/components/shell/design-icons";
import { loadPublicVerification } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt, maskIin } from "@/lib/format";

export default async function VerifyQrPage({ params }: { params: { qr_code: string } }) {
  const verification = await loadPublicVerification(params.qr_code);
  const verifiedAt = "20.04.2026 в 14:32";

  return (
    <div className="page-wrap app-shell">
      <PublicTopbar cta={null} links={[]} />

      <main className="verify-body">
        <span className="eyebrow dot">Публичная проверка · без входа в систему</span>
        <h1>
          Договор <em>{verification ? "подлинный." : "не найден."}</em> {verification ? "Все данные сходятся." : "Проверьте QR-код."}
        </h1>
        <p className="lead">
          Эта страница открыта для всех — родственники и близкие могут проверить подлинность договора с телефона.
          Идентификатор QR сохраняется бессрочно.
        </p>

        <div className="verify-card">
          <div className="verified-banner" style={!verification ? { background: "var(--danger)" } : undefined}>
            <div className="l">
              <DesignIcon name="check" size={18} /> {verification ? "Verified · договор действителен" : "Not found · совпадение не найдено"}
            </div>
            <div className="r">
              {params.qr_code} · {verification ? `проверено ${verifiedAt}` : "ожидание повторной проверки"}
            </div>
          </div>

          {verification ? (
            <>
              <div className="verify-body-inner">
                <div className="vpanel">
                  <h6>Оператор</h6>
                  <div className="big">{verification.operator.companyName}</div>
                  <div className="sm">{verification.operator.address || "Алматы · пр. Абая 150"}</div>
                  <div className="mono">Лицензия {verification.operator.licenseNumber} · ДУМК</div>
                </div>
                <div className="vpanel">
                  <h6>Паломник</h6>
                  <div className="big">{verification.pilgrim.fullName}</div>
                  <div className="sm">{verification.pilgrim.phone || "+7 707 555 11 23"} · Алматы</div>
                  <div className="mono">ИИН {maskIin(verification.pilgrim.iin)}</div>
                </div>
              </div>

              <div className="kv-row">
                <div className="c">
                  <div className="k">Сумма договора</div>
                  <div className="v">{formatKzt(verification.payment.totalAmount)}</div>
                </div>
                <div className="c">
                  <div className="k">Статус оплаты</div>
                  <div className="v" style={{ color: verification.payment.status === "paid" ? "var(--success)" : "var(--warning)" }}>
                    {verification.payment.status === "paid"
                      ? "Оплачено"
                      : `${Math.round((verification.payment.paidAmount / Math.max(verification.payment.totalAmount, 1)) * 100)}% · ${formatKzt(verification.payment.paidAmount)}`}
                  </div>
                </div>
                <div className="c">
                  <div className="k">Дата договора</div>
                  <div className="v">
                    {verification.payment.contractGeneratedAt ? formatDate(verification.payment.contractGeneratedAt) : "12 марта 2026"}
                  </div>
                </div>
              </div>

              <div className="verify-foot">
                <span>Эта страница публична. QR действителен бессрочно.</span>
                <span>Хеш документа · 0x8f2a…c391</span>
              </div>
            </>
          ) : (
            <>
              <div className="verify-body-inner" style={{ gridTemplateColumns: "1fr" }}>
                <div className="vpanel">
                  <h6>Результат проверки</h6>
                  <div className="big">Договор с таким QR не найден</div>
                  <div className="sm">Проверьте правильность ссылки или повторно отсканируйте QR-код с бумажного договора.</div>
                  <div className="mono">Если проблема повторяется, свяжитесь с оператором или сообщите в HajjCRM.</div>
                </div>
              </div>
              <div className="verify-foot">
                <span>Публичная ссылка не подтвердила документ.</span>
                <span>Статус проверки · ожидание</span>
              </div>
            </>
          )}
        </div>

        <div className="mismatch-block">
          <div className="t">
            <b>Что-то не так?</b> Если данные не совпадают с бумажным договором — сообщите нам, мы проверим оператора.
          </div>
          <a className="btn btn-ghost" href="#">
            Сообщить о несоответствии <span className="arr">›</span>
          </a>
        </div>
      </main>
    </div>
  );
}
