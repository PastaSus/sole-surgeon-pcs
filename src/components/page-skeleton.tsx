export function ListSkeleton() {
  return (
    <div aria-label="Loading batches" className="animate-pulse space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-[74px] rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="h-48 rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div aria-label="Loading batch" className="animate-pulse space-y-5">
      <div className="h-56 rounded-2xl border border-slate-200 bg-white" />
      <div className="space-y-3">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-40 rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </div>
  );
}
