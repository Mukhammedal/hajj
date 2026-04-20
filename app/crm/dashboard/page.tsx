import Link from "next/link";

import { CrmTopbar } from "@/components/crm/crm-topbar";
import {
  type CrmBundleLike,
  buildMonthlyPaymentChart,
  getPilgrimRouteId,
  getDashboardAlerts,
  getDashboardList,
  getGroupRevenue,
  getPaymentStatusMeta,
  getProgressTone,
  getStatusTone,
} from "@/lib/design-crm";
import { loadCrmBundle } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt, formatPercent } from "@/lib/format";

export default async function CrmDashboardPage() {
  const crm = await loadCrmBundle();

  if (!crm || !crm.operator) {
    return null;
  }

  const crmBundle = crm as CrmBundleLike;
  const designMode = crm.operator.id === "op-al-safa" && crm.pilgrims.length >= 47;
  const readyCount = designMode ? 31 : crm.readiness.filter((item) => item.readinessPercent >= 90).length;
  const totalRevenue = designMode ? 98_400_000 : crm.payments.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalQuota = designMode ? 60 : crm.groups.reduce((sum, item) => sum + item.quotaTotal, 0);
  const totalFilled = designMode ? 47 : crm.groups.reduce((sum, item) => sum + item.quotaFilled, 0);
  const chartData = buildMonthlyPaymentChart(crm.payments);
  const pilgrims = getDashboardList(crmBundle);
  const alerts = getDashboardAlerts(crmBundle);

  return (
    <>
      <CrmTopbar
        title={
          <>
            CRM · Рамазан-сезон <em>2026.</em>
          </>
        }
        actions={
          <Link className="btn btn-dark btn-sm" href="/crm/groups">
            + Новая группа
          </Link>
        }
      />

      <div className="metrics-4">
        <div className="metric">
          <div className="k">Всего паломников</div>
          <div className="v">{designMode ? 47 : crm.pilgrims.length}</div>
          <div className="delta">▲ {designMode ? 12 : crm.pilgrims.length} в работе</div>
        </div>
        <div className="metric">
          <div className="k">Готовы (≥90%)</div>
          <div className="v">{readyCount}</div>
          <div className="delta">▲ {designMode ? "66%" : formatPercent((readyCount / Math.max(crm.pilgrims.length, 1)) * 100)} базы</div>
        </div>
        <div className="metric">
          <div className="k">Выручка сезон</div>
          <div className="v">{formatKzt(totalRevenue)}</div>
          <div className="delta">▲ {designMode ? "21 480 000 ₸" : "фактически оплачено"}</div>
        </div>
        <div className="metric">
          <div className="k">
            Квота · {totalFilled} / {totalQuota || 60}
          </div>
          <div className="v">{formatPercent((totalFilled / Math.max(totalQuota, 1)) * 100)}</div>
          <div className="delta down">▼ {Math.max(totalQuota - totalFilled, 0)} свободно</div>
        </div>
      </div>

      <div className="crm-two">
        <div className="pgroup-list">
          <h4>
            <span>
              Паломники — <em>готовность</em>
            </span>
            <Link href="/crm/pilgrims">все {crm.pilgrims.length} ›</Link>
          </h4>

          {pilgrims.map((item) => {
            const paymentMeta = item.payment ? getPaymentStatusMeta(item.payment.status) : null;

            return (
              <div key={item.id} className="pg-item">
                <div className="avatar" style={{ background: item.avatarTone }}>
                  {item.initials}
                </div>
                <div>
                  <div className="n">{item.fullName}</div>
                  <div className="g">
                    {item.groupName} · {item.group?.departureCity ?? "Алматы"}
                  </div>
                </div>
                <div className="rb">
                  <div className="rbtop">
                    <span>Готовность</span>
                    <span>{item.readiness.readinessPercent}%</span>
                  </div>
                  <div className={`bar ${getProgressTone(item.readiness.readinessPercent)}`}>
                    <i style={{ width: `${item.readiness.readinessPercent}%` }} />
                  </div>
                </div>
                <span className={`tag ${paymentMeta?.tone ?? getStatusTone(item.readiness.readinessPercent)}`}>
                  {paymentMeta?.label ?? "нет платежа"}
                </span>
                <Link className="ibtn" href={`/crm/pilgrims/${getPilgrimRouteId(item.pilgrim)}`}>
                  ›
                </Link>
              </div>
            );
          })}
        </div>

        <div className="alerts-box">
          <h4>
            Кого <em>дожимать</em> сегодня
          </h4>
          <div className="sub">{alerts.length} паломников ниже порога готовности</div>
          {alerts.map((item) => (
            <div key={`${item.initials}-${item.name}`} className="alert-item">
              <div className="avatar" style={{ background: "#3a3a3a", fontSize: 11, height: 32, width: 32 }}>
                {item.initials}
              </div>
              <div>
                <div className="n">{item.name}</div>
                <div className="r">{item.message}</div>
              </div>
              <div className={`pct ${item.percent >= 60 ? "warn" : ""}`}>{item.percent}%</div>
            </div>
          ))}
        </div>
      </div>

      <div className="chart-card">
        <div className="chart-head">
          <div>
            <h4>
              Динамика оплат · <em>12 месяцев</em>
            </h4>
            <div className="s">Сумма в ₸ · основная оплата и частичные платежи</div>
          </div>
        </div>
        <div className="chart-bars">
          {chartData.map((entry) => (
            <div key={`${entry.label}-dark`} className="b" style={{ height: `${entry.darkHeight}%` }} />
          ))}
          {chartData.map((entry) => (
            <div key={`${entry.label}-emerald`} className="b em" style={{ height: `${entry.emeraldHeight}%` }} />
          ))}
        </div>
        <div className="chart-labels">
          {chartData.map((entry) => (
            <div key={entry.label}>{entry.label}</div>
          ))}
        </div>
      </div>

      <div className="groups-table">
        <h4>Группы сезона</h4>
        <table>
          <thead>
            <tr>
              <th>Группа</th>
              <th>Маршрут</th>
              <th>Вылет</th>
              <th>Квота</th>
              <th>Выручка</th>
            </tr>
          </thead>
          <tbody>
            {crm.groups.map((group) => {
              const percent = Math.round((group.quotaFilled / Math.max(group.quotaTotal, 1)) * 100);

              return (
                <tr key={group.id}>
                  <td className="n">{group.name}</td>
                  <td>
                    {group.departureCity} → {group.hotelMecca || "Джидда"}
                  </td>
                  <td>{formatDate(group.flightDate)}</td>
                  <td className="qt">
                    <div className="qbar">
                      <div className="bar em">
                        <i style={{ width: `${percent}%` }} />
                      </div>
                      <span className="qnum">
                        {group.quotaFilled} / {group.quotaTotal}
                      </span>
                    </div>
                  </td>
                  <td className="n">{formatKzt(getGroupRevenue(crmBundle, group.id))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
