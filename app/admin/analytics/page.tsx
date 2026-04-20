import { Badge } from "@/components/ui/badge";
import { loadAdminBundle } from "@/lib/data/hajj-loaders";
import { formatKzt } from "@/lib/format";

export default async function AdminAnalyticsPage() {
  const admin = await loadAdminBundle();
  const totalPilgrims = admin.pilgrims.length;
  const totalRevenue = admin.payments.reduce((sum, payment) => sum + payment.paidAmount, 0);
  const complaintReviews = admin.reviews.filter((review) => review.rating <= 3);

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 xl:grid-cols-3">
        <Metric title="Всего паломников" value={String(totalPilgrims)} detail="По всем операторам платформы" />
        <Metric title="Совокупная выручка" value={formatKzt(totalRevenue)} detail="На основе фактически оплаченных сумм" />
        <Metric title="Мониторинг отзывов" value={String(admin.reviews.length)} detail="Видимые отзывы в публичном реестре" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="shell-panel overflow-hidden p-0">
          <div className="border-b border-white/10 px-6 py-5">
            <Badge>Revenue by operator</Badge>
            <h2 className="mt-4 text-3xl">Выручка по операторам</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <tr>
                  <th className="px-5 py-4">Оператор</th>
                  <th className="px-5 py-4">Верификация</th>
                  <th className="px-5 py-4">Выручка</th>
                </tr>
              </thead>
              <tbody>
                {admin.operators.map((operator) => (
                  <tr key={operator.id} className="border-b border-white/8 last:border-b-0">
                    <td className="px-5 py-4">{operator.companyName}</td>
                    <td className="px-5 py-4">{operator.isVerified ? "verified" : "pending"}</td>
                    <td className="px-5 py-4">
                      {formatKzt(
                        admin.payments
                          .filter((payment) => payment.operatorId === operator.id)
                          .reduce((sum, payment) => sum + payment.paidAmount, 0),
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="shell-panel p-6">
          <Badge variant="warning">Complaint watch</Badge>
          <h2 className="mt-4 text-3xl">Риск-мониторинг отзывов</h2>
          <div className="mt-6 grid gap-4">
            {complaintReviews.length ? (
              complaintReviews.map((review) => (
                <div key={review.id} className="subtle-panel p-4">
                  <p className="font-semibold">Оценка {review.rating}/5</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="subtle-panel p-4">
                <p className="font-semibold">Критичных отзывов не обнаружено</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  В демо-данных нет комментариев с рейтингом 3 и ниже, но панель готова к модерации таких кейсов.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return (
    <div className="shell-panel p-5">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">{title}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
