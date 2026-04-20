import Link from "next/link";
import { ArrowRight, BadgeCheck, Plane, QrCode, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { OperatorCard } from "@/components/marketing/operator-card";
import { SiteHeader } from "@/components/shell/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadPublicOperatorCards } from "@/lib/data/hajj-loaders";

const steps = [
  {
    title: "Выберите проверенного оператора",
    detail: "Публичный реестр показывает лицензию, рейтинг, свободную квоту и даты вылета до заявки.",
    icon: ShieldCheck,
  },
  {
    title: "Соберите пакет документов",
    detail: "Личный кабинет подсказывает, чего не хватает, и мгновенно пересчитывает готовность к вылету.",
    icon: UsersRound,
  },
  {
    title: "Подтвердите договор по QR",
    detail: "Каждый контракт получает уникальный QR-код, который можно проверить без авторизации.",
    icon: QrCode,
  },
];

export default async function LandingPage() {
  const verifiedOperators = await loadPublicOperatorCards();

  return (
    <div className="page-wrap">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
          <div className="shell-panel relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14">
            <div className="absolute inset-0 bg-haze opacity-90" />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <Badge className="mb-5">SaaS для хадж-операторов Казахстана</Badge>
                <h1 className="max-w-3xl text-5xl leading-none sm:text-6xl lg:text-7xl">
                  Управляйте паломниками, документами и квотами в одном контуре.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                  HajjCRM объединяет публичный реестр операторов, кабинет паломника, CRM и админ-панель на Supabase с готовым
                  фундаментом под QR-проверку, контракты и автоматические напоминания.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/operators">
                    <Button size="lg">
                      Забронировать хадж
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/crm/dashboard">
                    <Button variant="outline" size="lg">
                      Я оператор
                    </Button>
                  </Link>
                </div>
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  <div className="metric">
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">RLS + Storage</p>
                    <p className="mt-2 text-2xl font-semibold">Полный контур доступа</p>
                  </div>
                  <div className="metric">
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Edge Functions</p>
                    <p className="mt-2 text-2xl font-semibold">Cron, квоты, договоры</p>
                  </div>
                  <div className="metric">
                    <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Mobile First</p>
                    <p className="mt-2 text-2xl font-semibold">CRM для работы с телефона</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4">
                <div className="shell-panel animate-pulseGlow border-primary/20 bg-primary/8 p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Readiness Engine</p>
                      <p className="mt-2 text-3xl font-semibold">87% готовности</p>
                    </div>
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-primary/25 bg-primary/12 font-display text-3xl text-primary">
                      87
                    </div>
                  </div>
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-4">
                    <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Plane className="h-4 w-4 text-accent" />
                      Рейс Алматы - Джидда через 14 дней
                    </div>
                    <div className="grid gap-3 text-sm">
                      <div className="flex items-center justify-between rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
                        <span>Документы</span>
                        <span className="text-success">5 из 5</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3">
                        <span>Оплата</span>
                        <span className="text-warning">Остаток 600 000 ₸</span>
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
                        <span>Группа</span>
                        <span className="text-success">Назначена</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="subtle-panel p-5">
                    <p className="text-xl font-semibold">QR-проверка договора</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Любой паломник или родственник может проверить валидность контракта без входа в систему.
                    </p>
                  </div>
                  <div className="subtle-panel p-5">
                    <p className="text-xl font-semibold">Уведомления в очередь</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      WhatsApp и SMS в v1 логируются в базе, а интеграции подключаются без пересборки схемы.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Проверенные операторы</span>
              <h2 className="mt-4 text-4xl">Реестр, который можно показать клиенту до заявки</h2>
            </div>
            <Link href="/operators">
              <Button variant="outline">Открыть весь каталог</Button>
            </Link>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {verifiedOperators.map((item) => (
              <OperatorCard key={item.operator.id} operator={item.operator} city={item.city} quotaLeft={item.quotaLeft} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="eyebrow">Как это работает</span>
            <h2 className="mt-4 text-4xl">Три шага от лида до подтверждённого вылета</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="shell-panel p-6">
                <div className="flex items-center justify-between">
                  <step.icon className="h-10 w-10 text-primary" />
                  <span className="text-4xl font-display text-white/15">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-3xl">{step.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{step.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
            <div className="shell-panel p-8">
              <span className="eyebrow">Доверие и безопасность</span>
              <h2 className="mt-4 text-4xl">Почему это не просто витрина, а рабочая платформа</h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="subtle-panel p-5">
                  <BadgeCheck className="h-7 w-7 text-success" />
                  <p className="mt-4 text-xl font-semibold">Верифицированные лицензии</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Публично видны только подтверждённые операторы. Админ-слой отделён от CRM и кабинета.
                  </p>
                </div>
                <div className="subtle-panel p-5">
                  <Sparkles className="h-7 w-7 text-primary" />
                  <p className="mt-4 text-xl font-semibold">Readiness view</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Система считает готовность паломника по документам, оплате и назначению в группу в одном SQL view.
                  </p>
                </div>
              </div>
            </div>

            <div className="shell-panel p-8">
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">QR Verification</p>
              <h3 className="mt-3 text-4xl">Любой QR ведёт на отдельную страницу проверки</h3>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Страница `/verify/[qr_code]` отдаёт имя оператора, паломника, сумму договора и статус оплаты без логина. Это
                снижает количество спорных кейсов и повышает доверие семьи паломника.
              </p>
              <Link href="/verify/QR-HJ-ERLAN-2026" className="mt-8 inline-block">
                <Button>
                  Открыть демо-проверку
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
