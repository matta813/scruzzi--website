export const dynamic = "force-dynamic";

// Liveness probe for Docker and Kubernetes.
export function GET() {
  return new Response('{"status": "ok"}', {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
