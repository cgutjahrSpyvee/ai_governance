import { getSession } from "@/lib/session";
import { handleHttpError, requireSuperAdmin } from "@/lib/rbac";
import { getEngineCallLog, engineConfigured, type EngineCallRecord } from "@/lib/engine/client";

export interface EngineLogPayload {
  calls: EngineCallRecord[];
  configured: boolean;
  /** Base host only — the API key is never exposed. */
  baseUrl: string;
}

// Platform-level operational telemetry: the engine is a single shared backend,
// not per-tenant data. Restricted to SUPER_ADMIN both here and by middleware,
// which already gates the /api/admin prefix.
export async function GET() {
  try {
    const session = await getSession();
    requireSuperAdmin(session);

    let baseUrl = "";
    try {
      baseUrl = process.env.ENGINE_BASE_URL ? new URL(process.env.ENGINE_BASE_URL).host : "";
    } catch {
      baseUrl = "";
    }

    return Response.json({
      calls: getEngineCallLog(),
      configured: engineConfigured(),
      baseUrl,
    } satisfies EngineLogPayload);
  } catch (e) {
    return handleHttpError(e);
  }
}
