const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://127.0.0.1:8057";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getBackendUrl(path: string[], requestUrl: string) {
  const sourceUrl = new URL(requestUrl);
  const backendUrl = new URL(path.join("/"), `${BACKEND_API_BASE_URL}/`);

  backendUrl.search = sourceUrl.search;

  return backendUrl;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const backendUrl = getBackendUrl(path, request.url);
  const headers = new Headers();

  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  try {
    const response = await fetch(backendUrl, {
      method: request.method,
      headers,
      body: request.method === "GET" ? undefined : request.body,
      duplex: "half",
    } as RequestInit & { duplex: "half" });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch {
    return Response.json(
      {
        detail: `Could not reach the Market Insight backend at ${backendUrl.origin}. Start FastAPI on that port and try again.`,
      },
      { status: 502 }
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
