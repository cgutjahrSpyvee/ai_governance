import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const data = await db.payEquityData.findMany();
    return Response.json(data);
  } catch (e) {
    return handleHttpError(e);
  }
}
