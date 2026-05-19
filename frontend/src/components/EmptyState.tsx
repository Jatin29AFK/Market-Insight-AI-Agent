import { LineChart, Search, Sparkles } from "lucide-react";

export function EmptyState() {
  return (
    <section className="premium-card flex min-h-[520px] flex-col items-center justify-center rounded-[2rem] p-8 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10">
          <LineChart className="h-11 w-11 text-cyan-300" />
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
        <Sparkles className="h-4 w-4 text-violet-300" />
        Ask the agent anything about a stock
      </div>

      <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
        Get grounded market insights using live financial tools.
      </h2>

      <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
        Enter a ticker like AAPL, TSLA, NVDA, TCS.NS or RELIANCE.NS and ask
        about price, valuation, dividends, company fundamentals, or financial
        health.
      </p>

      <div className="mt-8 flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
        <Search className="h-4 w-4" />
        Example: “Explain the financial health of NVDA”
      </div>
    </section>
  );
}