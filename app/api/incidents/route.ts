import { getTenantSession } from "@/lib/session";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { handleHttpError, requireAdmin } from "@/lib/rbac";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getTenantSession();
    const db = tenantPrisma(session.organizationId);
    const incidents = await db.incident.findMany({ orderBy: { reportedDate: "desc" } });
    return Response.json(incidents);
  } catch (e) {
    return handleHttpError(e);
  }
}

const createSchema = z.object({
  externalId: z.string().min(1),
  title: z.string().min(1),
  severity: z.enum(["Critical", "High", "Medium", "Low"]),
  status: z.enum(["Open", "Investigating", "Resolved", "Closed"]),
  category: z.string(),
  reportedDate: z.string(),
  assignedTo: z.string(),
  affectedModelExternalId: z.string().nullable().optional(),
  description: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await getTenantSession();
    requireAdmin(session);
    const body = createSchema.parse(await req.json());
    const db = tenantPrisma(session.organizationId);
    const incident = await db.incident.create({
      data: {
        ...body,
        reportedDate: new Date(body.reportedDate),
      },
    });
    await db.auditLog.create({
      data: {
        event: `Incident reported: ${incident.title}`,
        category: "Policy Update",
        userId: session.userId,
        severity: body.severity === "Critical" ? "Critical" : "Warning",
        details: `Reported by ${session.email}`,
      },
    });
    return Response.json(incident, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
