import type { LifecycleStatus } from "@/types";

const statusStyles: Record<LifecycleStatus, string> = {
  planned: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  phaseOut: "bg-amber-100 text-amber-800",
  deprecated: "bg-red-100 text-red-800",
  archived: "bg-gray-100 text-gray-600",
};

const statusLabels: Record<LifecycleStatus, string> = {
  planned: "Planned",
  active: "Active",
  phaseOut: "Phase Out",
  deprecated: "Deprecated",
  archived: "Archived",
};

interface StatusBadgeProps {
  status: LifecycleStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}
