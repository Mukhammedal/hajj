"use client";

import { ErrorState } from "@/components/shell/fallback-state";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      copy="Во время рендера произошёл сбой. Данные и навигация не потеряны, попробуйте перезагрузить экран."
      onRetry={reset}
      title="Сервис <em>временно недоступен</em>"
    />
  );
}
