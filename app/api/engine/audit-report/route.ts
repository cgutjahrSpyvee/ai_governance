import { getTenantSession } from "@/lib/session";
import { handleHttpError } from "@/lib/rbac";
import {
  engineConfigured,
  listReports,
  getReport,
  resolveRequirements,
  EngineError,
  type AuditReport,
  type ResolvedRequirements,
} from "@/lib/engine/client";

export interface AuditReportPayload {
  report: AuditReport | null;
  /** Governing requirements resolved for the report's own vendor footprint. */
  requirements: ResolvedRequirements | null;
  availableRuns: string[];
  /** Populated when the engine is unreachable or unconfigured. */
  engineError: string | null;
}

export async function GET(req: Request) {
  try {
    // Report content is governance evidence — require an authenticated session.
    await getTenantSession();

    if (!engineConfigured()) {
      return Response.json({
        report: null,
        requirements: null,
        availableRuns: [],
        engineError: "Engine not configured. Set ENGINE_BASE_URL and ENGINE_API_KEY.",
      } satisfies AuditReportPayload);
    }

    const requested = new URL(req.url).searchParams.get("run_id");

    try {
      const listing = await listReports();
      const availableRuns = listing.reports.map((r) => r.run_id);
      const runId = requested ?? availableRuns[0];

      if (!runId) {
        return Response.json({
          report: null,
          requirements: null,
          availableRuns,
          engineError: "No audit reports available from the engine.",
        } satisfies AuditReportPayload);
      }

      const report = await getReport(runId);

      // Resolve the governing requirement for the footprint this report was run against,
      // so thresholds shown next to the impact ratios are the real governing values.
      let requirements: ResolvedRequirements | null = null;
      try {
        requirements = await resolveRequirements({
          us_states: report.vendor_footprint,
          category: report.functional_category,
        });
      } catch {
        // Non-fatal: the report still renders without the requirements panel.
        requirements = null;
      }

      return Response.json({
        report,
        requirements,
        availableRuns,
        engineError: null,
      } satisfies AuditReportPayload);
    } catch (e) {
      // Engine down / timed out — degrade gracefully instead of failing the page.
      const message = e instanceof EngineError ? e.message : "Engine request failed";
      return Response.json({
        report: null,
        requirements: null,
        availableRuns: [],
        engineError: message,
      } satisfies AuditReportPayload);
    }
  } catch (e) {
    return handleHttpError(e);
  }
}
