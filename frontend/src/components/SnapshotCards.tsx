import type {ElementType} from "react";

import {
  Activity,
  BadgeDollarSign,
  BarChart3,
  Building2,
  Coins,
  Landmark,
  LineChart,
  Percent,
  TrendingUp,
} from "lucide-react";

import type { StockSnapshotResponse } from "@/types/agent";
import {
  formatCompactNumber,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/format";

type SnapshotCardsProps = {
  snapshot: StockSnapshotResponse;
};

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: ElementType;
}) {
  return (
    <div className="subtle-card rounded-3xl p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>
      </div>

      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{helper}</p>
    </div>
  );
}

export function SnapshotCards({ snapshot }: SnapshotCardsProps) {
  const { company, price, key_metrics } = snapshot;
  const currency = price.currency || "USD";

  return (
    <section className="space-y-5">
      <div className="premium-card rounded-[2rem] p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-cyan-300" />
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
                Company Snapshot
              </p>
            </div>

            <h2 className="text-3xl font-semibold text-white">
              {company.name || snapshot.symbol}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {company.sector && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
                  {company.sector}
                </span>
              )}

              {company.industry && (
                <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                  {company.industry}
                </span>
              )}

              <span className="rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1 text-xs text-violet-100">
                {snapshot.symbol}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-5">
            <p className="text-sm text-slate-400">Current Price</p>
            <p className="mt-2 text-4xl font-semibold text-white">
              {formatCurrency(price.current_price, currency)}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Previous close: {formatCurrency(price.previous_close, currency)}
            </p>
          </div>
        </div>

        {company.summary && (
          <p className="mt-6 line-clamp-4 text-sm leading-7 text-slate-400">
            {company.summary}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Market Cap"
          value={formatCompactNumber(
            key_metrics.market_cap || price.market_cap
          )}
          helper="Total market value of the company."
          icon={Landmark}
        />

        <MetricCard
          label="Trailing PE"
          value={formatNumber(key_metrics.trailing_pe)}
          helper="Price compared to past earnings."
          icon={Percent}
        />

        <MetricCard
          label="EPS"
          value={formatNumber(key_metrics.eps)}
          helper="Earnings generated per share."
          icon={Coins}
        />

        <MetricCard
          label="Revenue Growth"
          value={formatPercent(key_metrics.revenue_growth)}
          helper="Recent business growth signal."
          icon={TrendingUp}
        />

        <MetricCard
          label="Profit Margin"
          value={formatPercent(key_metrics.profit_margins)}
          helper="How much revenue becomes profit."
          icon={BadgeDollarSign}
        />

        <MetricCard
          label="52W High"
          value={formatCurrency(key_metrics.fifty_two_week_high, currency)}
          helper="Highest price in last 52 weeks."
          icon={BarChart3}
        />

        <MetricCard
          label="52W Low"
          value={formatCurrency(key_metrics.fifty_two_week_low, currency)}
          helper="Lowest price in last 52 weeks."
          icon={LineChart}
        />

        <MetricCard
          label="Beta"
          value={formatNumber(key_metrics.beta)}
          helper="Volatility compared to market."
          icon={Activity}
        />
      </div>
    </section>
  );
}