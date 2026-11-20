import { AirtableConfigError, PcsError } from "@/lib/pcs/errors";

export function DataError({ error }: { error: unknown }) {
  if (error instanceof PcsError && error.code === "NOT_FOUND") {
    return (
      <EmptyState
        title="Batch not found"
        body="This batch may have been deleted or the link is incorrect. Return to the batch list to continue."
      />
    );
  }

  const message =
    error instanceof AirtableConfigError
      ? error.message
      : error instanceof PcsError
        ? error.message
        : "We could not reach Airtable right now. Please refresh and try again.";

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
      <h2 className="text-base font-semibold text-red-900">
        Production data unavailable
      </h2>
      <p className="mt-1 text-sm text-red-800">{message}</p>
      {error instanceof AirtableConfigError ? (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-white/70 p-3 text-xs text-red-800">
          AIRTABLE_API_KEY=&lt;your-key&gt;{"\n"}
          AIRTABLE_BASE_ID=&lt;your-base-id&gt;
        </pre>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-600">{body}</p>
    </div>
  );
}
