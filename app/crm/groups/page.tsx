import Link from "next/link";

import { GroupFlightBroadcastButton } from "@/components/crm/group-flight-broadcast-button";
import { GroupCreateForm } from "@/components/crm/group-create-form";
import { CrmTopbar } from "@/components/crm/crm-topbar";
import { type CrmBundleLike, buildGroupMembers } from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt, initials } from "@/lib/format";

export default async function CrmGroupsPage() {
  const crm = await loadCrmBundle();

  if (!crm || !crm.operator) {
    return null;
  }

  const crmBundle = crm as CrmBundleLike;

  return (
    <>
      <CrmTopbar
        title={
          <>
            Группы · <em>Рамазан сезон.</em>
          </>
        }
        actions={<Link className="btn btn-dark btn-sm" href="#group-create">+ Новая группа</Link>}
      />

      <div className="groups-grid">
        {crm.groups.map((group, index) => {
          const members = buildGroupMembers(crmBundle, group.id);
          const quotaPercent = Math.round((group.quotaFilled / Math.max(group.quotaTotal, 1)) * 100);

          return (
            <div key={group.id} className="group-card">
              <div className="gh">
                <div>
                  <h4>{group.name}</h4>
                  <div className="route">
                    {group.departureCity} → {group.hotelMecca || "Джидда"} · вылет {formatDate(group.flightDate)}
                  </div>
                </div>
                <span className={`tag ${group.status === "full" ? "warning" : "success"}`}>{group.status}</span>
              </div>

              <div className="gbody">
                <div className="quota-wrap">
                  <div className="qn">
                    <span>Квота</span>
                    <span>
                      {group.quotaFilled} / {group.quotaTotal}
                    </span>
                  </div>
                  <div className="bar em">
                    <i style={{ width: `${quotaPercent}%` }} />
                  </div>
                  <div className="route" style={{ marginTop: 10 }}>
                    Прайс от {formatKzt(group.priceFrom)}
                  </div>
                </div>

                <div>
                  <div className="route" style={{ marginBottom: 10 }}>
                    Состав группы
                  </div>
                  <div className="stack">
                    {members.slice(0, 4).map((member, memberIndex) => (
                      <div
                        key={member.pilgrim.id}
                        className="avatar"
                        style={{
                          background:
                            memberIndex % 3 === 0 ? "var(--emerald)" : memberIndex % 3 === 1 ? "var(--gold-deep)" : "var(--ink)",
                        }}
                      >
                        {initials(member.pilgrim.fullName)}
                      </div>
                    ))}
                    {members.length > 4 ? <div className="more">+{members.length - 4}</div> : null}
                  </div>
                </div>
              </div>

              <div className="gfoot">
                <div>
                  <div className="k">Гид</div>
                  <div className="v">{group.guideName || "Назначить"}</div>
                </div>
                <div>
                  <div className="k">Контакт</div>
                  <div className="v">{group.guidePhone || "—"}</div>
                </div>
              </div>

              <div style={{ padding: "0 24px 22px" }}>
                <div className="vac-list" style={{ marginBottom: 14 }}>
                  {members.length ? (
                    members.slice(0, 4).map((member) => (
                      <div key={member.pilgrim.id} className={`vac ${member.readiness.isReady ? "done" : "todo"}`}>
                        <div className="vi">{member.readiness.isReady ? "✓" : "○"}</div>
                        <div className="vb">
                          <div className="vn">{member.pilgrim.fullName}</div>
                          <div className="vs">
                            {member.readiness.readinessPercent}% · {member.payment ? formatKzt(member.payment.paidAmount) : "без платежа"}
                          </div>
                        </div>
                        <span className={`tag ${member.readiness.isReady ? "success" : "warning"}`}>
                          {member.readiness.readinessPercent}%
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="vac todo">
                      <div className="vi">○</div>
                      <div className="vb">
                        <div className="vn">В группе пока нет паломников</div>
                        <div className="vs">Назначение делается со страницы паломников</div>
                      </div>
                      <span className="tag">пусто</span>
                    </div>
                  )}
                </div>

                <div className="row g12">
                  <Link className="btn btn-ghost btn-sm" href={`/print/groups/${group.id}`}>
                    Печать списка
                  </Link>
                  <GroupFlightBroadcastButton groupId={group.id} isDisabled={!members.length} />
                </div>
              </div>
            </div>
          );
        })}

        <div className="group-card" id="group-create">
          <div className="gh">
            <div>
              <h4>Новая группа</h4>
              <div className="route">Рейс, квота, отели, гид и город вылета</div>
            </div>
          </div>
          <div className="gbody" style={{ display: "block" }}>
            <GroupCreateForm />
          </div>
        </div>
      </div>
    </>
  );
}
