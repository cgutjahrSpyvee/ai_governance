import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const stages = await db.hiringFunnelStage.findMany({ orderBy: { orderIndex: "asc" } });
    return Response.json(stages);
  } catch (e) {
    return handleHttpError(e);
  }
}
