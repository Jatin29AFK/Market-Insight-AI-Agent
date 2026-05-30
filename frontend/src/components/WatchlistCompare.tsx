"use client";

import { FormEvent, useMemo, useState } from "react";
import { AlertCircle, BarChart3, Loader2, Plus, X } from "lucide-react";

import { compareStocks } from "@/lib/api";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/format";
import type { CompareStockRecord, CompareStocksResponse } from "@/types/compare";

const QUICK_SYMBOLS = ["AAPL", "MSFT", "NVDA", "TSLA", "TCS.NS", "RELIANCE.NS"];
const MAX_SYMBOLS = 5;

function normalizeSymbol(symbol: string) {
  return symbol.trim().toUpperCase();
}

function MetricValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}

function CompareCard({ stock }: { stock: CompareStockRecord }) {
  const currency = stock.currency || "USD";

  if (stock.error) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
        <div className="mb-3 flex items-center gap-2 text-red-200">
          <AlertCircle className="h-4 w-4" />
          <h3 className="font-medium">{stock.symbol}</h3>
        </div>
        <p className="text-sm leading-6 text-red-100/80">{stock.error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
            {stock.symbol}
          </p>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-white">
            {stock.company_name || stock.symbol}
          </h3>
        </div>
        <p className="text-right text-lg font-semibold text-white">
          {formatCurrency(stock.current_price, currency)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <MetricValue label="Market Cap" value={formatCompactNumber(stock.market_cap)} />
        <MetricValue label="PE" value={formatNumber(stock.trailing_pe)} />
        <MetricValue label="EPS" value={formatNumber(stock.eps)} />
        <MetricValue label="Revenue Growth" value={formatPercent(stock.revenue_growth)} />
        <MetricValue label="Profit Margin" value={formatPercent(stock.profit_margins)} />
        <MetricValue label="Beta" value={formatNumber(stock.beta)} />
      </div>
    </div>
  );
}

export function WatchlistCompare() {
  const [symbols, setSymbols] = useState<string[]>(["AAPL", "MSFT"]);
  const [symbolInput, setSymbolInput] = useState("");
  const [comparison, setComparison] = useState<CompareStocksResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const canAddMore = symbols.length < MAX_SYMBOLS;

  const successfulCount = useMemo(
    () => comparison?.stocks.filter((stock) => !stock.error).length || 0,
    [comparison]
  );

  function addSymbol(symbol: string) {
    const normalized = normalizeSymbol(symbol);

    if (!normalized) {
      setErrorMessage("Enter a ticker symbol first.");
      return;
    }

    if (symbols.includes(normalized)) {
      setErrorMessage(`${normalized} is already in your watchlist.`);
      return;
    }

    if (!canAddMore) {
      setErrorMessage("You can compare up to 5 stocks at a time.");
      return;
    }

    setSymbols((previous) => [...previous, normalized]);
    setSymbolInput("");
    setErrorMessage("");
  }

  function removeSymbol(symbol: string) {
    setSymbols((previous) => previous.filter((item) => item !== symbol));
    setComparison(null);
  }

  async function handleCompare() {
    if (symbols.length < 2) {
      setErrorMessage("Add at least 2 stock symbols to compare.");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage("");
      const response = await compareStocks(symbols);
      setComparison(response);
    } catch (error) {
      setComparison(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not compare stocks right now."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addSymbol(symbolInput);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-12">
      <div className="premium-card rounded-[2rem] p-6 md:p-8">
        <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-cyan-300" />
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
                Watchlist Compare
              </p>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Compare up to five stocks side by side
            </h2>
          </div>

          <form onSubmit={handleAddSubmit} className="flex flex-col gap-3 sm:flex-row">
            <input
              value={symbolInput}
              onChange={(event) => setSymbolInput(event.target.value)}
              placeholder="Add symbol"
              className="min-h-11 rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
            />
            <button
              type="submit"
              disabled={!canAddMore}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 px-4 text-sm font-medium text-cyan-100 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {QUICK_SYMBOLS.map((quickSymbol) => (
            <button
              type="button"
              key={quickSymbol}
              onClick={() => addSymbol(quickSymbol)}
              disabled={symbols.includes(quickSymbol) || !canAddMore}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300 transition hover:border-cyan-300/40 hover:bg-cyan-300/10 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {quickSymbol}
            </button>
          ))}
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {symbols.map((selectedSymbol) => (
            <span
              key={selectedSymbol}
              className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-sm text-violet-100"
            >
              {selectedSymbol}
              <button
                type="button"
                onClick={() => removeSymbol(selectedSymbol)}
                className="rounded-full p-0.5 text-violet-100/80 transition hover:bg-white/10 hover:text-white"
                aria-label={`Remove ${selectedSymbol}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>

        {errorMessage && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-200">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{errorMessage}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleCompare}
          disabled={isLoading}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-5 text-sm font-semibold text-white shadow-2xl shadow-blue-950/40 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Comparing...
            </>
          ) : (
            <>
              <BarChart3 className="h-4 w-4" />
              Compare Stocks
            </>
          )}
        </button>

        <div className="mt-8">
          {comparison ? (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span>{successfulCount} loaded</span>
                <span>{comparison.summary.failed_count || 0} unavailable</span>
              </div>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {comparison.stocks.map((stock) => (
                  <CompareCard key={stock.symbol} stock={stock} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
              Add 2-5 symbols and run a comparison to see valuation, growth,
              margin, volatility, and price metrics here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
