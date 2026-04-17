export type Role = "SUPER_ADMIN" | "ADMIN" | "VIEWER";

export interface SessionUser {
  userId: string;
  email: string;
  name: string | null;
  role: Role;
  organizationId: string | null;
  organizationSlug: string | null;
  organizationName: string | null;
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function requireAuth(session: SessionUser | null): asserts session is SessionUser {
  if (!session) throw new HttpError(401, "Unauthorized");
}

export function requireAdmin(session: SessionUser | null): asserts session is SessionUser {
  requireAuth(session);
  if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Admin role required");
  }
}

export function requireSuperAdmin(session: SessionUser | null): asserts session is SessionUser {
  requireAuth(session);
  if (session.role !== "SUPER_ADMIN") {
    throw new HttpError(403, "Super admin role required");
  }
}

export function requireOrg(session: SessionUser | null): asserts session is SessionUser & { organizationId: string } {
  requireAuth(session);
  if (!session.organizationId) {
    throw new HttpError(403, "No organization in session");
  }
}

export function canEdit(session: SessionUser | null): boolean {
  return session?.role === "ADMIN" || session?.role === "SUPER_ADMIN";
}

export function handleHttpError(error: unknown): Response {
  if (error instanceof HttpError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
