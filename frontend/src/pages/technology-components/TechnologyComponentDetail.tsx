import { FactSheetDetail } from "@/components/FactSheetDetail";
import { StatusBadge } from "@/components/StatusBadge";
import { TechnologyComponentForm } from "@/components/forms/TechnologyComponentForm";
import type { FieldDefinition } from "@/components/FactSheetDetail";
import type { TechnologyComponent, LifecycleStatus } from "@/types";

const fields: FieldDefinition[] = [
  { key: "name", label: "Name" },
  { key: "type", label: "Type" },
  { key: "version", label: "Version" },
  { key: "vendor", label: "Vendor" },
  {
    key: "endOfLifeDate",
    label: "End of Life Date",
    render: (value: string) => {
      if (!value) return "—";
      return new Date(value).toLocaleDateString();
    },
  },
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

export function TechnologyComponentDetail() {
  return (
    <FactSheetDetail<TechnologyComponent & { relationsAsSource?: any[]; relationsAsTarget?: any[] }>
      entityType="TechnologyComponent"
      apiEndpoint="/technology-components"
      listPath="/technology-components"
      fields={fields}
      renderForm={({ entity, onSuccess, onCancel }) => (
        <TechnologyComponentForm technologyComponent={entity} onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
