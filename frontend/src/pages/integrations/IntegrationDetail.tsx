import { FactSheetDetail } from "@/components/FactSheetDetail";
import { StatusBadge } from "@/components/StatusBadge";
import { IntegrationForm } from "@/components/forms/IntegrationForm";
import type { FieldDefinition } from "@/components/FactSheetDetail";
import type { Integration, LifecycleStatus } from "@/types";

const fields: FieldDefinition[] = [
  { key: "name", label: "Name" },
  {
    key: "sourceApplication",
    label: "Source Application",
    render: (_value: unknown, entity: Integration) => {
      if (entity.sourceApplication?.name) return entity.sourceApplication.name;
      return entity.sourceApplicationId ?? "—";
    },
  },
  {
    key: "targetApplication",
    label: "Target Application",
    render: (_value: unknown, entity: Integration) => {
      if (entity.targetApplication?.name) return entity.targetApplication.name;
      return entity.targetApplicationId ?? "—";
    },
  },
  { key: "pattern", label: "Pattern" },
  { key: "protocol", label: "Protocol" },
  { key: "dataClassification", label: "Data Classification" },
  {
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    render: (value: LifecycleStatus) =>
      value ? <StatusBadge status={value} /> : "—",
  },
  { key: "owner", label: "Owner" },
  { key: "sla", label: "SLA" },
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

export function IntegrationDetail() {
  return (
    <FactSheetDetail<Integration & { relationsAsSource?: any[]; relationsAsTarget?: any[] }>
      entityType="Integration"
      apiEndpoint="/integrations"
      listPath="/integrations"
      fields={fields}
      renderForm={({ entity, onSuccess, onCancel }) => (
        <IntegrationForm integration={entity} onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
