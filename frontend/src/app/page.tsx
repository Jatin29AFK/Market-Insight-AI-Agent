import { AgentConsole } from "@/components/AgentConsole";
import { Header } from "@/components/Header";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { WatchlistCompare } from "@/components/WatchlistCompare";
import { AppLogo } from "@/components/AppLogo";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />

      <section className="w-full px-4 pb-8 pt-8 text-center md:px-8 md:pb-12 md:pt-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          <AppLogo size="lg" />

          <h1 className="mt-6 text-6xl font-black tracking-tight text-white md:text-8xl">
            <span className="gradient-text">Market Insight AI</span>
          </h1>

          <p className="mb-5 mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-cyan-100">
            AI-powered market research with transparent tool usage
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
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
