"use client";

import { ErrorState } from "@/components/shell/fallback-state";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      copy="Админ-панель не смогла собрать платформенные данные. Повторите запрос или вернитесь к moderation."
      homeHref="/admin/operators"
      homeLabel="В админку"
      onRetry={reset}
      title="Панель <em>администратора</em> недоступна"
    />
  );
}
