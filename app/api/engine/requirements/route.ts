import { getTenantSession } from "@/lib/session";
import { handleHttpError } from "@/lib/rbac";
import {
  engineConfigured,
  resolveRequirements,
  EngineError,
  type ResolvedRequirements,
} from "@/lib/engine/client";

/**
 * Deployment footprint the dashboard resolves requirements against.
 * Configurable per environment; surfaced in the UI so it is never implicit.
 */
const DEFAULT_US_STATES = (process.env.ENGINE_FOOTPRINT_US_STATES ?? "US-CA,US-NY,US-TX,US-FL")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const DEFAULT_COUNTRIES = (process.env.ENGINE_FOOTPRINT_COUNTRIES ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export interface RequirementsPayload {
  requirements: ResolvedRequirements | null;
  footprint: { us_states: string[]; countries: string[]; category: string };
  engineError: string | null;
}

export async function GET(req: Request) {
  try {
    await getTenantSession();

    const url = new URL(req.url);
    const us_states = url.searchParams.get("us_states")?.split(",").filter(Boolean) ?? DEFAULT_US_STATES;
    const countries = url.searchParams.get("countries")?.split(",").filter(Boolean) ?? DEFAULT_COUNTRIES;
    const category = url.searchParams.get("category") ?? "resume_screening";
    const footprint = { us_states, countries, category };

    if (!engineConfigured()) {
      return Response.json({
        requirements: null,
        footprint,
        engineError: "Engine not configured. Set ENGINE_BASE_URL and ENGINE_API_KEY.",
      } satisfies RequirementsPayload);
    }

    try {
      const requirements = await resolveRequirements({ us_states, countries, category });
      return Response.json({ requirements, footprint, engineError: null } satisfies RequirementsPayload);
    } catch (e) {
      // Never substitute seeded canon for live legal requirements.
      const message = e instanceof EngineError ? e.message : "Engine request failed";
      return Response.json({
        requirements: null,
        footprint,
        engineError: message,
      } satisfies RequirementsPayload);
    }
  } catch (e) {
    return handleHttpError(e);
  }
}
