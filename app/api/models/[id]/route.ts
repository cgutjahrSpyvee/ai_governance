import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, requireAdmin, HttpError } from "@/lib/rbac";
import { z } from "zod";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const model = await db.hRModel.findFirst({
      where: { externalId: id },
      include: { biasMetrics: true, incidents: true },
    });
    if (!model) throw new HttpError(404, "Model not found");
    return Response.json(model);
  } catch (e) {
    return handleHttpError(e);
  }
}

const updateSchema = z.object({
  name: z.string().optional(),
  function: z.string().optional(),
  riskTier: z.enum(["High", "Medium", "Low"]).optional(),
  vendor: z.string().optional(),
  owner: z.string().optional(),
  status: z.string().optional(),
  fairnessScore: z.number().min(0).max(1).optional(),
  description: z.string().optional(),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    requireAdmin(session);
    const body = updateSchema.parse(await req.json());
    const db = tenantPrisma(session.organizationId);
    const model = await db.hRModel.update({
      where: { organizationId_externalId: { organizationId: session.organizationId, externalId: id } },
      data: body,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.auditLog.create({
      data: {
        event: `Model updated: ${model.name}`,
        category: "Config Change",
        userId: session.userId,
        severity: "Info",
        details: `Updated by ${session.email}`,
      } as any,
    });
    return Response.json(model);
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    requireAdmin(session);
    const db = tenantPrisma(session.organizationId);
    const model = await db.hRModel.delete({
      where: { organizationId_externalId: { organizationId: session.organizationId, externalId: id } },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.auditLog.create({
      data: {
        event: `Model deleted: ${model.name}`,
        category: "Config Change",
        userId: session.userId,
        severity: "Warning",
        details: `Deleted by ${session.email}`,
      } as any,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return handleHttpError(e);
  }
}
