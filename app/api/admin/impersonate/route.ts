import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { handleHttpError, requireSuperAdmin } from "@/lib/rbac";
import { z } from "zod";

const schema = z.object({
  organizationId: z.string().nullable(),
});

// NOTE: the actual session update happens client-side via useSession().update().
// This route just validates the target org and writes audit logs.
export async function POST(req: Request) {
  try {
    const session = await getSession();
    requireSuperAdmin(session);
    const body = schema.parse(await req.json());

    if (body.organizationId) {
      const org = await prisma.organization.findUnique({ where: { id: body.organizationId } });
      if (!org) return Response.json({ error: "Organization not found" }, { status: 404 });

      // Audit log in the target org
      await prisma.auditLog.create({
        data: {
          organizationId: org.id,
          event: `Super admin impersonation started: ${session.email}`,
          category: "Access Review",
          userId: session.userId,
          severity: "Warning",
          details: `Super admin ${session.email} entered org context`,
        },
      });
      return Response.json({ organization: org });
    } else {
      // Ending impersonation
      return Response.json({ ok: true });
    }
  } catch (e) {
    return handleHttpError(e);
  }
}
