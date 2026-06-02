import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, HttpError } from "@/lib/rbac";
import { computeCertification } from "@/lib/certification-engine";
import { prisma } from "@/lib/prisma";

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

// POST — persist a certification snapshot
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

    return Response.json({ ...cert, snapshotId: snapshot.id }, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
