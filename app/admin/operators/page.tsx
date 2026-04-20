import { OperatorVerificationTable } from "@/components/admin/operator-verification-table";
import { Badge } from "@/components/ui/badge";
import { loadAdminBundle } from "@/lib/data/hajj-loaders";

export default async function AdminOperatorsPage() {
  const admin = await loadAdminBundle();
  const rows = admin.operators.map((operator) => ({
    operator,
    pilgrimCount: admin.pilgrims.filter((pilgrim) => pilgrim.operatorId === operator.id).length,
    revenue: admin.payments
      .filter((payment) => payment.operatorId === operator.id)
      .reduce((sum, payment) => sum + payment.paidAmount, 0),
  }));

  return (
    <div className="grid gap-6">
      <section className="shell-panel p-6">
        <Badge>Operator governance</Badge>
        <h2 className="mt-4 text-4xl">Верификация операторов</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground">
          Администратор может подтверждать и отзывать верификацию, видеть количество паломников и выручку по каждому оператору.
        </p>
      </section>

      <OperatorVerificationTable rows={rows} />
    </div>
  );
}
