import Skeleton from '@/components/ui/Skeleton';

export default function LoadingHome() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="h-7 w-64 mb-4"><Skeleton className="h-full w-full rounded" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="block">
            <Skeleton className="aspect-[3/4] w-full rounded-xl" />
            <div className="mt-2">
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="mt-2 flex gap-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
