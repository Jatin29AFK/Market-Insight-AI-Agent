export type AgentTraceStep = {
  step_type: string;
  name?: string | null;
  content_preview?: string | null;
};

export type AgentChatRequest = {
  symbol: string;
  question: string;
};

export type AgentChatResponse = {
  symbol?: string | null;
  question: string;
  answer: string;
  tools_used: string[];
  trace: AgentTraceStep[];
  metadata: {
    llm_model?: string;
    agent_type?: string;
    total_messages?: number;
    [key: string]: unknown;
  };
};

export type StockPriceData = {
  symbol: string;
  current_price?: number | null;
  currency?: string | null;
  previous_close?: number | null;
  day_high?: number | null;
  day_low?: number | null;
  market_cap?: number | null;
};

export type CompanyData = {
  symbol: string;
  name?: string | null;
  sector?: string | null;
  industry?: string | null;
  website?: string | null;
  summary?: string | null;
};

export type KeyMetricsData = {
  market_cap?: number | null;
  trailing_pe?: number | null;
  forward_pe?: number | null;
  eps?: number | null;
  dividend_yield?: number | null;
  profit_margins?: number | null;
  revenue_growth?: number | null;
  fifty_two_week_high?: number | null;
  fifty_two_week_low?: number | null;
  average_volume?: number | null;
  beta?: number | null;
};

export type StockSnapshotResponse = {
  symbol: string;
  company: CompanyData;
  price: StockPriceData;
  key_metrics: KeyMetricsData;
};

export type HistoricalRecord = {
  date: string;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

export type HistoricalDataResponse = {
  symbol: string;
  period: string;
  records: HistoricalRecord[];
};

export type StreamEvent =
  | {
      type: "status";
      message: string;
    }
  | {
      type: "tools";
      message: string;
      tools_used: string[];
    }
  | {
      type: "token";
      content: string;
    }
  | {
      type: "done";
      symbol?: string | null;
      question: string;
      tools_used: string[];
      trace: AgentTraceStep[];
      metadata: {
        llm_model?: string;
        agent_type?: string;
        total_messages?: number;
        [key: string]: unknown;
      };
    }
  | {
      type: "error";
      message: string;
    };