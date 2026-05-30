export type CompareStockRecord = {
  symbol: string;
  company_name?: string | null;
  current_price?: number | null;
  currency?: string | null;
  market_cap?: number | null;
  trailing_pe?: number | null;
  eps?: number | null;
  revenue_growth?: number | null;
  profit_margins?: number | null;
  beta?: number | null;
  fifty_two_week_high?: number | null;
  fifty_two_week_low?: number | null;
  error?: string;
};

export type CompareStocksResponse = {
  stocks: CompareStockRecord[];
  summary: {
    requested_count?: number;
    successful_count?: number;
    failed_count?: number;
    successful_symbols?: string[];
    failed_symbols?: string[];
    fields?: string[];
    [key: string]: unknown;
  };
};
