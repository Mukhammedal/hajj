import Link from "next/link";

import { CabinetTopbar } from "@/components/cabinet/cabinet-topbar";
import { DesignIcon } from "@/components/shell/design-icons";
import { buildGroupMembers, getDaysUntilFlight, groupDocuments, groupSeats, groupTimeline } from "@/lib/design-cabinet";
import { loadCabinetBundle, loadOperatorPublicProfile } from "@/lib/data/hajj-loaders";
import { formatDate, initials } from "@/lib/format";

export default async function CabinetGroupPage() {
  const cabinet = await loadCabinetBundle();

  if (!cabinet?.group) {
    return null;
  }

  const { group, pilgrim } = cabinet;
  const operatorProfile = await loadOperatorPublicProfile(pilgrim.operatorId);
  const members = buildGroupMembers(pilgrim);
  const averageReadiness = Math.round(
    members.filter((member) => typeof member.readiness === "number").reduce((sum, member) => sum + (member.readiness ?? 0), 0) /
      members.filter((member) => typeof member.readiness === "number").length,
  );

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
              Написать куратору
            </Link>
          </>
        }
        title={
          <>
            Моя <em>группа.</em>
          </>
        }
      />

      <p className="sub-s" style={{ padding: "24px 40px 0" }}>
        Ваша партия — <b>{group.name}</b>. Вылет {formatDate(group.flightDate)}, {group.departureCity}, места 14B–14C.
      </p>

      <div className="grp-split">
        <div>
          <div className="grp-card">
            <div className="grp-head">
              <div className="logo-b">{group.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <h2>{group.name}</h2>
                <div className="meta">
                  {operatorProfile?.operator.companyName ?? "оператор"} · {group.quotaFilled} паломников · {group.hotelMecca}
                </div>
              </div>
              <span className="tag emerald" style={{ marginLeft: "auto" }}>
                ● {group.status === "full" ? "Собрана" : "Формируется"}
              </span>
            </div>

            <div className="grp-people">
              {members.map((member) => (
                <div key={member.name} className="gp-row">
                  <div className={`av${member.tone === "emerald" ? " e" : member.tone === "gold" ? " g" : ""}`}>{member.initials}</div>
                  <div>
                    <div className="nm">
                      {member.name} {member.isSelf ? <span style={{ color: "var(--emerald)", fontSize: 10 }}>(вы)</span> : null}
                    </div>
                    <div className="rl">{member.cityMeta}</div>
                  </div>
                  {member.readiness === null ? <span className="rdy">—</span> : <span className={`rdy${member.tone === "warning" ? " w" : ""}`}>{member.readiness}%</span>}
                </div>
              ))}
              <div className="gp-row" style={{ gridColumn: "1 / -1", justifyContent: "center", background: "transparent" }}>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>и ещё {Math.max(group.quotaFilled - members.length, 0)} паломников…</span>
              </div>
            </div>
          </div>

          <div className="grp-card">
            <h4>Программа группы · {Math.max(getDaysUntilFlight(group.returnDate) - getDaysUntilFlight(group.flightDate), 0) || 14} дней</h4>
            <div className="gp-tl">
              {groupTimeline.map((step) => (
                <div key={`${step.dateLabel}-${step.title}`} className={`gt-item${step.status === "done" ? " done" : step.status === "now" ? " now" : ""}`}>
                  <div className="gt-d">{step.dateLabel}</div>
                  <div className="gt-t">{step.title}</div>
                  <div className="gt-m">{step.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grp-card">
            <h4>Места в самолёте · Saudia</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, maxWidth: 420 }}>
              <div style={{ gridColumn: "1 / -1", fontSize: 10, color: "var(--muted)", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 700, marginBottom: 6 }}>
                Ряд 14 · Economy
              </div>
              {groupSeats.map((seat) => (
                <div
                  key={seat}
                  style={{
                    padding: 8,
                    background: seat.includes("Вы") || seat.includes("семья") ? "var(--emerald)" : "var(--cream-2)",
                    color: seat.includes("Вы") || seat.includes("семья") ? "var(--cream)" : "var(--ink)",
                    borderRadius: 3,
                    textAlign: "center",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {seat}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside>
          <div className="grp-card gp-curator">
            <div className="av-lg">{initials(group.guideName || "Бауыржан Темирханов")}</div>
            <div className="nm">{group.guideName || "Бауыржан Темирханов"}</div>
            <div className="rl">Куратор группы · {operatorProfile?.operator.companyName ?? "оператор"}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.5, padding: "0 10px" }}>
              12 лет в индустрии · 4 хаджа как гид · говорит на казахском, русском, арабском
            </div>
            <div className="contact">
              <Link className="btn btn-dark btn-sm" href="/cabinet/chat">
                <DesignIcon name="wa" size={10} />
                Написать
              </Link>
              <a className="btn btn-ghost btn-sm" href={`tel:${group.guidePhone}`}>
                {group.guidePhone}
              </a>
            </div>
          </div>

          <div className="grp-card">
            <h4>Важные документы группы</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {groupDocuments.map((document) => (
                <a
                  key={document}
                  href="#"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: 10,
                    background: "var(--cream-2)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 12,
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                >
                  <DesignIcon name="doc" size={14} style={{ color: "var(--emerald)" }} />
                  <span>{document}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="grp-card">
            <h4>Готовность группы</h4>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <div style={{ fontFamily: "var(--f-display)", fontWeight: 700, fontSize: 36, letterSpacing: "-.03em" }}>{averageReadiness}</div>
              <div style={{ color: "var(--muted)", fontSize: 13 }}>% средняя</div>
            </div>
            <div style={{ height: 6, background: "var(--cream-2)", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
              <div style={{ height: "100%", width: `${averageReadiness}%`, background: "var(--emerald)" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)" }}>
              <span>Готовы ≥90%</span>
              <b style={{ color: "var(--success)" }}>{members.filter((member) => (member.readiness ?? 0) >= 90).length} из {members.length}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              <span>Оплата полная</span>
              <b style={{ color: "var(--ink)" }}>{Math.max(group.quotaFilled - 5, 0)} из {group.quotaFilled}</b>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
              <span>Документы собраны</span>
              <b style={{ color: "var(--ink)" }}>{Math.max(group.quotaFilled - 2, 0)} из {group.quotaFilled}</b>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
