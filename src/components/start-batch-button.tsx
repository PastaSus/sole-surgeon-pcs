"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDateTime } from "@/lib/format";

type StartResponse = {
  batch?: { startedAt: string | null };
  error?: string;
};

export function StartBatchButton({ batchId }: { batchId: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function handleStart() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/batches/${batchId}/start`, {
        method: "POST",
      });
      const body = (await response.json()) as StartResponse;

      if (!response.ok) {
        setError(body.error ?? "Could not start the batch.");
        return;
      }

      setSavedAt(body.batch?.startedAt ?? new Date().toISOString());
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={saving}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {saving ? "Starting batch..." : "Start batch"}
      </button>

      <p className="min-h-5 text-sm text-teal-800" role="status" aria-live="polite">
        {savedAt
          ? `Saved. Batch started ${formatDateTime(savedAt)}.`
          : ""}
      </p>
      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
