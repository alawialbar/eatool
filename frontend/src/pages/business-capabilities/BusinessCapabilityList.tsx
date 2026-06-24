import { FactSheetList } from "@/components/FactSheetList";
import { StatusBadge } from "@/components/StatusBadge";
import { BusinessCapabilityForm } from "@/components/forms/BusinessCapabilityForm";
import type { Column } from "@/components/FactSheetList";
import type { BusinessCapability, CapabilityLevel } from "@/types";

const levelColors: Record<CapabilityLevel, string> = {
  L1: "bg-indigo-100 text-indigo-700",
  L2: "bg-violet-100 text-violet-700",
  L3: "bg-purple-100 text-purple-700",
};

const columns: Column<BusinessCapability>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">{item.name}</span>
    ),
  },
  {
    key: "level",
    label: "Level",
    sortable: true,
    render: (item) => (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${levelColors[item.level]}`}
      >
        {item.level}
      </span>
    ),
  },
  {
    key: "owner",
    label: "Owner",
    sortable: true,
  },
  {
    key: "entityScope",
    label: "Entity Scope",
    sortable: false,
    render: (item) => {
      if (!item.entityScope || item.entityScope.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-1">
          {item.entityScope.map((scope) => (
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
    sortable: true,
    render: (item) => <StatusBadge status={item.lifecycleStatus} />,
  },
  {
    key: "tags",
    label: "Tags",
    sortable: false,
    render: (item) => {
      if (!item.tags || item.tags.length === 0) return "—";
      return (
        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
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
];

export function BusinessCapabilityList() {
  return (
    <FactSheetList<BusinessCapability>
      title="Business Capabilities"
      entityType="BusinessCapability"
      apiEndpoint="/business-capabilities"
      detailPath="/business-capabilities"
      columns={columns}
      renderForm={({ onSuccess, onCancel }) => (
        <BusinessCapabilityForm onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
