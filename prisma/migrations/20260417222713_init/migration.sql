-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "billingPlan" TEXT NOT NULL DEFAULT 'standard',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "image" TEXT,
    "organizationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "acceptedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invite_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HRModel" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "riskTier" TEXT NOT NULL,
    "vendor" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastAudit" DATETIME NOT NULL,
    "fairnessScore" REAL NOT NULL,
    "candidatesProcessed" INTEGER,
    "description" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,

    PRIMARY KEY ("organizationId", "externalId"),
    CONSTRAINT "HRModel_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BiasMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "modelExternalId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "threshold" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "measuredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BiasMetric_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BiasMetric_organizationId_modelExternalId_fkey" FOREIGN KEY ("organizationId", "modelExternalId") REFERENCES "HRModel" ("organizationId", "externalId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Regulation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "compliance" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "requirements" INTEGER NOT NULL,
    "completed" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    CONSTRAINT "Regulation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Incident" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "reportedDate" DATETIME NOT NULL,
    "resolvedDate" DATETIME,
    "assignedTo" TEXT NOT NULL,
    "affectedModelExternalId" TEXT,
    "description" TEXT NOT NULL,

    PRIMARY KEY ("organizationId", "externalId"),
    CONSTRAINT "Incident_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Incident_organizationId_affectedModelExternalId_fkey" FOREIGN KEY ("organizationId", "affectedModelExternalId") REFERENCES "HRModel" ("organizationId", "externalId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT,
    "severity" TEXT NOT NULL,
    "affectedCount" INTEGER NOT NULL DEFAULT 0,
    "details" TEXT NOT NULL,
    CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PerformanceData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "avgAIScore" REAL NOT NULL,
    "avgManagerScore" REAL NOT NULL,
    "overrideRate" REAL NOT NULL,
    "employeeCount" INTEGER NOT NULL,
    "maleAvg" REAL NOT NULL,
    "femaleAvg" REAL NOT NULL,
    "calibrated" BOOLEAN NOT NULL,
    CONSTRAINT "PerformanceData_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PayEquityData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "maleMedian" REAL NOT NULL,
    "femaleMedian" REAL NOT NULL,
    "gapPercent" REAL NOT NULL,
    "whiteMedian" REAL NOT NULL,
    "bipocMedian" REAL NOT NULL,
    "ethnicGapPercent" REAL NOT NULL,
    "aiRecommended" REAL NOT NULL,
    "actual" REAL NOT NULL,
    CONSTRAINT "PayEquityData_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HiringFunnelStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "male" INTEGER NOT NULL,
    "female" INTEGER NOT NULL,
    "nonBinary" INTEGER NOT NULL,
    "white" INTEGER NOT NULL,
    "black" INTEGER NOT NULL,
    "hispanic" INTEGER NOT NULL,
    "asian" INTEGER NOT NULL,
    "other" INTEGER NOT NULL,
    "orderIndex" INTEGER NOT NULL,
    CONSTRAINT "HiringFunnelStage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "organizationId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastReviewed" DATETIME NOT NULL,
    "nextReview" DATETIME NOT NULL,
    "owner" TEXT NOT NULL,
    "approver" TEXT NOT NULL,
    CONSTRAINT "Policy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_organizationId_idx" ON "Invite"("organizationId");

-- CreateIndex
CREATE INDEX "HRModel_organizationId_idx" ON "HRModel"("organizationId");

-- CreateIndex
CREATE INDEX "BiasMetric_organizationId_idx" ON "BiasMetric"("organizationId");

-- CreateIndex
CREATE INDEX "Regulation_organizationId_idx" ON "Regulation"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Regulation_organizationId_shortName_key" ON "Regulation"("organizationId", "shortName");

-- CreateIndex
CREATE INDEX "Incident_organizationId_idx" ON "Incident"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_timestamp_idx" ON "AuditLog"("organizationId", "timestamp");

-- CreateIndex
CREATE INDEX "PerformanceData_organizationId_idx" ON "PerformanceData"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceData_organizationId_department_key" ON "PerformanceData"("organizationId", "department");

-- CreateIndex
CREATE INDEX "PayEquityData_organizationId_idx" ON "PayEquityData"("organizationId");

-- CreateIndex
CREATE INDEX "HiringFunnelStage_organizationId_idx" ON "HiringFunnelStage"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "HiringFunnelStage_organizationId_stage_key" ON "HiringFunnelStage"("organizationId", "stage");

-- CreateIndex
CREATE INDEX "Policy_organizationId_idx" ON "Policy"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Policy_organizationId_externalId_key" ON "Policy"("organizationId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
