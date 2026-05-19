import type {
  AgentChatRequest,
  AgentChatResponse,
  HistoricalDataResponse,
  StockSnapshotResponse,
  StreamEvent,
} from "@/types/agent";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

async function postJson<TResponse, TPayload>(
  path: string,
  payload: TPayload
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;
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
    throw new Error(
      `Could not reach the backend at ${url}. Make sure the backend server is running.`
    );
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
        `${response.status} ${response.statusText} while calling ${url}.`
    );
  }

  return data;
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

export async function streamMarketAgent(
  payload: AgentChatRequest,
  onEvent: (event: StreamEvent) => void
): Promise<void> {
  const url = `${API_BASE_URL}/api/agent/chat/stream`;
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
    throw new Error(
      `Could not reach the backend at ${url}. Make sure the backend server is running.`
    );
  }

  if (!response.ok) {
    let message = "Streaming request failed.";

    try {
      const data = await response.json();
      message =
        data?.detail ||
        `${response.status} ${response.statusText} while calling ${url}.`;
    } catch {
      // Ignore JSON parsing error for failed streaming response.
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
}
