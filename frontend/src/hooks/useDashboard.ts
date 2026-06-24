import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  PaginatedResponse,
  LifecycleStatus,
} from "@/types";

type EntityWithLifecycle = {
  id: string;
  name: string;
  lifecycleStatus: LifecycleStatus;
  lastReviewedAt: string | null;
};

export interface EntityCount {
  type: string;
  endpoint: string;
  count: number;
}

export interface LifecycleBreakdown {
  planned: number;
  active: number;
  phaseOut: number;
  deprecated: number;
  archived: number;
}

export interface StaleRecord {
  id: string;
  name: string;
  entityType: string;
  entityRoute: string;
  lifecycleStatus: LifecycleStatus;
  lastReviewedAt: string | null;
}

const ENTITY_ENDPOINTS = [
  { type: "Business Capabilities", endpoint: "business-capabilities", route: "/business-capabilities" },
  { type: "Applications", endpoint: "applications", route: "/applications" },
  { type: "Technology Components", endpoint: "technology-components", route: "/technology-components" },
  { type: "Data Objects", endpoint: "data-objects", route: "/data-objects" },
  { type: "Integrations", endpoint: "integrations", route: "/integrations" },
] as const;

export function useDashboard() {
  // Fetch total counts for all entity types
  const countsQuery = useQuery({
    queryKey: ["dashboard", "counts"],
    queryFn: async () => {
      const responses = await Promise.all(
        ENTITY_ENDPOINTS.map((entity) =>
          api.get<PaginatedResponse<unknown>>(`/${entity.endpoint}`, {
            params: { limit: 1 },
          })
        )
      );

      return ENTITY_ENDPOINTS.map((entity, index) => ({
        type: entity.type,
        endpoint: entity.endpoint,
        count: responses[index].data.meta.total,
      }));
    },
  });

  // Fetch all entities (limit=500) for lifecycle breakdown counting
  const lifecycleQuery = useQuery({
    queryKey: ["dashboard", "lifecycle"],
    queryFn: async () => {
      const responses = await Promise.all(
        ENTITY_ENDPOINTS.map((entity) =>
          api.get<PaginatedResponse<EntityWithLifecycle>>(`/${entity.endpoint}`, {
            params: { limit: 500 },
          })
        )
      );

      const breakdown: LifecycleBreakdown = {
        planned: 0,
        active: 0,
        phaseOut: 0,
        deprecated: 0,
        archived: 0,
      };

      responses.forEach((response) => {
        response.data.data.forEach((item) => {
          if (item.lifecycleStatus in breakdown) {
            breakdown[item.lifecycleStatus]++;
          }
        });
      });

      return breakdown;
    },
  });

  // Fetch stale records (sorted by lastReviewedAt asc, limit=5 per type)
  const staleQuery = useQuery({
    queryKey: ["dashboard", "stale"],
    queryFn: async () => {
      const responses = await Promise.all(
        ENTITY_ENDPOINTS.map((entity) =>
          api.get<
            PaginatedResponse<EntityWithLifecycle>
          >(`/${entity.endpoint}`, {
            params: {
              sortBy: "lastReviewedAt",
              sortOrder: "asc",
              limit: 5,
            },
          })
        )
      );

      const allStale: StaleRecord[] = [];

      responses.forEach((response, index) => {
        const entity = ENTITY_ENDPOINTS[index];
        response.data.data.forEach((item) => {
          allStale.push({
            id: item.id,
            name: item.name,
            entityType: entity.type,
            entityRoute: entity.route,
            lifecycleStatus: item.lifecycleStatus,
            lastReviewedAt: item.lastReviewedAt,
          });
        });
      });

      // Sort by lastReviewedAt ascending (nulls first = never reviewed)
      allStale.sort((a, b) => {
        if (!a.lastReviewedAt && !b.lastReviewedAt) return 0;
        if (!a.lastReviewedAt) return -1;
        if (!b.lastReviewedAt) return 1;
        return new Date(a.lastReviewedAt).getTime() - new Date(b.lastReviewedAt).getTime();
      });

      return allStale.slice(0, 5);
    },
  });

  return {
    counts: countsQuery.data ?? [],
    lifecycleBreakdown: lifecycleQuery.data ?? null,
    staleRecords: staleQuery.data ?? [],
    isLoading: countsQuery.isLoading || lifecycleQuery.isLoading || staleQuery.isLoading,
  };
}
