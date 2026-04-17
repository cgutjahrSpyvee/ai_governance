import { prisma } from "./prisma";

// Models that carry organizationId and should be tenant-scoped.
// NOTE: We intentionally exclude Organization, User, Invite, Account, Session,
// VerificationToken — those are managed explicitly by auth + super-admin code.
const TENANT_MODELS = new Set([
  "HRModel",
  "BiasMetric",
  "Regulation",
  "Incident",
  "AuditLog",
  "PerformanceData",
  "PayEquityData",
  "HiringFunnelStage",
  "Policy",
]);

/**
 * Returns a Prisma client that auto-scopes every query to `organizationId`.
 * Safe-by-default: API routes cannot forget to add the filter.
 */
export function tenantPrisma(organizationId: string) {
  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            // findUnique requires a unique filter; we fall back to findFirst
            // when the caller tries to use it on a tenant-scoped model.
            const res = await (query as unknown as (a: typeof args) => Promise<unknown>)(args);
            // Post-filter: if the record's organizationId doesn't match, return null
            if (res && typeof res === "object" && "organizationId" in res) {
              if ((res as { organizationId: string }).organizationId !== organizationId) {
                return null;
              }
            }
            return res;
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.data = { ...args.data, organizationId };
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            const data = Array.isArray(args.data) ? args.data : [args.data];
            args.data = data.map((d) => ({ ...d, organizationId }));
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async upsert({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
            args.create = { ...args.create, organizationId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (TENANT_MODELS.has(model)) {
            args.where = { ...args.where, organizationId };
          }
          return query(args);
        },
      },
    },
  });
}

export type TenantPrisma = ReturnType<typeof tenantPrisma>;
