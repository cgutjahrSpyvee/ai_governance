import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Public: get invite details for the accept page
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { organization: { select: { name: true } } },
  });
  if (!invite) return Response.json({ error: "Invalid invite link" }, { status: 404 });
  if (invite.acceptedAt) return Response.json({ error: "Invite already accepted" }, { status: 400 });
  if (invite.expiresAt < new Date()) return Response.json({ error: "Invite expired" }, { status: 400 });
  return Response.json({
    email: invite.email,
    role: invite.role,
    organizationName: invite.organization.name,
  });
}

const acceptSchema = z.object({
  name: z.string().min(1),
  password: z.string().min(8),
});

// Public: accept invite and create user
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const body = acceptSchema.parse(await req.json());
  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return Response.json({ error: "Invalid invite link" }, { status: 404 });
  if (invite.acceptedAt) return Response.json({ error: "Invite already accepted" }, { status: 400 });
  if (invite.expiresAt < new Date()) return Response.json({ error: "Invite expired" }, { status: 400 });

  const hashed = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({
    data: {
      email: invite.email,
      name: body.name,
      password: hashed,
      role: invite.role,
      organizationId: invite.organizationId,
    },
  });
  await prisma.invite.update({
    where: { token },
    data: { acceptedAt: new Date() },
  });
  await prisma.auditLog.create({
    data: {
      organizationId: invite.organizationId,
      event: `User joined via invite: ${invite.email}`,
      category: "Access Review",
      severity: "Info",
      details: `Role: ${invite.role}`,
    },
  });
  return Response.json({ userId: user.id });
}
