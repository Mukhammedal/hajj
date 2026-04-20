"use client";

import { ErrorState } from "@/components/shell/fallback-state";

export default function CrmError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      copy="CRM оператора временно не может собрать сезонные данные. Повторите загрузку или вернитесь на dashboard."
      homeHref="/crm/dashboard"
      homeLabel="В CRM"
      onRetry={reset}
      title="CRM <em>временно недоступна</em>"
    />
  );
}
