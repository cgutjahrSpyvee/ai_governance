import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { handleHttpError, requireSuperAdmin } from "@/lib/rbac";
import { randomBytes } from "crypto";
import { z } from "zod";

export async function GET() {
  try {
    const session = await getSession();
    requireSuperAdmin(session);
    const orgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
            hrModels: true,
            incidents: true,
            auditLogs: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return Response.json(orgs);
  } catch (e) {
    return handleHttpError(e);
  }
}

const createSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and dashes"),
  name: z.string().min(1),
  adminEmail: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    requireSuperAdmin(session);
    const body = createSchema.parse(await req.json());

    const existingSlug = await prisma.organization.findUnique({ where: { slug: body.slug } });
    if (existingSlug) {
      return Response.json({ error: "Slug already in use" }, { status: 400 });
    }
    const existingAdmin = await prisma.user.findUnique({ where: { email: body.adminEmail } });
    if (existingAdmin) {
      return Response.json({ error: "Admin email already in use" }, { status: 400 });
    }

    const org = await prisma.organization.create({
      data: { slug: body.slug, name: body.name },
    });

    const token = randomBytes(24).toString("hex");
    await prisma.invite.create({
      data: {
        email: body.adminEmail,
        role: "ADMIN",
        token,
        organizationId: org.id,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    const inviteUrl = `${process.env.APP_URL || "http://localhost:3000"}/accept-invite/${token}`;
    console.log(`\n📧 ADMIN INVITE for new org "${org.name}" → ${body.adminEmail}:\n   ${inviteUrl}\n`);

    return Response.json({ organization: org, inviteUrl }, { status: 201 });
  } catch (e) {
    return handleHttpError(e);
  }
}
