import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);

    // All results needing review — reviewRequired=true and not yet decided
    const pending = await db.screeningResult.findMany({
      where: { reviewRequired: true, humanDecision: null },
      orderBy: { createdAt: "asc" },
      include: { requisition: { select: { title: true, department: true } } },
    });

    // All decided results (for history)
    const decided = await db.screeningResult.findMany({
      where: { reviewRequired: true, humanDecision: { not: null } },
      orderBy: { humanReviewedAt: "desc" },
      take: 50,
      include: { requisition: { select: { title: true, department: true } } },
    });

    return Response.json({ pending, decided });
  } catch (e) {
    return handleHttpError(e);
  }
}
