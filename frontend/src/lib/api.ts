import type {
  AgentChatRequest,
  AgentChatResponse,
  HistoricalDataResponse,
  StockSnapshotResponse,
  StreamEvent,
} from "@/types/agent";
import type { CompareStocksResponse } from "@/types/compare";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

const LOCAL_API_FALLBACKS = [
  "http://127.0.0.1:8057",
  "http://127.0.0.1:8001",
  "http://localhost:8000",
];

function getApiBaseUrls() {
  return [API_BASE_URL, ...LOCAL_API_FALLBACKS].filter(
    (url, index, urls) => urls.indexOf(url) === index
  );
}

function isWrongBackendNotFound(status: number, data: unknown) {
  return (
    status === 404 &&
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    data.detail === "Not Found"
  );
}

function getResponseDetail(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof data.detail === "string"
  ) {
    return data.detail;
  }

  return null;
}

async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload
): Promise<TResponse> {
  let lastError: Error | null = null;

  for (const baseUrl of getApiBaseUrls()) {
    const url = `${baseUrl}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      lastError = new Error(
        `Could not reach the backend at ${url}. Make sure the backend server is running.`
      );
      continue;
    }

    const data = await response.json();

    if (!response.ok) {
      if (isWrongBackendNotFound(response.status, data)) {
        lastError = new Error(
          `${url} is not the Market Insight backend. Tried the next local backend URL.`
        );
        continue;
      }

      throw new Error(
        getResponseDetail(data) ||
          `${response.status} ${response.statusText} while calling ${url}.`
      );
    }

    return data;
  }

  throw (
    lastError ||
    new Error("Could not reach the Market Insight backend. Is FastAPI running?")
  );
}

export async function chatWithMarketAgent(
  payload: AgentChatRequest
): Promise<AgentChatResponse> {
  return postJson<AgentChatResponse, AgentChatRequest>(
    "/api/agent/chat",
    payload
  );
}

export async function getStockSnapshot(
  symbol: string
): Promise<StockSnapshotResponse> {
  return postJson<StockSnapshotResponse, { symbol: string }>(
    "/api/stocks/snapshot",
    { symbol }
  );
}

export async function getStockHistory(
  symbol: string,
  period = "6mo"
): Promise<HistoricalDataResponse> {
  return postJson<HistoricalDataResponse, { symbol: string; period: string }>(
    "/api/stocks/history",
    { symbol, period }
  );
}

export async function compareStocks(
  symbols: string[]
): Promise<CompareStocksResponse> {
  return postJson<CompareStocksResponse, { symbols: string[] }>(
    "/api/compare/stocks",
    { symbols }
  );
}

export async function streamMarketAgent(
  payload: AgentChatRequest,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  let lastError: Error | null = null;

  for (const baseUrl of getApiBaseUrls()) {
    const url = `${baseUrl}/api/agent/chat/stream`;
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      lastError = new Error(
        `Could not reach the backend at ${url}. Make sure the backend server is running.`
      );
      continue;
    }

    if (!response.ok) {
      let message = "Streaming request failed.";
      let data: unknown = null;

      try {
        data = await response.json();
        message =
          getResponseDetail(data) ||
          `${response.status} ${response.statusText} while calling ${url}.`;
      } catch {
        // Ignore JSON parsing error for failed streaming response.
      }

      if (isWrongBackendNotFound(response.status, data)) {
        lastError = new Error(
          `${url} is not the Market Insight backend. Tried the next local backend URL.`
        );
        continue;
      }

      throw new Error(message);
    }

    if (!response.body) {
      throw new Error("Browser does not support response streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");

      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          continue;
        }

        try {
          const event = JSON.parse(trimmedLine) as StreamEvent;
          onEvent(event);
        } catch {
          console.error("Failed to parse stream line:", trimmedLine);
        }
      }
    }

    if (buffer.trim()) {
      try {
        const event = JSON.parse(buffer.trim()) as StreamEvent;
        onEvent(event);
      } catch {
        console.error("Failed to parse final stream buffer:", buffer);
      }
    }

    return;
  }

  throw (
    lastError ||
    new Error("Could not reach the Market Insight backend. Is FastAPI running?")
  );
}
