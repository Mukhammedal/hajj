import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/shell/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthState, routeForRole } from "@/lib/auth";

export default async function LoginPage() {
  const auth = await getAuthState();

  if (auth.isAuthenticated && auth.role) {
    redirect(routeForRole(auth.role));
  }

  return (
    <div className="page-wrap">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="shell-panel p-8">
            <Badge>{auth.isConfigured ? "Supabase Auth" : "Демо-режим"}</Badge>
            <h1 className="mt-4 text-5xl">Вход в HajjCRM</h1>
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              Роли поддерживаются строго по ТЗ: <span className="text-foreground">admin</span>,{" "}
              <span className="text-foreground">operator</span>, <span className="text-foreground">pilgrim</span>.
            </p>

            <div className="mt-8">
              {auth.isConfigured ? (
                <LoginForm />
              ) : (
                <div className="grid gap-4">
                  <p className="text-sm leading-7 text-muted-foreground">
                    `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY` не заданы. Вход не нужен, можно открыть demo-маршруты.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/cabinet/dashboard">
                      <Button>Кабинет паломника</Button>
                    </Link>
                    <Link href="/crm/dashboard">
                      <Button variant="outline">CRM оператора</Button>
                    </Link>
                    <Link href="/admin/operators">
                      <Button variant="outline">Админ-панель</Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </section>

          <section className="shell-panel p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Доступ по ролям</p>
            <div className="mt-6 grid gap-4">
              <RoleCard title="Pilgrim" detail="Кабинет паломника: документы, платежи, чек-лист, QR договора." />
              <RoleCard title="Operator" detail="CRM: паломники, группы, квоты, уведомления, аналитика и выручка." />
              <RoleCard title="Admin" detail="Платформенная верификация операторов, общая аналитика и мониторинг качества." />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function RoleCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="subtle-panel p-5">
      <p className="text-xl font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
    </div>
  );
}
