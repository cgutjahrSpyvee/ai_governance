import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  hrModels,
  regulations,
  biasMetrics,
  incidents,
  auditLogs,
  performanceData,
  payEquityData,
  hiringFunnel,
  policies,
} from "../lib/mock-data";

const prisma = new PrismaClient();

const SEED_PASSWORD = process.env.SEED_PASSWORD || "password123";

type OrgSpec = {
  slug: string;
  name: string;
  admins: { email: string; name: string }[];
  viewers: { email: string; name: string }[];
  // Optional variation factor to slightly differentiate data between orgs
  variation: number;
};

const orgs: OrgSpec[] = [
  {
    slug: "acme-corp",
    name: "Acme Corp",
    admins: [{ email: "admin@acme-corp.com", name: "Lisa Wang" }],
    viewers: [{ email: "viewer@acme-corp.com", name: "Tom Brooks" }],
    variation: 1.0,
  },
  {
    slug: "globex",
    name: "Globex Industries",
    admins: [{ email: "admin@globex.com", name: "Raj Patel" }],
    viewers: [{ email: "viewer@globex.com", name: "Amy Chen" }],
    variation: 0.85,
  },
];

async function seedOrg(spec: OrgSpec) {
  const org = await prisma.organization.upsert({
    where: { slug: spec.slug },
    update: { name: spec.name },
    create: { slug: spec.slug, name: spec.name },
  });

  // Create users
  const pwHash = await bcrypt.hash(SEED_PASSWORD, 10);
  for (const u of spec.admins) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password: pwHash,
        role: "ADMIN",
        organizationId: org.id,
      },
    });
  }
  for (const u of spec.viewers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password: pwHash,
        role: "VIEWER",
        organizationId: org.id,
      },
    });
  }

  // Wipe existing tenant data so the seed is idempotent
  await prisma.biasMetric.deleteMany({ where: { organizationId: org.id } });
  await prisma.incident.deleteMany({ where: { organizationId: org.id } });
  await prisma.hRModel.deleteMany({ where: { organizationId: org.id } });
  await prisma.regulation.deleteMany({ where: { organizationId: org.id } });
  await prisma.auditLog.deleteMany({ where: { organizationId: org.id } });
  await prisma.performanceData.deleteMany({ where: { organizationId: org.id } });
  await prisma.payEquityData.deleteMany({ where: { organizationId: org.id } });
  await prisma.hiringFunnelStage.deleteMany({ where: { organizationId: org.id } });
  await prisma.policy.deleteMany({ where: { organizationId: org.id } });

  // HR Models
  for (const m of hrModels) {
    await prisma.hRModel.create({
      data: {
        organizationId: org.id,
        externalId: m.id,
        name: m.name,
        function: m.function,
        riskTier: m.riskTier,
        vendor: m.vendor,
        owner: m.owner,
        status: m.status,
        lastAudit: new Date(m.lastAudit),
        fairnessScore: Math.min(1, Math.max(0, m.fairnessScore * spec.variation + (1 - spec.variation) * 0.5)),
        candidatesProcessed: m.candidatesProcessed,
        description: m.description,
      },
    });
  }

  // Bias Metrics
  for (const b of biasMetrics) {
    // Find model externalId by name
    const model = hrModels.find((m) => m.name === b.model);
    if (!model) continue;
    await prisma.biasMetric.create({
      data: {
        organizationId: org.id,
        modelExternalId: model.id,
        metric: b.metric,
        group: b.group,
        value: Math.min(1, b.value * spec.variation + (1 - spec.variation) * 0.5),
        threshold: b.threshold,
        status: b.status,
      },
    });
  }

  // Regulations
  for (const r of regulations) {
    await prisma.regulation.create({
      data: {
        organizationId: org.id,
        name: r.name,
        shortName: r.shortName,
        compliance: Math.round(r.compliance * spec.variation),
        status: r.status,
        deadline: new Date(r.deadline),
        requirements: r.requirements,
        completed: Math.round(r.completed * spec.variation),
        category: r.category,
      },
    });
  }

  // Incidents
  for (const i of incidents) {
    const model = i.affectedModel ? hrModels.find((m) => m.name === i.affectedModel) : null;
    await prisma.incident.create({
      data: {
        organizationId: org.id,
        externalId: i.id,
        title: i.title,
        severity: i.severity,
        status: i.status,
        category: i.category,
        reportedDate: new Date(i.reportedDate),
        resolvedDate: i.resolvedDate ? new Date(i.resolvedDate) : null,
        assignedTo: i.assignedTo,
        affectedModelExternalId: model?.id,
        description: i.description,
      },
    });
  }

  // Audit Logs
  for (const a of auditLogs) {
    await prisma.auditLog.create({
      data: {
        organizationId: org.id,
        timestamp: new Date(a.timestamp),
        event: a.event,
        category: a.category,
        severity: a.severity,
        affectedCount: a.affectedCount,
        details: a.details,
      },
    });
  }

  // Performance Data
  for (const p of performanceData) {
    await prisma.performanceData.create({
      data: {
        organizationId: org.id,
        department: p.department,
        avgAIScore: p.avgAIScore,
        avgManagerScore: p.avgManagerScore,
        overrideRate: p.overrideRate,
        employeeCount: Math.round(p.employeeCount * spec.variation),
        maleAvg: p.maleAvg,
        femaleAvg: p.femaleAvg,
        calibrated: p.calibrated,
      },
    });
  }

  // Pay Equity
  for (const pe of payEquityData) {
    await prisma.payEquityData.create({
      data: {
        organizationId: org.id,
        role: pe.role,
        level: pe.level,
        maleMedian: pe.maleMedian,
        femaleMedian: pe.femaleMedian,
        gapPercent: pe.gapPercent,
        whiteMedian: pe.whiteMedian,
        bipocMedian: pe.bipocMedian,
        ethnicGapPercent: pe.ethnicGapPercent,
        aiRecommended: pe.aiRecommended,
        actual: pe.actual,
      },
    });
  }

  // Hiring Funnel
  hiringFunnel.forEach(async (h, index) => {
    await prisma.hiringFunnelStage.create({
      data: {
        organizationId: org.id,
        stage: h.stage,
        male: Math.round(h.male * spec.variation),
        female: Math.round(h.female * spec.variation),
        nonBinary: Math.round(h.nonBinary * spec.variation),
        white: Math.round(h.white * spec.variation),
        black: Math.round(h.black * spec.variation),
        hispanic: Math.round(h.hispanic * spec.variation),
        asian: Math.round(h.asian * spec.variation),
        other: Math.round(h.other * spec.variation),
        orderIndex: index,
      },
    });
  });

  // Policies
  for (const p of policies) {
    await prisma.policy.create({
      data: {
        organizationId: org.id,
        externalId: p.id,
        name: p.name,
        category: p.category,
        version: p.version,
        status: p.status,
        lastReviewed: new Date(p.lastReviewed),
        nextReview: new Date(p.nextReview),
        owner: p.owner,
        approver: p.approver,
      },
    });
  }

  console.log(`Seeded ${spec.name} (${spec.slug})`);
}

async function main() {
  // Super admin — not tied to any org
  const pwHash = await bcrypt.hash(SEED_PASSWORD, 10);
  await prisma.user.upsert({
    where: { email: "super@platform.com" },
    update: {},
    create: {
      email: "super@platform.com",
      name: "Platform Operator",
      password: pwHash,
      role: "SUPER_ADMIN",
      organizationId: null,
    },
  });
  console.log("Seeded SUPER_ADMIN: super@platform.com");

  for (const spec of orgs) {
    await seedOrg(spec);
  }

  console.log("\nDone! Default password for all accounts:", SEED_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
