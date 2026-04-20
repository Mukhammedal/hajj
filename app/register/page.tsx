import Image from "next/image";
import { RegisterForm } from "@/components/auth/register-form";
import { PublicTopbar } from "@/components/shell/public-topbar";
import { designImages } from "@/lib/design-public";

export default function RegisterPage() {
  return (
    <div className="page-wrap app-shell">
      <PublicTopbar
        cta={{ href: "/login", label: "Уже есть аккаунт · Войти", variant: "ghost" }}
        links={[
          { href: "/operators", label: "Операторы" },
          { href: "/verify/QR-HJ-2026-ERLAN-A4", label: "Проверить договор" },
        ]}
      />

      <main className="auth-split">
        <div className="auth-left">
          <div>
            <span className="eyebrow dot">Регистрация</span>
            <h1>
              Добро <em>пожаловать.</em>
            </h1>
            <p className="sub">
              Выберите роль — и за 2 минуты откройте кабинет. Паспорт и ИИН понадобятся позже, при оформлении договора.
            </p>
          </div>

          <RegisterForm />
        </div>

        <div className="auth-right">
          <Image alt="Кааба" fill priority sizes="50vw" src={designImages.heroKaaba} style={{ objectFit: "cover" }} />
          <div className="overlay" />
          <div className="content">
            <div className="ayah">إنّ أوّل بيت وُضع للناس للذي ببكّة مباركاً</div>
            <h2>
              Хадж — путь <em>одной жизни.</em> Начните его правильно.
            </h2>
            <div className="attr">Аль Имран · 3:96</div>
          </div>
        </div>
      </main>
    </div>
  );
}
