const LOCAL_BACKEND_URLS = [
  "http://127.0.0.1:8057",
  "http://localhost:8057",
  "http://127.0.0.1:8000",
  "http://localhost:8000",
];

function getBackendBaseUrls() {
  const configuredUrls = [
    process.env.BACKEND_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
  ].filter((url): url is string => Boolean(url));

  const candidates =
    process.env.NODE_ENV === "production"
      ? configuredUrls
      : [...configuredUrls, ...LOCAL_BACKEND_URLS];

  return Array.from(
    new Set(candidates.map((url) => url.trim().replace(/\/$/, "")))
  ).filter(Boolean);
}

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

function getBackendUrl(baseUrl: string, path: string[], requestUrl: string) {
  const sourceUrl = new URL(requestUrl);
  const backendUrl = new URL(path.join("/"), `${baseUrl}/`);

  backendUrl.search = sourceUrl.search;

  return backendUrl;
}

function shouldTryNextBackend(response: Response) {
  return response.status === 404 || response.status === 405;
}

async function proxyRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const backendBaseUrls = getBackendBaseUrls();
  const headers = new Headers();
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  for (const baseUrl of backendBaseUrls) {
    const backendUrl = getBackendUrl(baseUrl, path, request.url);

    try {
      const response = await fetch(backendUrl, {
        method: request.method,
        headers,
        body,
        duplex: body ? "half" : undefined,
      } as RequestInit & { duplex?: "half" });

      if (shouldTryNextBackend(response)) {
        await response.body?.cancel();
        continue;
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch {
      continue;
    }
  }

  return Response.json(
    {
      detail: `Could not reach the Market Insight backend. Tried: ${backendBaseUrls.join(
        ", "
      )}. Start FastAPI with: cd backend && source venv/bin/activate && uvicorn app.main:app --host 127.0.0.1 --port 8057`,
    },
    { status: 502 }
  );
}

export async function GET(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return proxyRequest(request, context);
}
