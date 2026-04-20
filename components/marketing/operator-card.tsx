import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Operator } from "@/types/domain";

export function OperatorCard({
  operator,
  city,
  quotaLeft,
}: {
  operator: Operator;
  city: string;
  quotaLeft: number;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Badge variant={operator.isVerified ? "success" : "warning"}>{operator.isVerified ? "Проверен" : "Ожидает"}</Badge>
          <div className="data-chip">
            <Star className="h-4 w-4 text-primary" />
            {operator.rating.toFixed(1)}
          </div>
        </div>
        <CardTitle>{operator.companyName}</CardTitle>
        <CardDescription>{operator.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            {city}
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-secondary" />
            Лицензия {operator.licenseNumber}
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-foreground">
            Свободная квота: <span className="font-semibold">{quotaLeft} мест</span>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href={`/operators/${operator.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Профиль
            </Button>
          </Link>
          <Link href={`/operators/${operator.id}`} className="flex-1">
            <Button className="w-full">
              Забронировать
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
