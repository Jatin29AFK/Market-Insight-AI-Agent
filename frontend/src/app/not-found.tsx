import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="premium-card w-full max-w-2xl rounded-[2rem] p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
          <SearchX className="h-8 w-8 text-cyan-300" />
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          This route does not exist in Market Insight AI.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15"
        >
          <Home className="h-4 w-4" />
          Back Home
        </Link>
      </section>
    </main>
  );
}
