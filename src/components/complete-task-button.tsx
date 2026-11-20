"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type CompleteResponse = {
  error?: string;
};

export function CompleteTaskButton({
  taskId,
  taskName,
}: {
  taskId: string;
  taskName: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: "POST",
      });
      const body = (await response.json()) as CompleteResponse;

      if (!response.ok) {
        setError(body.error ?? "Could not save this task.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sm:text-right">
      <button
        type="button"
        onClick={handleComplete}
        disabled={saving || saved}
        aria-label={`Mark ${taskName} as done`}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-teal-700 bg-white px-4 text-sm font-semibold text-teal-800 transition hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {saved ? "Saved" : saving ? "Saving..." : "Mark done"}
      </button>
      {error ? (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
