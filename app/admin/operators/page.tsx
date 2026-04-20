import { OperatorDecisionActions } from "@/components/admin/operator-decision-actions";
import { loadAdminBundle } from "@/lib/data/hajj-loaders";
import {
  adminVerificationDocuments,
  adminVerificationHistory,
  buildAdminVerificationRows,
} from "@/lib/design-admin";

function toneClass(status: "pending" | "verified" | "rejected") {
  if (status === "verified") return "success";
  if (status === "rejected") return "danger";
  return "warning";
}

function statusLabel(status: "pending" | "verified" | "rejected") {
  if (status === "verified") return "approved";
  if (status === "rejected") return "rejected";
  return "pending";
}

export default async function AdminOperatorsPage() {
  const admin = await loadAdminBundle();
  const rows = buildAdminVerificationRows(admin);
  const pendingCount = Math.max(8, rows.filter((row) => row.status === "pending").length);
  const totalCount = Math.max(admin.operators.length, 52);

  return (
    <>
      <div className="adm-top">
        <div>
          <h1>
            Операторы на <em>верификации.</em>
          </h1>
          <p>{pendingCount} заявок ждут решения. Средний срок проверки — 2.4 дня.</p>
        </div>
        <div className="row g12">
          <span className="chip on">
            Требующие действий <span className="c">{pendingCount}</span>
          </span>
          <span className="chip">
            Все <span className="c">{totalCount}</span>
          </span>
          <button className="btn btn-ghost btn-sm" type="button">
            Экспорт
          </button>
        </div>
      </div>

      <div className="adm-body">
        <div>
          <table>
            <thead>
              <tr>
                <th>Компания</th>
                <th>Лицензия</th>
                <th>Город</th>
                <th>Подано</th>
                <th>Статус</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <FragmentRow key={`${row.companyName}-${row.licenseNumber}`} index={index} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        <div className="hist-box">
          <h5>История верификаций</h5>
          {adminVerificationHistory.map((item) => (
            <div className="hist-item" key={`${item.label}-${item.when}`}>
              <div className="n" style={{ color: item.tone }}>
                {item.label}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>{item.detail}</div>
              <div className="w">{item.when}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function FragmentRow({
  index,
  row,
}: {
  index: number;
  row: ReturnType<typeof buildAdminVerificationRows>[number];
}) {
  return (
    <>
      <tr>
        <td style={{ fontWeight: 600 }}>{row.companyName}</td>
        <td className="num">{row.licenseNumber}</td>
        <td>{row.city}</td>
        <td>{row.submittedAt}</td>
        <td>
          <span className={`tag ${toneClass(row.status)}`}>{statusLabel(row.status)}</span>
        </td>
        <td style={{ textAlign: "right" }}>
          <a href="#top" style={{ color: "var(--ink)", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
            Открыть ›
          </a>
        </td>
      </tr>
      {index === 0 ? (
        <tr className="expand">
          <td colSpan={6}>
            <div className="adm-expand">
              <div>
                <h5 style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: 1.8, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Документы лицензии
                </h5>
                {adminVerificationDocuments.map((document) => (
                  <div className="pdf-preview" key={document.title} style={{ marginBottom: document.title === adminVerificationDocuments.at(-1)?.title ? 0 : 8 }}>
                    <div className="pdficon">PDF</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{document.title}</div>
                      <div style={{ color: "var(--muted)", fontFamily: "var(--f-serif)", fontSize: 11, fontStyle: "italic" }}>{document.meta}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h5 style={{ color: "var(--muted)", fontSize: 11, fontWeight: 700, letterSpacing: 1.8, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Решение
                </h5>
                <div className="field">
                  <label>Комментарий</label>
                  <textarea placeholder="Причина отказа или комментарий к одобрению…" rows={3} style={{ fontFamily: "inherit", fontSize: 13 }} />
                </div>
                <div className="row g12" style={{ marginTop: 14 }}>
                  <OperatorDecisionActions operatorId={row.id} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}
    </>
  );
}
