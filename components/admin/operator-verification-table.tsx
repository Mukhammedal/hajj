import { OperatorVerifyButton } from "@/components/admin/operator-verify-button";
import { Badge } from "@/components/ui/badge";
import { formatKzt } from "@/lib/format";
import type { Operator } from "@/types/domain";

interface OperatorVerificationRow {
  operator: Operator;
  pilgrimCount: number;
  revenue: number;
}

export function OperatorVerificationTable({ rows }: { rows: OperatorVerificationRow[] }) {
  return (
    <div className="shell-panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Оператор</th>
              <th className="px-5 py-4">Статус</th>
              <th className="px-5 py-4">Паломники</th>
              <th className="px-5 py-4">Выручка</th>
              <th className="px-5 py-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ operator, pilgrimCount, revenue }) => (
              <tr key={operator.id} className="border-b border-white/8 last:border-b-0">
                <td className="px-5 py-4">
                  <p className="font-semibold">{operator.companyName}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{operator.licenseNumber}</p>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={operator.isVerified ? "success" : "warning"}>
                    {operator.isVerified ? "Верифицирован" : "На проверке"}
                  </Badge>
                </td>
                <td className="px-5 py-4">{pilgrimCount}</td>
                <td className="px-5 py-4">{formatKzt(revenue)}</td>
                <td className="px-5 py-4">
                  <OperatorVerifyButton operatorId={operator.id} isVerified={operator.isVerified} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
