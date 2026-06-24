import { FactSheetList } from "@/components/FactSheetList";
import { StatusBadge } from "@/components/StatusBadge";
import { TechnologyComponentForm } from "@/components/forms/TechnologyComponentForm";
import type { Column } from "@/components/FactSheetList";
import type { TechnologyComponent } from "@/types";

const columns: Column<TechnologyComponent>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">{item.name}</span>
    ),
  },
  {
    key: "type",
    label: "Type",
    sortable: true,
  },
  {
    key: "version",
    label: "Version",
    sortable: true,
  },
  {
    key: "vendor",
    label: "Vendor",
    sortable: true,
  },
  {
    key: "endOfLifeDate",
    label: "End of Life Date",
    sortable: true,
    render: (item) => {
      if (!item.endOfLifeDate) return "—";
      return new Date(item.endOfLifeDate).toLocaleDateString();
    },
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
];

export function TechnologyComponentList() {
  return (
    <FactSheetList<TechnologyComponent>
      title="Technology Components"
      entityType="TechnologyComponent"
      apiEndpoint="/technology-components"
      detailPath="/technology-components"
      columns={columns}
      renderForm={({ onSuccess, onCancel }) => (
        <TechnologyComponentForm onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
