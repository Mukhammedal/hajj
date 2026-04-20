import { Skeleton } from "@/components/ui/skeleton";

export default function CrmPilgrimsLoading() {
  return (
    <div className="grid gap-6">
      <div className="shell-panel p-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="mt-4 h-14 w-80" />
        <Skeleton className="mt-4 h-6 w-full max-w-2xl" />
      </div>
      <div className="shell-panel p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="mb-4 h-14 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}
