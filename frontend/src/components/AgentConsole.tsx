"use client";

import { FormEvent, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  MessageSquare,
  Search,
} from "lucide-react";

import {
  getStockHistory,
  getStockSnapshot,
  streamMarketAgent,
} from "@/lib/api";

import type {
  AgentChatResponse,
  HistoricalDataResponse,
  StockSnapshotResponse,
} from "@/types/agent";

import {
  chartPeriods,
  promptTemplates,
  sampleStocks,
} from "@/lib/constants";

import { AnswerCard } from "@/components/AnswerCard";
import { EmptyState } from "@/components/EmptyState";
import { MarketDashboard } from "@/components/MarketDashboard";
import { StreamingAnswerCard } from "@/components/StreamingAnswerCard";
import { StreamingStatus } from "@/components/StreamingStatus";
import { DashboardSkeleton } from "@/components/DashboardSkeleton";

export function AgentConsole() {
  const [symbol, setSymbol] = useState("AAPL");
  const [question, setQuestion] = useState(
    "Give me a simple overview of business, price and risks."
  );

  const [result, setResult] = useState<AgentChatResponse | null>(null);
  const [snapshot, setSnapshot] = useState<StockSnapshotResponse | null>(null);
  const [history, setHistory] = useState<HistoricalDataResponse | null>(null);

  const [streamedAnswer, setStreamedAnswer] = useState("");
  const [statusMessages, setStatusMessages] = useState<string[]>([]);

  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isBusy = isLoadingDashboard || isStreaming;

  const [selectedPeriod, setSelectedPeriod] = useState("6mo");

  async function settlePromise<T>(
    promise: Promise<T>
  ): Promise<{ ok: true; value: T } | { ok: false; error: unknown }> {
    try {
      const value = await promise;
      return { ok: true, value };
    } catch (error) {
      return { ok: false, error };
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSymbol = symbol.trim().toUpperCase();
    const cleanQuestion = question.trim();

    if (!cleanSymbol) {
      setErrorMessage("Please enter a stock symbol.");
      return;
    }

    if (!cleanQuestion) {
      setErrorMessage("Please enter a question.");
      return;
    }

    let finalAnswerBuffer = "";

    try {
      setErrorMessage("");
      setResult(null);
      setSnapshot(null);
      setHistory(null);
      setStreamedAnswer("");
      setStatusMessages([]);

      setIsLoadingDashboard(true);

      const dashboardPromise = Promise.all([
        getStockSnapshot(cleanSymbol),
        getStockHistory(cleanSymbol, selectedPeriod),
      ]);

      setIsStreaming(true);

      const streamResultPromise = settlePromise(
        streamMarketAgent(
          {
            symbol: cleanSymbol,
            question: cleanQuestion,
          },
          (event) => {
            if (event.type === "status") {
              setStatusMessages((previous) => [...previous, event.message]);
            }

            if (event.type === "tools") {
              setStatusMessages((previous) => [...previous, event.message]);
            }

            if (event.type === "token") {
              finalAnswerBuffer += event.content;
              setStreamedAnswer(finalAnswerBuffer);
            }

            if (event.type === "done") {
              setResult({
                symbol: event.symbol,
                question: event.question,
                answer: finalAnswerBuffer,
                tools_used: event.tools_used,
                trace: event.trace,
                metadata: event.metadata,
              });

              setStatusMessages((previous) => [
                ...previous,
                "Final response completed.",
              ]);
            }

            if (event.type === "error") {
              setErrorMessage(event.message);
            }
          }
        )
      );

      const [snapshotResponse, historyResponse] = await dashboardPromise;

      setSnapshot(snapshotResponse);
      setHistory(historyResponse);
      setIsLoadingDashboard(false);

      const streamResult = await streamResultPromise;

      if (!streamResult.ok) {
        throw streamResult.error;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setErrorMessage(message);
    } finally {
      setIsLoadingDashboard(false);
      setIsStreaming(false);
    }
  }

  function applyExampleQuestion(example: string) {
    setQuestion(example);
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-[420px_1fr]">
      <aside className="premium-card h-fit rounded-[2rem] p-6 lg:sticky lg:top-6">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-cyan-300" />
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
              Ask Agent
            </p>
          </div>

          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Research any stock using live tools
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            The dashboard fetches market data, while the LangGraph agent streams
            the final explanation progressively.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Stock Symbol
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                value={symbol}
                onChange={(event) => setSymbol(event.target.value)}
                placeholder="AAPL, TSLA, NVDA, TCS.NS"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              For Indian stocks, use .NS format, example: RELIANCE.NS
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Your Question
            </label>

            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              rows={6}
              placeholder="Ask about price, financial health, dividends, risks..."
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
            />
          </div>

          <div className="space-y-3">
  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
    Quick Stocks
  </p>

  <div className="grid grid-cols-2 gap-2">
    {sampleStocks.map((stock) => (
      <button
        type="button"
        key={stock.symbol}
        onClick={() => setSymbol(stock.symbol)}
        className={`rounded-2xl border px-3 py-3 text-left transition ${
          symbol.trim().toUpperCase() === stock.symbol
            ? "border-cyan-300/50 bg-cyan-300/10 text-cyan-100"
            : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-cyan-300/40 hover:bg-cyan-300/10"
        }`}
      >
        <span className="block text-sm font-medium">{stock.symbol}</span>
        <span className="mt-1 block text-xs text-slate-500">
          {stock.name} · {stock.market}
        </span>
      </button>
    ))}
  </div>
</div>

<div className="space-y-3">
  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
    Chart Period
  </p>

  <div className="grid grid-cols-5 gap-2">
    {chartPeriods.map((period) => (
      <button
        type="button"
        key={period.value}
        onClick={() => setSelectedPeriod(period.value)}
        className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
          selectedPeriod === period.value
            ? "border-violet-300/50 bg-violet-300/10 text-violet-100"
            : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-violet-300/40 hover:bg-violet-300/10"
        }`}
      >
        {period.label}
      </button>
    ))}
  </div>
</div>

<div className="space-y-2">
  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
    Try Prompts
  </p>

  <div className="flex flex-wrap gap-2">
  {promptTemplates.map((example) => (
    <button
      type="button"
      key={example}
      onClick={() => applyExampleQuestion(example)}
      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100"
    >
      {example}
    </button>
  ))}
</div>
</div>

          {errorMessage && (
            <div className="flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl shadow-blue-950/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isBusy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Streaming Insight...
              </>
            ) : (
              <>
                Generate Streaming Insight
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </aside>

      <section>
                {isLoadingDashboard && !snapshot && !history ? (
          <DashboardSkeleton />
        ) : (
          <MarketDashboard snapshot={snapshot} history={history} />
        )}

        <StreamingStatus
          statusMessages={statusMessages}
          isStreaming={isStreaming}
        />

       {streamedAnswer || isStreaming ? (
  <StreamingAnswerCard
    symbol={symbol}
    question={question}
    streamedAnswer={streamedAnswer}
    isStreaming={isStreaming}
    result={result}
  />
) : result ? (
  <AnswerCard result={result} />
) : !isLoadingDashboard ? (
  <EmptyState />
) : null}
      </section>
    </main>
  );
}
