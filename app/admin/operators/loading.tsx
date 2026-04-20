import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOperatorsLoading() {
  return (
    <div className="grid gap-6">
      <div className="shell-panel p-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="mt-4 h-14 w-80" />
      </div>
      <div className="shell-panel p-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="mb-4 h-14 w-full last:mb-0" />
        ))}
      </div>
    </div>
  );
}
