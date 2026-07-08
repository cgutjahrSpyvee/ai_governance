import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, HttpError } from "@/lib/rbac";
import { computeCertification } from "@/lib/certification-engine";
import { prisma } from "@/lib/prisma";
import {
  syncBiasMetrics,
  createCertificationIncident,
  syncComplianceRegulation,
  syncHiringFunnel,
  logIntegrationEvent,
} from "@/lib/screening-integration";
import { auditCertificationSaved } from "@/lib/screening-audit";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);

    const req = await db.jobRequisition.findFirst({ where: { id } });
    if (!req) throw new HttpError(404, "Requisition not found");

    const results = await db.screeningResult.findMany({ where: { requisitionId: id } });
    const cert = computeCertification(results as any, id, req.title);
    return Response.json(cert);
  } catch (e) {
    return handleHttpError(e);
  }
}

// POST — persist certification snapshot AND sync all dashboard tables
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);

    const req = await db.jobRequisition.findFirst({ where: { id } });
    if (!req) throw new HttpError(404, "Requisition not found");

    const results = await db.screeningResult.findMany({ where: { requisitionId: id } });
    const cert = computeCertification(results as any, id, req.title);

    // 1. Save certification snapshot
    const snapshot = await prisma.certificationSnapshot.create({
      data: {
        organizationId: session.organizationId,
        requisitionId: id,
        totalScreened: cert.totalScreened,
        biasAlertRate: cert.biasAlertRate,
        reviewRequiredRate: cert.reviewRequiredRate,
        reviewCompletionRate: cert.reviewCompletionRate,
        adverseImpactRatio: cert.adverseImpactRatio,
        scoreVariance: cert.scoreVariance,
        recommendationDist: JSON.stringify(cert.recommendationDist),
        passed: cert.passed,
        metricResults: JSON.stringify(cert.metrics),
        generatedBy: session.email,
      },
    });

    // 2–5. Sync to dashboard tables (fire-and-forget — don't fail the response)
    // Audit entry first (most critical — captures what was certified)
    await auditCertificationSaved({
      organizationId: session.organizationId,
      requisitionId:  id,
      actorEmail:     session.email,
      actorRole:      session.role,
      cert,
      snapshotId:     snapshot.id,
    }).catch(() => {});

    const integrations = [
      syncBiasMetrics(db, cert),
      createCertificationIncident(db, cert, session.email),
      syncComplianceRegulation(db, cert),
      syncHiringFunnel(db, session.organizationId),
      logIntegrationEvent(
        db,
        `Certification ${cert.passed ? "passed" : "failed"}: ${cert.requisitionTitle}`,
        `Score: ${cert.score}%. Metrics: ${cert.metrics.filter(m => m.passed).length}/${cert.metrics.length} passed. ` +
          `${cert.totalScreened} candidates screened.`,
        session.userId
      ),
    ];

    const settled = await Promise.allSettled(integrations);
    settled.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`[certification] integration step ${i} failed:`, r.reason);
      }
    });

    return Response.json({ ...cert, snapshotId: snapshot.id }, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
