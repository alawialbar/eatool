import { FactSheetList } from "@/components/FactSheetList";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicationForm } from "@/components/forms/ApplicationForm";
import type { Column } from "@/components/FactSheetList";
import type { Application } from "@/types";

const columns: Column<Application>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (app) => (
      <span className="font-medium text-gray-900">{app.name}</span>
    ),
  },
  {
    key: "vendor",
    label: "Vendor",
    sortable: true,
  },
  {
    key: "deploymentType",
    label: "Deployment Type",
    sortable: true,
  },
  {
    key: "businessCriticality",
    label: "Business Criticality",
    sortable: true,
    render: (app) => {
      const labels: Record<string, string> = {
        missionCritical: "Mission Critical",
        businessCritical: "Business Critical",
        standard: "Standard",
        low: "Low",
      };
      return labels[app.businessCriticality] ?? app.businessCriticality;
    },
  },
  {
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    sortable: true,
    render: (app) => <StatusBadge status={app.lifecycleStatus} />,
  },
  {
    key: "owner",
    label: "Owner",
    sortable: true,
  },
  {
    key: "hostingCountry",
    label: "Hosting Country",
    sortable: true,
  },
];

export function ApplicationList() {
  return (
    <FactSheetList<Application>
      title="Applications"
      entityType="Application"
      apiEndpoint="/applications"
      detailPath="/applications"
      columns={columns}
      renderForm={({ onSuccess, onCancel }) => (
        <ApplicationForm onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
