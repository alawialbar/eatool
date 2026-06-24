import { FactSheetDetail } from "@/components/FactSheetDetail";
import { StatusBadge } from "@/components/StatusBadge";
import { DataObjectForm } from "@/components/forms/DataObjectForm";
import type { FieldDefinition } from "@/components/FactSheetDetail";
import type { DataObject, LifecycleStatus } from "@/types";

const fields: FieldDefinition[] = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "classification", label: "Classification" },
  { key: "owningApplication", label: "Owning Application" },
  { key: "owningCapability", label: "Owning Capability" },
  { key: "residencyCountry", label: "Residency Country" },
  { key: "regulatoryFlag", label: "Regulatory Flag" },
  {
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    render: (value: LifecycleStatus) =>
      value ? <StatusBadge status={value} /> : "—",
  },
  { key: "owner", label: "Owner" },
  {
    key: "entityScope",
    label: "Entity Scope",
    render: (value: string[]) => {
      if (!value || value.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((scope) => (
            <span
              key={scope}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {scope}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    key: "tags",
    label: "Tags",
    render: (value: string[]) => {
      if (!value || value.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-1">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      );
    },
  },
  {
    key: "createdAt",
    label: "Created At",
    render: (value: string) => {
      if (!value) return "—";
      return new Date(value).toLocaleDateString();
    },
  },
  {
    key: "updatedAt",
    label: "Updated At",
    render: (value: string) => {
      if (!value) return "—";
      return new Date(value).toLocaleDateString();
    },
  },
  {
    key: "lastReviewedAt",
    label: "Last Reviewed At",
    render: (value: string) => {
      if (!value) return "—";
      return new Date(value).toLocaleDateString();
    },
  },
];

export function DataObjectDetail() {
  return (
    <FactSheetDetail<DataObject & { relationsAsSource?: any[]; relationsAsTarget?: any[] }>
      entityType="DataObject"
      apiEndpoint="/data-objects"
      listPath="/data-objects"
      fields={fields}
      renderForm={({ entity, onSuccess, onCancel }) => (
        <DataObjectForm dataObject={entity} onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
