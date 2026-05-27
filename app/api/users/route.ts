import { getTenantSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { handleHttpError, requireAdmin } from "@/lib/rbac";
import { tenantPrisma } from "@/lib/tenant-prisma";
import { randomBytes } from "crypto";
import { z } from "zod";

// List users in the current org
export async function GET() {
  try {
    const session = await getTenantSession();
    requireAdmin(session);
    const users = await prisma.user.findMany({
      where: { organizationId: session.organizationId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    const invites = await prisma.invite.findMany({
      where: { organizationId: session.organizationId, acceptedAt: null },
      select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return Response.json({ users, invites });
  } catch (e) {
    return handleHttpError(e);
  }
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "VIEWER"]),
});

// Invite a new user (admin only)
export async function POST(req: Request) {
  try {
    const session = await getTenantSession();
    requireAdmin(session);
    const body = inviteSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return Response.json({ error: "User with this email already exists" }, { status: 400 });
    }

    const token = randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.invite.create({
      data: {
        email: body.email,
        role: body.role,
        token,
        organizationId: session.organizationId,
        expiresAt,
      },
    });

    const inviteUrl = `${process.env.APP_URL || "http://localhost:3000"}/accept-invite/${token}`;

    // Log to console in dev — would send email in prod
    console.log(`\n📧 INVITE for ${body.email} (${body.role}):`);
    console.log(`   ${inviteUrl}\n`);

    const db = tenantPrisma(session.organizationId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.auditLog.create({
      data: {
        event: `User invited: ${body.email}`,
        category: "Access Review",
        userId: session.userId,
        severity: "Info",
        details: `Role: ${body.role}, invited by ${session.email}`,
      } as any,
    });

    return Response.json({ invite, inviteUrl }, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
