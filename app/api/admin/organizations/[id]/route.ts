import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { handleHttpError, requireSuperAdmin } from "@/lib/rbac";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    requireSuperAdmin(session);
    // Cascade takes care of all related tables
    await prisma.organization.delete({ where: { id } });
    return Response.json({ ok: true });
  } catch (e) {
    return handleHttpError(e);
  }
}
