import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const regulations = await db.regulation.findMany({ orderBy: { deadline: "asc" } });
    return Response.json(regulations);
  } catch (e) {
    return handleHttpError(e);
  }
}
