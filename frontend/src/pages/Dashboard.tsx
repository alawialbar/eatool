import { useNavigate } from "react-router-dom";
import {
  Target,
  AppWindow,
  Cpu,
  Database,
  Cable,
  Loader2,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { useDashboard } from "@/hooks/useDashboard";
import type { LifecycleStatus } from "@/types";

const entityIcons: Record<string, typeof Target> = {
  "business-capabilities": Target,
  applications: AppWindow,
  "technology-components": Cpu,
  "data-objects": Database,
  integrations: Cable,
};

const entityRoutes: Record<string, string> = {
  "business-capabilities": "/business-capabilities",
  applications: "/applications",
  "technology-components": "/technology-components",
  "data-objects": "/data-objects",
  integrations: "/integrations",
};

const statusColors: Record<LifecycleStatus, string> = {
  planned: "bg-blue-500",
  active: "bg-green-500",
  phaseOut: "bg-amber-500",
  deprecated: "bg-red-500",
  archived: "bg-gray-400",
};

const statusLabels: Record<LifecycleStatus, string> = {
  planned: "Planned",
  active: "Active",
  phaseOut: "Phase Out",
  deprecated: "Deprecated",
  archived: "Archived",
};

export function Dashboard() {
  const navigate = useNavigate();
  const { counts, lifecycleBreakdown, staleRecords, isLoading } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  const totalEntities = lifecycleBreakdown
    ? Object.values(lifecycleBreakdown).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Enterprise Architecture Dashboard
        </h1>
        <p className="mt-1 text-gray-500">
          Overview of your technology landscape
        </p>
      </div>

      {/* Entity Count Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {counts.map((item) => {
          const Icon = entityIcons[item.endpoint] ?? Target;
          const route = entityRoutes[item.endpoint] ?? "/";
          return (
            <button
              key={item.endpoint}
              onClick={() => navigate(route)}
              className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon className="h-7 w-7 text-slate-600" />
              <span className="text-sm font-medium text-gray-600">
                {item.type}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr]">
        {/* Lifecycle Status Breakdown */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Lifecycle Status Breakdown
          </h2>
          {lifecycleBreakdown && totalEntities > 0 ? (
            <div className="space-y-3">
              {(Object.keys(statusColors) as LifecycleStatus[]).map((status) => {
                const count = lifecycleBreakdown[status];
                const percentage = (count / totalEntities) * 100;
                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        {statusLabels[status]}
                      </span>
                      <span className="text-gray-500">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={`h-full rounded-full ${statusColors[status]} transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>

        {/* Stale Records */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Stale Records
          </h2>
          {staleRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    <th className="pb-2 pr-3">Name</th>
                    <th className="pb-2 pr-3">Type</th>
                    <th className="pb-2 pr-3">Status</th>
                    <th className="pb-2">Last Reviewed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {staleRecords.map((record) => (
                    <tr
                      key={record.id}
                      onClick={() =>
                        navigate(`${record.entityRoute}/${record.id}`)
                      }
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="py-2.5 pr-3 font-medium text-gray-900">
                        {record.name}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-500">
                        {record.entityType}
                      </td>
                      <td className="py-2.5 pr-3">
                        <StatusBadge status={record.lifecycleStatus} />
                      </td>
                      <td className="py-2.5 text-gray-500">
                        {record.lastReviewedAt
                          ? new Date(record.lastReviewedAt).toLocaleDateString()
                          : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No stale records found</p>
          )}
        </div>
      </div>
    </div>
  );
}
