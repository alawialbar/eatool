import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Search, Check } from "lucide-react";
import api from "@/lib/api";
import type { EntityType } from "@/types";

interface AddRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceId: string;
  sourceType: EntityType;
}

const entityTypes: { value: EntityType; label: string }[] = [
  { value: "BusinessCapability", label: "Business Capability" },
  { value: "Application", label: "Application" },
  { value: "TechnologyComponent", label: "Technology Component" },
  { value: "DataObject", label: "Data Object" },
  { value: "Integration", label: "Integration" },
];

const entityTypeEndpoints: Record<EntityType, string> = {
  BusinessCapability: "/business-capabilities",
  Application: "/applications",
  TechnologyComponent: "/technology-components",
  DataObject: "/data-objects",
  Integration: "/integrations",
};

function getSourceField(sourceType: EntityType): string {
  switch (sourceType) {
    case "BusinessCapability":
      return "sourceBusinessCapabilityId";
    case "Application":
      return "sourceApplicationId";
    case "TechnologyComponent":
      return "sourceTechnologyComponentId";
    case "DataObject":
      return "sourceDataObjectId";
    case "Integration":
      return "sourceIntegrationId";
  }
}

function getTargetField(targetType: EntityType): string {
  switch (targetType) {
    case "BusinessCapability":
      return "targetBusinessCapabilityId";
    case "Application":
      return "targetApplicationId";
    case "TechnologyComponent":
      return "targetTechnologyComponentId";
    case "DataObject":
      return "targetDataObjectId";
    case "Integration":
      return "targetIntegrationId";
  }
}

interface TargetEntity {
  id: string;
  name: string;
}

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export function AddRelationshipModal({
  isOpen,
  onClose,
  sourceId,
  sourceType,
}: AddRelationshipModalProps) {
  const queryClient = useQueryClient();
  const [targetType, setTargetType] = useState<EntityType>("Application");
  const [targetSearch, setTargetSearch] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<TargetEntity | null>(null);
  const [relationshipLabel, setRelationshipLabel] = useState("");
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);
  const targetSearchRef = useRef<HTMLDivElement>(null);

  const debouncedTargetSearch = useDebounce(targetSearch, 300);

  // Reset form when modal opens/closes or target type changes
  useEffect(() => {
    if (!isOpen) {
      setTargetType("Application");
      setTargetSearch("");
      setSelectedTarget(null);
      setRelationshipLabel("");
      setShowTargetDropdown(false);
    }
  }, [isOpen]);

  useEffect(() => {
    setTargetSearch("");
    setSelectedTarget(null);
    setShowTargetDropdown(false);
  }, [targetType]);

  // Search for target entities
  const { data: targetResults, isLoading: isSearching } = useQuery<TargetEntity[]>({
    queryKey: ["target-search", targetType, debouncedTargetSearch],
    queryFn: async () => {
      const endpoint = entityTypeEndpoints[targetType];
      const response = await api.get(endpoint, {
        params: { search: debouncedTargetSearch, limit: 10 },
      });
      return response.data.data || response.data;
    },
    enabled: debouncedTargetSearch.length >= 1 && !selectedTarget,
  });

  // Close target dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        targetSearchRef.current &&
        !targetSearchRef.current.contains(event.target as Node)
      ) {
        setShowTargetDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTarget) return;

      const payload: Record<string, string | undefined> = {
        sourceType,
        targetType,
        relationshipLabel: relationshipLabel || undefined,
        [getSourceField(sourceType)]: sourceId,
        [getTargetField(targetType)]: selectedTarget.id,
      };

      await api.post("/relationships", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      onClose();
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (selectedTarget) {
        createMutation.mutate();
      }
    },
    [selectedTarget, createMutation]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-[480px] max-h-[80vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Add Relationship
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Entity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Entity Type
            </label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as EntityType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {entityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Entity Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Entity
            </label>
            <div className="relative" ref={targetSearchRef}>
              {selectedTarget ? (
                <div className="flex items-center justify-between rounded-md border border-gray-300 px-3 py-2">
                  <span className="flex items-center gap-2 text-sm text-gray-900">
                    <Check className="h-4 w-4 text-green-500" />
                    {selectedTarget.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTarget(null);
                      setTargetSearch("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Search
                    size={16}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={targetSearch}
                    onChange={(e) => {
                      setTargetSearch(e.target.value);
                      setShowTargetDropdown(true);
                    }}
                    onFocus={() => {
                      if (targetSearch.length >= 1) setShowTargetDropdown(true);
                    }}
                    className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />

                  {/* Target search dropdown */}
                  {showTargetDropdown && debouncedTargetSearch.length >= 1 && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-[200px] overflow-y-auto z-10">
                      {isSearching ? (
                        <div className="flex items-center justify-center py-3">
                          <Loader2
                            size={16}
                            className="animate-spin text-gray-400"
                          />
                        </div>
                      ) : !targetResults || targetResults.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-gray-500 text-center">
                          No entities found
                        </div>
                      ) : (
                        targetResults.map((entity) => (
                          <button
                            key={entity.id}
                            type="button"
                            onClick={() => {
                              setSelectedTarget(entity);
                              setShowTargetDropdown(false);
                              setTargetSearch("");
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            {entity.name}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Relationship Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship Label{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. uses, depends on, manages"
              value={relationshipLabel}
              onChange={(e) => setRelationshipLabel(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTarget || createMutation.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Adding...
                </span>
              ) : (
                "Add Relationship"
              )}
            </button>
          </div>

          {/* Error message */}
          {createMutation.isError && (
            <p className="text-sm text-red-600 mt-2">
              Failed to create relationship. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
