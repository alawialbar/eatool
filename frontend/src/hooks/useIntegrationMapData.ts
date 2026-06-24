import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Node, Edge } from "@xyflow/react";
import api from "@/lib/api";
import type {
  Application,
  Integration,
  PaginatedResponse,
  LifecycleStatus,
} from "@/types";

const STATUS_BORDER_COLORS: Record<LifecycleStatus, string> = {
  active: "#22c55e",
  planned: "#3b82f6",
  phaseOut: "#f59e0b",
  deprecated: "#ef4444",
  archived: "#6b7280",
};

function getCircularLayout(count: number) {
  const radius = Math.max(200, count * 50);
  const centerX = 400;
  const centerY = 300;

  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / count - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

export function useIntegrationMapData(showOnlyActive: boolean = true) {
  const integrationsQuery = useQuery<PaginatedResponse<Integration>>({
    queryKey: ["integration-map", "integrations"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Integration>>(
        "/integrations",
        { params: { limit: 500 } }
      );
      return response.data;
    },
  });

  const applicationsQuery = useQuery<PaginatedResponse<Application>>({
    queryKey: ["integration-map", "applications"],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>(
        "/applications",
        { params: { limit: 500 } }
      );
      return response.data;
    },
  });

  const { nodes, edges } = useMemo(() => {
    const allIntegrations = integrationsQuery.data?.data ?? [];
    const applications = applicationsQuery.data?.data ?? [];

    const integrations = showOnlyActive
      ? allIntegrations.filter((i) => i.lifecycleStatus === "active")
      : allIntegrations;

    const appMap = new Map(applications.map((app) => [app.id, app]));

    // Collect unique app IDs that appear in integrations
    const appIds = new Set<string>();
    for (const integration of integrations) {
      if (integration.sourceApplicationId) {
        appIds.add(integration.sourceApplicationId);
      }
      if (integration.targetApplicationId) {
        appIds.add(integration.targetApplicationId);
      }
    }

    const appIdArray = Array.from(appIds);
    const positions = getCircularLayout(appIdArray.length);

    // Build nodes
    const nodes: Node[] = appIdArray.map((appId, index) => {
      const app = appMap.get(appId);
      const status: LifecycleStatus = app?.lifecycleStatus ?? "active";
      const borderColor = STATUS_BORDER_COLORS[status];

      return {
        id: appId,
        type: "custom",
        position: positions[index],
        data: {
          label: app?.name ?? "Unknown App",
          lifecycleStatus: status,
          borderColor,
        },
      };
    });

    // Build edges
    const edges: Edge[] = integrations
      .filter((i) => i.sourceApplicationId && i.targetApplicationId)
      .map((integration) => {
        const isEventBased =
          integration.pattern === "event" ||
          integration.protocol === "Kafka";

        return {
          id: integration.id,
          source: integration.sourceApplicationId!,
          target: integration.targetApplicationId!,
          label: integration.name,
          animated: isEventBased,
          markerEnd: { type: "arrowclosed" as const },
          style: { stroke: "#64748b" },
          labelStyle: { fontSize: 11 },
          labelBgStyle: {
            fill: "#ffffff",
            fillOpacity: 0.9,
          },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 4,
        };
      });

    return { nodes, edges };
  }, [integrationsQuery.data, applicationsQuery.data, showOnlyActive]);

  const isLoading =
    integrationsQuery.isLoading || applicationsQuery.isLoading;

  return { nodes, edges, isLoading };
}
