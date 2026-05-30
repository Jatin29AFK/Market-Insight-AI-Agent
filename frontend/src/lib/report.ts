import type { StockSnapshotResponse } from "@/types/agent";
import { formatCompactNumber, formatCurrency, formatNumber, formatPercent } from "@/lib/format";

type BuildMarkdownReportInput = {
  symbol?: string | null;
  question: string;
  answer: string;
  toolsUsed: string[];
  metadata?: Record<string, unknown>;
  snapshot?: StockSnapshotResponse | null;
};

function formatToolName(tool: string) {
  return tool
    .replace("_tool", "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildMarkdownReport({
  symbol,
  question,
  answer,
  toolsUsed,
  metadata,
  snapshot,
}: BuildMarkdownReportInput) {
  const reportSymbol = snapshot?.symbol || symbol || "Market";
  const currency = snapshot?.price?.currency || "USD";
  const keyMetrics = snapshot?.key_metrics;
  const price = snapshot?.price;

  return `# Market Insight AI Report

Generated date: ${new Date().toLocaleString()}

Symbol: ${reportSymbol}

Question: ${question}

## Market Data

- Current Price: ${formatCurrency(price?.current_price, currency)}
- Market Cap: ${formatCompactNumber(keyMetrics?.market_cap || price?.market_cap)}
- PE Ratio: ${formatNumber(keyMetrics?.trailing_pe)}
- EPS: ${formatNumber(keyMetrics?.eps)}
- Revenue Growth: ${formatPercent(keyMetrics?.revenue_growth)}
- Profit Margin: ${formatPercent(keyMetrics?.profit_margins)}

## AI Analysis

${answer || "No AI analysis was generated."}

## Tools Used

${toolsUsed.length ? toolsUsed.map((tool) => `- ${formatToolName(tool)}`).join("\n") : "- No external tools were reported."}

## Metadata

- Model: ${String(metadata?.llm_model || "N/A")}
- Agent Type: ${String(metadata?.agent_type || "N/A")}
- Total Messages: ${String(metadata?.total_messages || "N/A")}

## Disclaimer

This is for educational research only, not financial advice.
`;
}
