import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { BatchDetail } from "@/components/batch-detail";
import { DetailSkeleton } from "@/components/page-skeleton";

export const metadata: Metadata = {
  title: "Batch details",
};

type BatchPageProps = {
  params: Promise<{ id: string }>;
};

export default function BatchPage({ params }: BatchPageProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-teal-800 hover:text-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="h-4 w-4"
        >
          <path
            d="M16 10H5m0 0 4-4m-4 4 4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        All batches
      </Link>

      <Suspense fallback={<DetailSkeleton />}>
        <BatchDetailById params={params} />
      </Suspense>
    </main>
  );
}

async function BatchDetailById({ params }: BatchPageProps) {
  const { id } = await params;
  return <BatchDetail id={id} />;
}
