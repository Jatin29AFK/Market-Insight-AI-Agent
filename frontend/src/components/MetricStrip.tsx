import { Bot, ChartCandlestick, Network, ShieldCheck } from "lucide-react";

const metrics = [
  {
    label: "Agent Workflow",
    value: "LangGraph",
    icon: Network,
  },
  {
    label: "Market Data",
    value: "yFinance",
    icon: ChartCandlestick,
  },
  {
    label: "AI Layer",
    value: "Groq LLM",
    icon: Bot,
  },
  {
    label: "Safety",
    value: "Grounded",
    icon: ShieldCheck,
  },
];

export function MetricStrip() {
  return (
    <section className="grid gap-4 md:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <div key={metric.label} className="subtle-card rounded-3xl p-5">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
              <Icon className="h-5 w-5 text-cyan-300" />
            </div>

            <p className="text-sm text-slate-400">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">
              {metric.value}
            </p>
          </div>
        );
      })}
    </section>
  );
}