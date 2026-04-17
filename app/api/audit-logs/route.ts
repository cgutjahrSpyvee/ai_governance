import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const logs = await db.auditLog.findMany({ orderBy: { timestamp: "desc" }, take: 100 });
    return Response.json(logs);
  } catch (e) {
    return handleHttpError(e);
  }
}
