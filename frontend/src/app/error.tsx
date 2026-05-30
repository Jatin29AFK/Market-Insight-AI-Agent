"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="premium-card w-full max-w-2xl rounded-[2rem] p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-200" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The dashboard hit an unexpected error. Try again, check the ticker
          symbol, or restart the backend if market data is unavailable.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-slate-500">Error ID: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
      </section>
    </main>
  );
}
