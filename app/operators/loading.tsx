import { Skeleton } from "@/components/ui/skeleton";

export default function OperatorsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-4 h-6 w-40" />
      <Skeleton className="mb-8 h-14 w-96" />
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="shell-panel p-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="mt-5 h-10 w-52" />
            <Skeleton className="mt-4 h-20 w-full" />
            <Skeleton className="mt-6 h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
