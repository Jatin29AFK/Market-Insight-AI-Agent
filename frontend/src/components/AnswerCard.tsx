import { Brain, Database, Layers3 } from "lucide-react";
import type { AgentChatResponse } from "@/types/agent";
import { ToolBadges } from "@/components/ToolBadges";
import { TraceTimeline } from "@/components/TraceTimeline";

type AnswerCardProps = {
  result: AgentChatResponse;
};

export function AnswerCard({ result }: AnswerCardProps) {
  return (
    <section className="premium-card rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-300" />
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
              Agent Response
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-white">
            {result.symbol || "Market"} Insight
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Question: {result.question}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Layers3 className="h-4 w-4 text-violet-300" />
            {result.metadata?.llm_model || "LLM"}
          </div>
        </div>
      </div>

      <div className="answer-content rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-200 md:text-base">
        {result.answer}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <ToolBadges tools={result.tools_used} />

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-4 w-4 text-cyan-300" />
            <h3 className="font-medium text-white">Execution Metadata</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Agent Type</span>
              <span className="text-right text-slate-200">
                {result.metadata?.agent_type || "N/A"}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Total Messages</span>
              <span className="text-slate-200">
                {result.metadata?.total_messages || 0}
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-slate-400">Tools Count</span>
              <span className="text-slate-200">{result.tools_used.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <TraceTimeline trace={result.trace} />
      </div>
    </section>
  );
}