export function DashboardSkeleton() {
  return (
    <section className="mb-6 space-y-6">
      <div className="premium-card animate-pulse rounded-[2rem] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <div className="h-4 w-48 rounded-full bg-white/10" />
            <div className="mt-5 h-8 w-72 rounded-full bg-white/10" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-20 rounded-full bg-white/10" />
              <div className="h-7 w-28 rounded-full bg-white/10" />
              <div className="h-7 w-16 rounded-full bg-white/10" />
            </div>
          </div>

          <div className="h-28 w-full rounded-3xl bg-white/10 lg:w-64" />
        </div>

        <div className="mt-8 space-y-3">
          <div className="h-3 w-full rounded-full bg-white/10" />
          <div className="h-3 w-11/12 rounded-full bg-white/10" />
          <div className="h-3 w-9/12 rounded-full bg-white/10" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="subtle-card animate-pulse rounded-3xl p-5"
          >
            <div className="h-10 w-10 rounded-2xl bg-white/10" />
            <div className="mt-6 h-3 w-24 rounded-full bg-white/10" />
            <div className="mt-4 h-7 w-28 rounded-full bg-white/10" />
            <div className="mt-4 h-3 w-full rounded-full bg-white/10" />
          </div>
        ))}
      </div>

      <div className="premium-card animate-pulse rounded-[2rem] p-6">
        <div className="h-4 w-48 rounded-full bg-white/10" />
        <div className="mt-4 h-8 w-64 rounded-full bg-white/10" />
        <div className="mt-8 h-[320px] rounded-3xl bg-white/10" />
      </div>
    </section>
  );
}