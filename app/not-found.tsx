import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="page-wrap flex min-h-screen items-center justify-center px-4">
      <div className="shell-panel max-w-xl p-8 text-center">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">404</p>
        <h1 className="mt-4 text-5xl">Страница не найдена</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          Возможно, маршрут ещё не связан с данными или ссылка устарела. Вернитесь на главную и продолжите навигацию оттуда.
        </p>
        <Link href="/" className="mt-6 inline-block">
          <Button>На главную</Button>
        </Link>
      </div>
    </div>
  );
}
