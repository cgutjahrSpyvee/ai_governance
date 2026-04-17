import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError } from "@/lib/rbac";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const metrics = await db.biasMetric.findMany({
      include: { model: { select: { name: true, externalId: true } } },
    });
    // Flatten the shape the frontend expects
    const flattened = metrics.map((m) => ({
      id: m.id,
      model: m.model.name,
      metric: m.metric,
      group: m.group,
      value: m.value,
      threshold: m.threshold,
      status: m.status,
    }));
    return Response.json(flattened);
  } catch (e) {
    return handleHttpError(e);
  }
}
