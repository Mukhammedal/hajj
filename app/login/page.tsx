import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { PublicTopbar } from "@/components/shell/public-topbar";
import { designImages } from "@/lib/design-public";
import { getAuthState, routeForRole } from "@/lib/auth";

export default async function LoginPage() {
  const auth = await getAuthState();

  if (auth.isAuthenticated && auth.role) {
    redirect(routeForRole(auth.role));
  }

  return (
    <div className="page-wrap app-shell">
      <PublicTopbar
        cta={{ href: "/register", label: "Нет аккаунта · Регистрация", variant: "ghost" }}
        links={[
          { href: "/operators", label: "Операторы" },
          { href: "/verify/QR-HJ-2026-ERLAN-A4", label: "Проверить договор" },
        ]}
      />

      <main className="auth-split">
        <div className="auth-left">
          <div>
            <span className="eyebrow dot">Вход</span>
            <h1>
              С <em>возвращением.</em>
            </h1>
            <p className="sub">Войдите, чтобы увидеть готовность к вылету, документы и договор.</p>
          </div>

          <LoginForm />

          <div className="demo-block">
            <h6>{auth.isConfigured ? "Тестовые роли" : "Демо-режим"}</h6>
            {auth.isConfigured ? (
              <>
                <p>В live-сборке роль определяется через Supabase Auth. Для проверки используй подготовленные тестовые аккаунты.</p>
                <div className="demo-btns" style={{ display: "grid", gap: 8 }}>
                  <div className="chip">admin@hajjcrm.kz</div>
                  <div className="chip">operator@test.kz</div>
                  <div className="chip">pilgrim@test.kz</div>
                </div>
              </>
            ) : (
              <>
                <p>Supabase Auth не настроен в этой сборке — откройте любой ролевой кабинет без входа для демонстрации.</p>
                <div className="demo-btns">
                  <Link className="btn btn-ghost btn-sm" href="/cabinet/dashboard">
                    Паломник
                  </Link>
                  <Link className="btn btn-ghost btn-sm" href="/crm/dashboard">
                    Оператор
                  </Link>
                  <Link className="btn btn-ghost btn-sm" href="/admin/operators">
                    Админ
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="auth-right">
          <Image alt="Масджид ан-Набави" fill priority sizes="50vw" src={designImages.medina} style={{ objectFit: "cover" }} />
          <div className="overlay" />
          <div className="content">
            <div className="ayah">رَبِّ اشْرَحْ لِي صَدْرِي</div>
            <h2>
              Медина ждёт — <em>путь в сердце</em> начинается с покоя.
            </h2>
            <div className="attr">Та-Ха · 20:25</div>
          </div>
        </div>
      </main>
    </div>
  );
}
