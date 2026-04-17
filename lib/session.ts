import { auth } from "./auth";
import { HttpError, type SessionUser, type Role } from "./rbac";

/**
 * Returns the current session or null. Use in public or conditional routes.
 */
export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    role: session.user.role as Role,
    organizationId: session.user.organizationId,
    organizationSlug: session.user.organizationSlug,
    organizationName: session.user.organizationName,
  };
}

/**
 * Returns a session that is guaranteed to have an organizationId.
 * Throws 401 if not authenticated, 403 if SUPER_ADMIN without impersonation.
 */
export async function getTenantSession(): Promise<SessionUser & { organizationId: string }> {
  const session = await getSession();
  if (!session) throw new HttpError(401, "Unauthorized");
  if (!session.organizationId) {
    throw new HttpError(
      403,
      "No organization context. Super admins must impersonate an organization to access tenant data.",
    );
  }
  return session as SessionUser & { organizationId: string };
}
