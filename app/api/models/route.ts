import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, requireAdmin } from "@/lib/rbac";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const models = await db.hRModel.findMany({
      orderBy: { externalId: "asc" },
    });
    return Response.json(models);
  } catch (e) {
    return handleHttpError(e);
  }
}

const createSchema = z.object({
  externalId: z.string().min(1),
  name: z.string().min(1),
  function: z.string(),
  riskTier: z.enum(["High", "Medium", "Low"]),
  vendor: z.string(),
  owner: z.string(),
  status: z.string(),
  lastAudit: z.string(),
  fairnessScore: z.number().min(0).max(1),
  candidatesProcessed: z.number().nullable().optional(),
  description: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getTenantSession();
    requireAdmin(session);
    const body = createSchema.parse(await req.json());
    const db = tenantPrisma(session.organizationId);
    const model = await db.hRModel.create({
      data: {
        ...body,
        lastAudit: new Date(body.lastAudit),
      },
    });
    await db.auditLog.create({
      data: {
        event: `Model created: ${model.name}`,
        category: "Model Deployment",
        userId: session.userId,
        severity: "Info",
        details: `Created by ${session.email}`,
      },
    });
    return Response.json(model, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
