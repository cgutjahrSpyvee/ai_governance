import { getTenantSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { handleHttpError, requireAdmin, HttpError } from "@/lib/rbac";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { z } from "zod";

const updateSchema = z.object({
  role: z.enum(["ADMIN", "VIEWER"]).optional(),
  name: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    requireAdmin(session);
    const body = updateSchema.parse(await req.json());

    // Must be in same org
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== session.organizationId) {
      throw new HttpError(404, "User not found");
    }
    if (target.role === "SUPER_ADMIN") {
      throw new HttpError(403, "Cannot modify super admin");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: body,
    });
    const db = tenantPrisma(session.organizationId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.auditLog.create({
      data: {
        event: `User updated: ${updated.email}`,
        category: "Access Review",
        userId: session.userId,
        severity: "Info",
        details: `Changes: ${JSON.stringify(body)}, by ${session.email}`,
      } as any,
    });
    return Response.json({ id: updated.id, email: updated.email, name: updated.name, role: updated.role });
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getTenantSession();
    requireAdmin(session);
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.organizationId !== session.organizationId) {
      throw new HttpError(404, "User not found");
    }
    if (target.role === "SUPER_ADMIN") {
      throw new HttpError(403, "Cannot delete super admin");
    }
    if (target.id === session.userId) {
      throw new HttpError(400, "Cannot delete yourself");
    }
    await prisma.user.delete({ where: { id } });
    const db = tenantPrisma(session.organizationId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.auditLog.create({
      data: {
        event: `User removed: ${target.email}`,
        category: "Access Review",
        userId: session.userId,
        severity: "Warning",
        details: `Removed by ${session.email}`,
      } as any,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return handleHttpError(e);
  }
}
