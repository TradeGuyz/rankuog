/** Minimal typings for the Supabase Edge (Deno) runtime — provided at deploy/runtime; used for IDE/TypeScript. */
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined
  }
  function serve(handler: (req: Request) => Response | Promise<Response>): void
}
