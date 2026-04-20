"use client";

import { ErrorState } from "@/components/shell/fallback-state";

export default function CabinetError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      copy="Кабинет паломника сейчас не смог получить данные. Попробуйте снова или вернитесь на dashboard."
      homeHref="/cabinet/dashboard"
      homeLabel="В кабинет"
      onRetry={reset}
      title="Кабинет <em>не открылся</em>"
    />
  );
}
