"use client";

import useSWR from "swr";
import type {
  HRModel,
  BiasMetric,
  Regulation,
  Incident,
  AuditLog,
  PerformanceData,
  PayEquityData,
  HiringFunnelStage,
  Policy,
} from "./mock-data";

const fetcher = async (url: string) => {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json()).error || "Request failed");
  return r.json();
};

// The shapes from the API mostly match mock-data types, with a few extras
// (organizationId, id fields) that we ignore in the UI.

export function useModels() {
  const { data, error, isLoading, mutate } = useSWR<(HRModel & { externalId: string })[]>(
    "/api/models",
    fetcher,
  );
  // Normalize: API uses `externalId` as the logical id
  const normalized = data?.map((m) => ({ ...m, id: m.externalId }));
  return { data: normalized, error, isLoading, mutate };
}

export function useIncidents() {
  const { data, error, isLoading, mutate } = useSWR<(Incident & { externalId: string })[]>(
    "/api/incidents",
    fetcher,
  );
  const normalized = data?.map((i) => ({ ...i, id: i.externalId }));
  return { data: normalized, error, isLoading, mutate };
}

export function useBiasMetrics() {
  return useSWR<BiasMetric[]>("/api/bias-metrics", fetcher);
}

export function useRegulations() {
  return useSWR<Regulation[]>("/api/regulations", fetcher);
}

export function useAuditLogs() {
  return useSWR<AuditLog[]>("/api/audit-logs", fetcher);
}

export function usePerformance() {
  return useSWR<PerformanceData[]>("/api/performance", fetcher);
}

export function usePayEquity() {
  return useSWR<PayEquityData[]>("/api/pay-equity", fetcher);
}

export function useHiringFunnel() {
  return useSWR<HiringFunnelStage[]>("/api/hiring-funnel", fetcher);
}

export function usePolicies() {
  return useSWR<Policy[]>("/api/policies", fetcher);
}

export function useMe() {
  return useSWR<{
    userId: string;
    email: string;
    name: string | null;
    role: "SUPER_ADMIN" | "ADMIN" | "VIEWER";
    organizationId: string | null;
    organizationSlug: string | null;
    organizationName: string | null;
  } | null>("/api/me", fetcher);
}
