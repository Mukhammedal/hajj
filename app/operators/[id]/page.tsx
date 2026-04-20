import Link from "next/link";
import { CalendarRange, MapPin, Phone, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/shell/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadOperatorPublicProfile } from "@/lib/data/hajj-loaders";
import { formatDate, formatKzt } from "@/lib/format";

export default async function OperatorProfilePage({ params }: { params: { id: string } }) {
  const profile = await loadOperatorPublicProfile(params.id);

  if (!profile) {
    notFound();
  }

  const { operator, groups, reviews, city } = profile;

  return (
    <div className="page-wrap">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="shell-panel p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <Badge variant={operator.isVerified ? "success" : "warning"}>
                {operator.isVerified ? "Лицензия подтверждена" : "Ожидает проверки"}
              </Badge>
              <h1 className="mt-4 text-5xl">{operator.companyName}</h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{operator.description}</p>
              <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="data-chip">
                  <MapPin className="h-4 w-4 text-accent" />
                  {operator.address}
                </div>
                <div className="data-chip">
                  <Phone className="h-4 w-4 text-secondary" />
                  {operator.phone}
                </div>
                <div className="data-chip">
                  <Star className="h-4 w-4 text-primary" />
                  Рейтинг {operator.rating.toFixed(1)} ({operator.totalReviews} отзывов)
                </div>
                <div className="data-chip">Лицензия {operator.licenseNumber}</div>
              </div>
            </div>

            <div className="subtle-panel p-6">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Публичный профиль</p>
              <p className="mt-3 text-3xl font-semibold">{city}</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                Этот экран можно использовать как лендинг конкретного оператора с публичными отзывами и доступными группами.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Link href="/cabinet/dashboard">
                  <Button className="w-full">Оставить заявку</Button>
                </Link>
                <Link href="/verify/QR-HJ-ERLAN-2026">
                  <Button variant="outline" className="w-full">
                    Проверить договор по QR
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="shell-panel p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl">Доступные группы</h2>
              <Badge variant="secondary">{groups.length} рейса</Badge>
            </div>
            <div className="grid gap-4">
              {groups.map((group) => (
                <div key={group.id} className="subtle-panel p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-2xl font-semibold">{group.name}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="data-chip">
                          <CalendarRange className="h-4 w-4 text-primary" />
                          {formatDate(group.flightDate)} - {formatDate(group.returnDate)}
                        </span>
                        <span className="data-chip">Мекка: {group.hotelMecca}</span>
                        <span className="data-chip">Медина: {group.hotelMedina}</span>
                      </div>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Цена от</p>
                      <p className="mt-2 text-3xl font-semibold text-primary">{formatKzt(group.priceFrom)}</p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        Свободно {Math.max(group.quotaTotal - group.quotaFilled, 0)} из {group.quotaTotal}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shell-panel p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-3xl">Отзывы</h2>
              <Badge>{reviews.length} отзыва</Badge>
            </div>
            <div className="grid gap-4">
              {reviews.map((review) => (
                <div key={review.id} className="subtle-panel p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{review.rating}/5</p>
                    <p className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</p>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
