import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, requireAdmin } from "@/lib/rbac";
import { ensureScreeningModel, logIntegrationEvent } from "@/lib/screening-integration";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  department: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().min(1),
});

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const requisitions = await db.jobRequisition.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { screeningResults: true } } },
    });
    return Response.json(requisitions);
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function POST(req: Request) {
  try {
    const session = await getTenantSession();
    requireAdmin(session);
    const body = createSchema.parse(await req.json());
    const db = tenantPrisma(session.organizationId);

    const req_ = await db.jobRequisition.create({
      data: { ...body, createdBy: session.email } as any,
    });

    // Register the screening service as an HRModel in the governance dashboard
    await ensureScreeningModel(db).catch((e) =>
      console.warn("[integration] ensureScreeningModel failed:", e)
    );

    await logIntegrationEvent(
      db,
      `Requisition created: ${body.title}`,
      `New job requisition opened by ${session.email}. AI screening model registered.`,
      session.userId
    ).catch(() => {});

    return Response.json(req_, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
