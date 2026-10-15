import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

const DEFAULT_BACKEND_API_URL = "https://gcc-intel-backend.onrender.com/api";
const UPSTREAM_TIMEOUT_MS = 55_000;

function backendTargets(): string[] {
  const targets = [
    process.env.BACKEND_API_URL,
    process.env.BACKEND_API_FALLBACK_URL,
    DEFAULT_BACKEND_API_URL,
  ]
    .map((value) => value?.trim().replace(/\/+$/, ""))
    .filter((value): value is string => Boolean(value));
  return [...new Set(targets)];
}

async function proxyRequest(request: NextRequest, context: RouteContext): Promise<Response> {
  const { path } = await context.params;
  const routePath = path.map((segment) => encodeURIComponent(segment)).join("/");

  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("accept-encoding");

  // Read the body once, outside the retry loop.
  const body =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.arrayBuffer();

  let lastNetworkError: unknown;
  for (const target of backendTargets()) {
    const url = `${target}/${routePath}${request.nextUrl.search}`;
    try {
      const upstream = await fetch(url, {
        method: request.method,
        headers,
        body,
        cache: "no-store",
        signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
        redirect: "manual",
      });

      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.delete("content-encoding");
      responseHeaders.delete("content-length");

      // Keep redirects on the proxy instead of sending the browser to the backend host.
      const location = responseHeaders.get("location");
      if (location) {
        const backendOrigin = new URL(target).origin;
        if (location.startsWith(backendOrigin)) {
          const rewritten = location
            .slice(backendOrigin.length)
            .replace(/^\/api/, "/backend-api");
          responseHeaders.set("location", rewritten);
        }
      }

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      });
    } catch (error) {
      lastNetworkError = error;
      console.warn(`Backend connection failed for ${new URL(target).host}`);
    }
  }

  console.error(
    "No configured backend could be reached",
    lastNetworkError instanceof Error ? lastNetworkError.name : "unknown error",
  );
  return Response.json(
    { detail: "The backend API could not be reached. Check the backend service and try again.", code: "backend_unavailable" },
    { status: 502 },
  );
}

export const GET = proxyRequest;
export const HEAD = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;