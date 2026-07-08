import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, requireAdmin, HttpError } from "@/lib/rbac";
import { auditHumanReview } from "@/lib/screening-audit";
import { z } from "zod";

const updateSchema = z.object({
  humanDecision: z.enum(["Approved", "Rejected"]).optional(),
  status: z.enum(["Pending", "Reviewed", "Decided"]).optional(),
  notes: z.string().optional(),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    requireAdmin(session);
    const body = updateSchema.parse(await req.json());
    const db = tenantPrisma(session.organizationId);

    const existing = await db.screeningResult.findFirst({ where: { id } });
    if (!existing) throw new HttpError(404, "Result not found");

    const updated = await db.screeningResult.update({
      where: { id },
      data: {
        ...body,
        humanReviewedBy: session.email,
        humanReviewedAt: new Date(),
        status: body.humanDecision ? "Decided" : body.status,
      },
    });

    // Immutable audit entry for every human review decision
    if (body.humanDecision) {
      auditHumanReview({
        organizationId:    session.organizationId,
        requisitionId:     (existing as any).requisitionId,
        screeningResultId: id,
        actorEmail:        session.email,
        actorRole:         session.role,
        decision:          body.humanDecision,
        notes:             body.notes,
        previousScore:     (existing as any).overallScore,
        recommendation:    (existing as any).recommendation,
      }).catch(() => {});
    }

    return Response.json(updated);
  } catch (e) {
    return handleHttpError(e);
  }
}
