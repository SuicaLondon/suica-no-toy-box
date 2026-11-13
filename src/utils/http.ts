/** Helpers for route handlers. */
import { tryCatch } from "./try-catch";

/** A JSON error the page can show, never cached. */
export function errorResponse(message: string, status: number): Response {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

/**
 * True when the request comes from this site, or from no browser page at all
 * (no Origin header). Refuses other sites, which could otherwise spend this
 * site's API credit or server time.
 *
 * Compares against the Host header: behind a proxy, Next.js can rewrite
 * request.url to localhost while Host keeps the address the browser used.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const host = request.headers.get("host") ?? new URL(request.url).host;
  // A malformed Origin, or "null" from a sandboxed page, never matches.
  const { data: url } = tryCatch(() => new URL(origin));
  return url?.host === host;
}
