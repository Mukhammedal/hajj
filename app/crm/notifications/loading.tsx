import { Skeleton } from "@/components/ui/skeleton";

export default function CrmNotificationsLoading() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="shell-panel p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-4 h-14 w-72" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
      <div className="shell-panel p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="mb-4 h-14 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}
