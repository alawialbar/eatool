import { FactSheetList } from "@/components/FactSheetList";
import { StatusBadge } from "@/components/StatusBadge";
import { DataObjectForm } from "@/components/forms/DataObjectForm";
import type { Column } from "@/components/FactSheetList";
import type { DataObject } from "@/types";

const columns: Column<DataObject>[] = [
  {
    key: "name",
    label: "Name",
    sortable: true,
    render: (item) => (
      <span className="font-medium text-gray-900">{item.name}</span>
    ),
  },
  {
    key: "classification",
    label: "Classification",
    sortable: true,
  },
  {
    key: "owningApplication",
    label: "Owning Application",
    sortable: true,
  },
  {
    key: "residencyCountry",
    label: "Residency Country",
    sortable: true,
  },
  {
    key: "regulatoryFlag",
    label: "Regulatory Flag",
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
];

export function DataObjectList() {
  return (
    <FactSheetList<DataObject>
      title="Data Objects"
      entityType="DataObject"
      apiEndpoint="/data-objects"
      detailPath="/data-objects"
      columns={columns}
      renderForm={({ onSuccess, onCancel }) => (
        <DataObjectForm onSuccess={onSuccess} onCancel={onCancel} />
      )}
    />
  );
}
