import { FactSheetList } from "@/components/FactSheetList";
import { StatusBadge } from "@/components/StatusBadge";
import { IntegrationForm } from "@/components/forms/IntegrationForm";
import type { Column } from "@/components/FactSheetList";
import type { Integration } from "@/types";

const columns: Column<Integration>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">{item.name}</span>
    ),
  },
  {
    key: "pattern",
    label: "Pattern",
    sortable: true,
  },
  {
    key: "protocol",
    label: "Protocol",
    sortable: true,
  },
  {
    key: "dataClassification",
    label: "Data Classification",
    sortable: true,
  },
  {
    key: "lifecycleStatus",
    label: "Lifecycle Status",
    sortable: true,
    render: (item) => <StatusBadge status={item.lifecycleStatus} />,
  },
  {
    key: "owner",
    label: "Owner",
    sortable: true,
  },
  {
    key: "sla",
    label: "SLA",
    sortable: true,
  },
];

export function IntegrationList() {
  return (
    <FactSheetList<Integration>
      title="Integrations"
      entityType="Integration"
      apiEndpoint="/integrations"
      detailPath="/integrations"
      columns={columns}
      renderForm={({ onSuccess, onCancel }) => (
        <IntegrationForm onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
