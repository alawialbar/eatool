import { FactSheetDetail } from "@/components/FactSheetDetail";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import type { FieldDefinition } from "@/components/FactSheetDetail";
import type { Application, LifecycleStatus } from "@/types";

const applicationFields: FieldDefinition[] = [
  { key: "name", label: "Name" },
  { key: "description", label: "Description" },
  { key: "vendor", label: "Vendor" },
  { key: "deploymentType", label: "Deployment Type" },
  {
    key: "businessCriticality",
    label: "Business Criticality",
    render: (value: string) => {
      if (!value) return "—";
      const labels: Record<string, string> = {
        missionCritical: "Mission Critical",
        businessCritical: "Business Critical",
        standard: "Standard",
        low: "Low",
      };
      return labels[value] || value;
    },
  },
  {
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    render: (value: LifecycleStatus) =>
      value ? <StatusBadge status={value} /> : "—",
  },
  { key: "hostingCountry", label: "Hosting Country" },
  { key: "owner", label: "Owner" },
  {
    key: "contractRenewalDate",
    label: "Contract Renewal Date",
    render: (value: string) => {
      if (!value) return "—";
      return new Date(value).toLocaleDateString();
    },
  },
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
];

export function ApplicationDetail() {
  return (
    <FactSheetDetail<Application & { relationsAsSource?: any[]; relationsAsTarget?: any[] }>
      entityType="Application"
      apiEndpoint="/applications"
      listPath="/applications"
      fields={applicationFields}
      renderForm={({ entity, onSuccess, onCancel }) => (
        <ApplicationForm application={entity} onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
