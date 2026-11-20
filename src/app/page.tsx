import { Suspense } from "react";
import { BatchList } from "@/components/batch-list";
import { ListSkeleton } from "@/components/page-skeleton";
import { formatBusinessDate } from "@/lib/format";
import { BUSINESS_DATE } from "@/lib/pcs/types";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
          Production queue
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Ana&apos;s batches
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Batches targeted for {formatBusinessDate(BUSINESS_DATE)}. Open a batch
          to start it or complete an unlocked task.
        </p>
      </div>

      <Suspense fallback={<ListSkeleton />}>
        <BatchList />
      </Suspense>
    </main>
  );
}
