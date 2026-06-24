import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Pencil, Archive, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFactSheet } from "@/hooks/useFactSheet";
import { FormDrawer } from "@/components/FormDrawer";
import { StatusBadge } from "@/components/StatusBadge";
import { RelationshipPanel } from "@/components/RelationshipPanel";
import api from "@/lib/api";
import type { EntityType, LifecycleStatus, Relationship } from "@/types";

export interface FieldDefinition {
  key: string;
  label: string;
  render?: (value: any, entity: any) => React.ReactNode;
}

export interface FactSheetDetailProps<T> {
  entityType: string;
  apiEndpoint: string;
  listPath: string;
  fields: FieldDefinition[];
  renderForm?: (props: { entity: T; onSuccess: () => void; onCancel: () => void }) => React.ReactNode;
}

interface EntityWithRelationships {
  name: string;
  lifecycleStatus: LifecycleStatus;
  relationsAsSource?: Relationship[];
  relationsAsTarget?: Relationship[];
  [key: string]: any;
}

export function FactSheetDetail<T extends EntityWithRelationships>({
  entityType,
  apiEndpoint,
  listPath,
  fields,
  renderForm,
}: FactSheetDetailProps<T>) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);

  const { data: entity, isLoading, isError } = useFactSheet<T>(apiEndpoint, id!);

  const archiveMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`${apiEndpoint}/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      queryClient.invalidateQueries({ queryKey: [apiEndpoint, id] });
      navigate(listPath);
    },
  });

  const handleArchive = () => {
    if (window.confirm(`Are you sure you want to archive this ${entityType.toLowerCase()}? This action cannot be undone.`)) {
      archiveMutation.mutate();
    }
  };

  const handleEditSuccess = () => {
    setIsEditDrawerOpen(false);
  };

  const handleEditCancel = () => {
    setIsEditDrawerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (isError || !entity) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-gray-900">Not Found</h2>
        <p className="mt-1 text-sm text-gray-500">
          The {entityType.toLowerCase()} you're looking for doesn't exist.
        </p>
        <Link
          to={listPath}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <button
        onClick={() => navigate(listPath)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {entityType}s
      </button>

      {/* Header */}
      <div className="rounded-lg bg-white shadow-sm border border-gray-200 px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {entity.name}
              </h1>
              <StatusBadge status={entity.lifecycleStatus} />
            </div>
            <p className="text-sm text-gray-500">{entityType}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEditDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive className="h-3.5 w-3.5" />
              {archiveMutation.isPending ? "Archiving..." : "Archive"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content: two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Entity fields (60%) */}
        <div className="lg:col-span-3">
          <div className="rounded-lg bg-white shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {fields.map((field) => {
                const value = entity[field.key as keyof T];
                return (
                  <div key={field.key}>
                    <dt className="text-sm font-medium text-gray-500">
                      {field.label}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {field.render
                        ? field.render(value, entity)
                        : value != null && value !== ""
                          ? String(value)
                          : "—"}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        {/* Right: Relationship panel (40%) */}
        <div className="lg:col-span-2">
          <RelationshipPanel
            entityId={id!}
            entityType={entityType as EntityType}
            relationsAsSource={entity.relationsAsSource || []}
            relationsAsTarget={entity.relationsAsTarget || []}
          />
        </div>
      </div>

      {/* Edit Drawer */}
      {renderForm && entity && (
        <FormDrawer
          isOpen={isEditDrawerOpen}
          onClose={handleEditCancel}
          title={`Edit ${entityType}`}
        >
          {renderForm({ entity, onSuccess: handleEditSuccess, onCancel: handleEditCancel })}
        </FormDrawer>
      )}
    </div>
  );
}


