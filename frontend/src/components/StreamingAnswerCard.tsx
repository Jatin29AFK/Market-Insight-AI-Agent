"use client";

import { useMemo, useState } from "react";
import { MarkdownAnswer } from "@/components/MarkdownAnswer";
import { Brain, Check, Copy, Database, Download, Layers3, Loader2 } from "lucide-react";
import type { AgentChatResponse, StockSnapshotResponse } from "@/types/agent";
import { ToolBadges } from "@/components/ToolBadges";
import { TraceTimeline } from "@/components/TraceTimeline";
import { buildMarkdownReport } from "@/lib/report";

type StreamingAnswerCardProps = {
  symbol: string;
  question: string;
  streamedAnswer: string;
  isStreaming: boolean;
  result?: AgentChatResponse | null;
  snapshot?: StockSnapshotResponse | null;
};

export function StreamingAnswerCard({
  symbol,
  question,
  streamedAnswer,
  isStreaming,
  result,
  snapshot,
}: StreamingAnswerCardProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const report = useMemo(
    () =>
      buildMarkdownReport({
        symbol: result?.symbol || symbol,
        question: result?.question || question,
        answer: result?.answer || streamedAnswer,
        toolsUsed: result?.tools_used || [],
        metadata: result?.metadata,
        snapshot,
      }),
    [question, result, snapshot, streamedAnswer, symbol]
  );

  if (!streamedAnswer && !isStreaming) {
    return null;
  }

  async function handleCopyReport() {
    await navigator.clipboard.writeText(report);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1800);
  }

  function handleDownloadReport() {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const fileSymbol = (result?.symbol || symbol || "market")
      .toLowerCase()
      .replace(/[^a-z0-9.-]+/g, "-");

    link.href = url;
    link.download = `market-insight-${fileSymbol}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="premium-card rounded-[2rem] p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-300" />
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
              Streaming Agent Response
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-white">
            {symbol || "Market"} Insight
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Question: {question}
          </p>
        </div>

        {isStreaming ? (
          <div className="flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100">
            <Loader2 className="h-4 w-4 animate-spin" />
            Streaming
          </div>
        ) : result?.metadata?.llm_model ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyReport}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-4 py-3 text-sm text-cyan-100 transition hover:bg-cyan-300/15"
            >
              {copyState === "copied" ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Report
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.07]"
            >
              <Download className="h-4 w-4 text-violet-300" />
              Download .md
            </button>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-violet-300" />
                {result.metadata.llm_model}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="min-h-[240px] rounded-3xl border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-200 md:text-base">
  <MarkdownAnswer content={streamedAnswer || "Preparing response..."} />

  {isStreaming && (
    <span className="ml-1 inline-block h-5 w-2 animate-pulse rounded-sm bg-cyan-300 align-middle" />
  )}
</div>

      {result && !isStreaming && (
        <>
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
                  <span className="text-slate-200">
                    {result.tools_used.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <TraceTimeline trace={result.trace} />
          </div>
        </>
      )}
    </section>
  );
}
