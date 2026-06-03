import { getTenantSession } from "@/lib/session";
import { handleHttpError, HttpError } from "@/lib/rbac";
import { getAuditTrail } from "@/lib/screening-audit";
import { tenantPrisma } from "@/lib/tenant-prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);

    // Verify the requisition belongs to this org
    const req = await db.jobRequisition.findFirst({ where: { id } });
    if (!req) throw new HttpError(404, "Requisition not found");

    const trail = await getAuditTrail(session.organizationId, id);
    return Response.json(trail);
  } catch (e) {
    return handleHttpError(e);
  }
}
