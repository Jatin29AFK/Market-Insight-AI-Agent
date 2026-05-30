"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle } from "lucide-react";

import type { HistoricalDataResponse } from "@/types/agent";
import { formatCurrency, formatDateLabel } from "@/lib/format";

type PriceChartProps = {
  history: HistoricalDataResponse;
  currency?: string | null;
};

export function PriceChart({ history, currency = "USD" }: PriceChartProps) {
  const chartData = history.records
    .filter((record) => record.close !== null && record.close !== undefined)
    .map((record) => ({
      date: formatDateLabel(record.date),
      close: record.close,
      volume: record.volume,
    }));

  if (!chartData.length) {
    return (
      <div className="premium-card rounded-[2rem] p-6">
        <div className="flex gap-3">
          <AlertCircle className="mt-1 h-5 w-5 text-cyan-300" />
          <div>
            <h3 className="text-lg font-semibold text-white">No Chart Data</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              No historical price data is available for this stock and period.
              Check the ticker symbol, use .NS for Indian stocks, or try a
              longer chart period.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card rounded-[2rem] p-6">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-200">
            Price Movement
          </p>
          <h3 className="mt-2 text-2xl font-semibold text-white">
            {history.symbol} · {history.period}
          </h3>
        </div>

        <p className="text-sm text-slate-400">
          Closing price trend based on historical data
        </p>
      </div>

      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148, 163, 184, 0.12)"
            />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />

            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
              tickFormatter={(value) =>
                formatCurrency(Number(value), currency || "USD")
              }
            />

            <Tooltip
              contentStyle={{
                background: "rgba(15, 23, 42, 0.96)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
              labelStyle={{
                color: "#cbd5e1",
              }}
              formatter={(value) => [
                formatCurrency(Number(value), currency || "USD"),
                "Close",
              ]}
            />

            <Area
              type="monotone"
              dataKey="close"
              stroke="#22d3ee"
              strokeWidth={3}
              fill="url(#priceGradient)"
              activeDot={{
                r: 5,
                fill: "#22d3ee",
                stroke: "#0f172a",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
