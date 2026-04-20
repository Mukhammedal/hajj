import { Skeleton } from "@/components/ui/skeleton";

export default function CrmPaymentsLoading() {
  return (
    <div className="grid gap-6">
      <div className="shell-panel p-6">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="mt-4 h-14 w-80" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="shell-panel p-6">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        </div>
        <div className="shell-panel p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="mb-4 h-14 w-full last:mb-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
