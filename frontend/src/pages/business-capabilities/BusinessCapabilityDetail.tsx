import { FactSheetDetail } from "@/components/FactSheetDetail";
import { StatusBadge } from "@/components/StatusBadge";
import { BusinessCapabilityForm } from "@/components/forms/BusinessCapabilityForm";
import type { FieldDefinition } from "@/components/FactSheetDetail";
import type { BusinessCapability, CapabilityLevel, LifecycleStatus } from "@/types";

const levelColors: Record<CapabilityLevel, string> = {
  L1: "bg-indigo-100 text-indigo-700",
  L2: "bg-violet-100 text-violet-700",
  L3: "bg-purple-100 text-purple-700",
};

const fields: FieldDefinition[] = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  {
    key: "level",
    label: "Level",
    render: (value: CapabilityLevel) => {
      if (!value) return "—";
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[value]}`}
        >
          {value}
        </span>
      );
    },
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
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    render: (value: LifecycleStatus) =>
      value ? <StatusBadge status={value} /> : "—",
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

export function BusinessCapabilityDetail() {
  return (
    <FactSheetDetail<BusinessCapability & { relationsAsSource?: any[]; relationsAsTarget?: any[] }>
      entityType="BusinessCapability"
      apiEndpoint="/business-capabilities"
      listPath="/business-capabilities"
      fields={fields}
      renderForm={({ entity, onSuccess, onCancel }) => (
        <BusinessCapabilityForm businessCapability={entity} onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
