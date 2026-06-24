import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, Link2, X, Loader2 } from "lucide-react";
import { AddRelationshipModal } from "@/components/AddRelationshipModal";
import api from "@/lib/api";
import type { Relationship, EntityType } from "@/types";

interface RelationshipPanelProps {
  entityId: string;
  entityType: EntityType;
  relationsAsSource: Relationship[];
  relationsAsTarget: Relationship[];
}

const entityTypeLabels: Record<EntityType, string> = {
  BusinessCapability: "Business Capabilities",
  Application: "Applications",
  TechnologyComponent: "Technology Components",
  DataObject: "Data Objects",
  Integration: "Integrations",
};

const entityTypeRoutes: Record<EntityType, string> = {
  BusinessCapability: "/business-capabilities",
  Application: "/applications",
  TechnologyComponent: "/technology-components",
  DataObject: "/data-objects",
  Integration: "/integrations",
};

function getTargetEntityId(rel: Relationship): string | null {
  return (
    rel.targetBusinessCapabilityId ||
    rel.targetApplicationId ||
    rel.targetTechnologyComponentId ||
    rel.targetDataObjectId ||
    rel.targetIntegrationId ||
    null
  );
}

function getSourceEntityId(rel: Relationship): string | null {
  return (
    rel.sourceBusinessCapabilityId ||
    rel.sourceApplicationId ||
    rel.sourceTechnologyComponentId ||
    rel.sourceDataObjectId ||
    rel.sourceIntegrationId ||
    null
  );
}

interface GroupedRelationship {
  id: string;
  entityType: EntityType;
  entityId: string;
  label: string | null;
  direction: "outgoing" | "incoming";
}

function groupRelationships(
  relationsAsSource: Relationship[],
  relationsAsTarget: Relationship[]
): Record<string, GroupedRelationship[]> {
  const grouped: Record<string, GroupedRelationship[]> = {};

  for (const rel of relationsAsSource) {
    const entityId = getTargetEntityId(rel);
    if (!entityId) continue;

    const group = entityTypeLabels[rel.targetType] || rel.targetType;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({
      id: rel.id,
      entityType: rel.targetType,
      entityId,
      label: rel.relationshipLabel,
      direction: "outgoing",
    });
  }

  for (const rel of relationsAsTarget) {
    const entityId = getSourceEntityId(rel);
    if (!entityId) continue;

    const group = entityTypeLabels[rel.sourceType] || rel.sourceType;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({
      id: rel.id,
      entityType: rel.sourceType,
      entityId,
      label: rel.relationshipLabel,
      direction: "incoming",
    });
  }

  return grouped;
}

export function RelationshipPanel({
  entityId,
  entityType,
  relationsAsSource,
  relationsAsTarget,
}: RelationshipPanelProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (relationshipId: string) => {
      await api.delete(`/relationships/${relationshipId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });

  const grouped = groupRelationships(relationsAsSource, relationsAsTarget);
  const hasRelationships = Object.keys(grouped).length > 0;

  return (
    <>
      <div className="rounded-lg bg-white shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-gray-500" />
            Relationships
          </h3>
        </div>

        <div className="p-4">
          {!hasRelationships ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No relationships found
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([groupName, relations]) => (
                <div key={groupName}>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    {groupName}
                  </h4>
                  <ul className="space-y-1">
                    {relations.map((rel) => (
                      <li key={rel.id} className="group flex items-center">
                        <Link
                          to={`${entityTypeRoutes[rel.entityType]}/${rel.entityId}`}
                          className="flex flex-1 items-center justify-between rounded-md px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <ArrowRight
                              className={`h-3 w-3 flex-shrink-0 ${
                                rel.direction === "incoming"
                                  ? "rotate-180 text-blue-500"
                                  : "text-green-500"
                              }`}
                            />
                            <span className="truncate">
                              {rel.label || rel.entityType}
                            </span>
                          </span>
                          <span className="text-xs text-gray-400 group-hover:text-gray-600 flex-shrink-0 ml-2">
                            View
                          </span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(rel.id)}
                          disabled={deleteMutation.isPending}
                          className="ml-1 rounded p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          aria-label="Delete relationship"
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-4 py-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Relationship
          </button>
        </div>
      </div>

      <AddRelationshipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        sourceId={entityId}
        sourceType={entityType}
      />
    </>
  );
}
