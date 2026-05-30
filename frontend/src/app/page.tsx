import { AgentConsole } from "@/components/AgentConsole";
import { Header } from "@/components/Header";
import { MetricStrip } from "@/components/MetricStrip";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { WatchlistCompare } from "@/components/WatchlistCompare";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-8 md:pb-12 md:pt-14">
        <div className="max-w-4xl">
          <p className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100">
            AI-powered market research with transparent tool usage
          </p>

          <h1 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
            Analyze stocks with an{" "}
            <span className="gradient-text">agentic AI workflow</span>.
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-400 md:text-lg">
            Market Insight AI combines live market data, financial statements,
            chart-based trend analysis, and a LangGraph tool-calling agent to
            explain stock signals in a transparent, beginner-friendly way.
          </p>
        </div>

        <div className="mt-10">
          <MetricStrip />
        </div>

        <div className="mt-6">
  <DisclaimerBanner />
</div>
      </section>

      <AgentConsole />
      <WatchlistCompare />
    </div>
  );
}
