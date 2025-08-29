import Skeleton from '@/components/ui/Skeleton';

export default function LoadingPDP() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Skeleton className="aspect-[3/4] w-full rounded-xl" />
        <div className="mt-3 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-12 rounded-md" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-3/4 rounded" />
        <div className="mt-2 flex items-baseline gap-2">
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="h-4 w-16 rounded" />
        </div>
        <Skeleton className="mt-3 h-16 w-full rounded" />
        <div className="mt-6">
          <Skeleton className="h-10 w-40 rounded" />
        </div>
      </div>
    </main>
  );
}
