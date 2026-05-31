import { AgentConsole } from "@/components/AgentConsole";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { WatchlistCompare } from "@/components/WatchlistCompare";
import { HeroBrand } from "@/components/HeroBrand";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="w-full px-4 pb-8 pt-10 text-center md:px-8 md:pb-12 md:pt-14">
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          <HeroBrand />

          <h2 className="mt-8 text-3xl font-semibold tracking-tight text-white md:text-5xl">
            Analyze stocks with an{" "}
            <span className="gradient-text">agentic AI workflow</span>.
          </h2>

          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-400 md:text-lg">
            Market Insight AI combines live market data, financial statements,
            chart-based trend analysis, and a LangGraph tool-calling agent to
            explain stock signals in a transparent, beginner-friendly way.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-6xl text-left">
          <DisclaimerBanner />
        </div>
      </section>

      <AgentConsole />
      <WatchlistCompare />
    </div>
  );
}
