import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleDashed, Phone } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatPercent } from "@/lib/format";
import type { PilgrimProfile } from "@/types/domain";

const allDocumentTypes = ["passport", "medical_certificate", "photo", "questionnaire", "vaccination"] as const;

interface PilgrimTableRow {
  pilgrim: PilgrimProfile;
  docs: Partial<Record<(typeof allDocumentTypes)[number], "missing" | "uploaded" | "verified">>;
  groupName: string | null;
  paymentStatus: "pending" | "partial" | "paid" | null;
  readinessPercent: number;
  docsCount: number;
}

export function PilgrimTable({ rows }: { rows: PilgrimTableRow[] }) {
  return (
    <div className="shell-panel overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <tr>
              <th className="px-5 py-4">Паломник</th>
              <th className="px-5 py-4">Документы</th>
              <th className="px-5 py-4">Оплата</th>
              <th className="px-5 py-4">Группа</th>
              <th className="px-5 py-4">Готовность</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ pilgrim, docs, paymentStatus, groupName, readinessPercent, docsCount }) => {
              return (
                <tr key={pilgrim.id} className="border-b border-white/8 last:border-b-0">
                  <td className="px-5 py-4 align-top">
                    <Link href={`/crm/pilgrims/${pilgrim.id}`} className="block">
                      <p className="font-semibold">{pilgrim.fullName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{pilgrim.iin}</p>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        {pilgrim.phone}
                      </div>
                    </Link>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-wrap gap-2">
                      {allDocumentTypes.map((type) => {
                        const state = docs[type] ?? "missing";
                        return (
                          <span
                            key={type}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5"
                            title={type}
                          >
                            {state === "verified" ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : state === "uploaded" ? (
                              <AlertTriangle className="h-4 w-4 text-warning" />
                            ) : (
                              <CircleDashed className="h-4 w-4 text-muted-foreground" />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <Badge
                      variant={paymentStatus === "paid" ? "success" : paymentStatus === "partial" ? "warning" : "muted"}
                    >
                      {paymentStatus === "paid"
                        ? "Оплачено"
                        : paymentStatus === "partial"
                          ? "Частично"
                          : "Ожидает"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 align-top text-sm text-muted-foreground">{groupName ?? "Не назначена"}</td>
                  <td className="px-5 py-4 align-top">
                    <div className="min-w-[160px]">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span>{formatPercent(readinessPercent)}</span>
                        <span className="text-muted-foreground">{docsCount}/5 док.</span>
                      </div>
                      <Progress value={readinessPercent} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
