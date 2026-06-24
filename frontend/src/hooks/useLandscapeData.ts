import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type {
  Application,
  BusinessCapability,
  Relationship,
  PaginatedResponse,
  LifecycleStatus,
} from "@/types";

export function useLandscapeData() {
  const applicationsQuery = useQuery<PaginatedResponse<Application>>({
    queryKey: ["landscape", "applications"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>(
        "/applications",
        { params: { limit: 500 } }
      );
      return response.data;
    },
  });

  const capabilitiesQuery = useQuery<PaginatedResponse<BusinessCapability>>({
    queryKey: ["landscape", "business-capabilities"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<BusinessCapability>>(
        "/business-capabilities",
        { params: { limit: 500 } }
      );
      return response.data;
    },
  });

  const relationshipsAppToCapQuery = useQuery<PaginatedResponse<Relationship>>({
    queryKey: ["landscape", "relationships", "app-to-cap"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Relationship>>(
        "/relationships",
        {
          params: {
            sourceType: "Application",
            targetType: "BusinessCapability",
          },
        }
      );
      return response.data;
    },
  });

  const relationshipsCapToAppQuery = useQuery<PaginatedResponse<Relationship>>({
    queryKey: ["landscape", "relationships", "cap-to-app"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Relationship>>(
        "/relationships",
        {
          params: {
            sourceType: "BusinessCapability",
            targetType: "Application",
          },
        }
      );
      return response.data;
    },
  });

  const applications = (applicationsQuery.data?.data ?? []).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const capabilities = (capabilitiesQuery.data?.data ?? []).sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  // Build lookup map: appId-capId → app's lifecycle status
  const statusMap = new Map<string, LifecycleStatus>();

  const appToCapRelationships = relationshipsAppToCapQuery.data?.data ?? [];
  const capToAppRelationships = relationshipsCapToAppQuery.data?.data ?? [];

  const appMap = new Map(applications.map((app) => [app.id, app]));

  for (const rel of appToCapRelationships) {
    const appId = rel.sourceApplicationId;
    const capId = rel.targetBusinessCapabilityId;
    if (appId && capId) {
      const app = appMap.get(appId);
      if (app) {
        statusMap.set(`${appId}-${capId}`, app.lifecycleStatus);
      }
    }
  }

  for (const rel of capToAppRelationships) {
    const appId = rel.targetApplicationId;
    const capId = rel.sourceBusinessCapabilityId;
    if (appId && capId) {
      const app = appMap.get(appId);
      if (app) {
        statusMap.set(`${appId}-${capId}`, app.lifecycleStatus);
      }
    }
  }

  const getStatus = (appId: string, capId: string): LifecycleStatus | null => {
    return statusMap.get(`${appId}-${capId}`) ?? null;
  };

  const isLoading =
    applicationsQuery.isLoading ||
    capabilitiesQuery.isLoading ||
    relationshipsAppToCapQuery.isLoading ||
    relationshipsCapToAppQuery.isLoading;

  return {
    applications,
    capabilities,
    getStatus,
    isLoading,
  };
}
