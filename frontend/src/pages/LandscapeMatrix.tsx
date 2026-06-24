import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLandscapeData } from "@/hooks/useLandscapeData";
import type { LifecycleStatus } from "@/types";

const statusColors: Record<LifecycleStatus, string> = {
  planned: "bg-blue-200",
  active: "bg-green-200",
  phaseOut: "bg-amber-200",
  deprecated: "bg-red-200",
  archived: "bg-gray-200",
};

const statusLabels: Record<LifecycleStatus, string> = {
  planned: "Planned",
  active: "Active",
  phaseOut: "Phase Out",
  deprecated: "Deprecated",
  archived: "Archived",
};

interface TooltipData {
  appName: string;
  capName: string;
  status: LifecycleStatus;
  x: number;
  y: number;
}

export function LandscapeMatrix() {
  const { applications, capabilities, getStatus, isLoading } =
    useLandscapeData();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500">Loading landscape data...</div>
      </div>
    );
  }

  if (applications.length === 0 || capabilities.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500">
          No data available. Add applications and business capabilities to view
          the landscape matrix.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Landscape Matrix</h1>
        <p className="text-sm text-slate-500">
          Applications vs Business Capabilities
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4">
        {(Object.keys(statusColors) as LifecycleStatus[]).map((status) => (
          <div key={status} className="flex items-center gap-1.5">
            <div
              className={`h-4 w-4 rounded-sm border border-slate-300 ${statusColors[status]}`}
            />
            <span className="text-xs text-slate-600">
              {statusLabels[status]}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-sm border border-slate-200 bg-slate-50" />
          <span className="text-xs text-slate-600">No relationship</span>
        </div>
      </div>

      {/* Matrix table */}
      <div className="relative overflow-auto rounded-lg border border-slate-200">
        <table className="border-collapse">
          <thead>
            <tr>
              {/* Top-left corner cell */}
              <th className="sticky left-0 top-0 z-30 min-w-[200px] bg-white border-b border-r border-slate-200 p-2" />
              {/* Application column headers */}
              {applications.map((app) => (
                <th
                  key={app.id}
                  className="sticky top-0 z-20 h-[120px] min-w-[32px] w-[32px] border-b border-slate-200 bg-white p-0 align-bottom"
                >
                  <div className="flex h-full items-end justify-start pb-1 pl-1">
                    <span
                      className="block origin-bottom-left -rotate-45 whitespace-nowrap text-xs font-medium text-slate-700"
                      title={app.name}
                    >
                      {app.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {capabilities.map((cap) => (
              <tr key={cap.id}>
                {/* Capability name - sticky first column */}
                <td className="sticky left-0 z-10 min-w-[200px] max-w-[200px] truncate border-b border-r border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
                  <span title={cap.name}>{cap.name}</span>
                </td>
                {/* Matrix cells */}
                {applications.map((app) => {
                  const status = getStatus(app.id, cap.id);
                  const cellColor = status
                    ? statusColors[status]
                    : "bg-slate-50";
                  const borderColor = status
                    ? "border-slate-300"
                    : "border-slate-100";

                  return (
                    <td
                      key={`${app.id}-${cap.id}`}
                      className="border-b border-slate-100 p-0.5"
                    >
                      <div
                        className={`h-[32px] w-[32px] rounded-sm border ${borderColor} ${cellColor} ${
                          status ? "cursor-pointer hover:opacity-75" : ""
                        }`}
                        onMouseEnter={(e) => {
                          if (status) {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            setTooltip({
                              appName: app.name,
                              capName: cap.name,
                              status,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 8,
                            });
                          }
                        }}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => {
                          if (status) {
                            navigate(`/applications/${app.id}`);
                          }
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-lg"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="font-medium">{tooltip.appName}</div>
          <div className="text-slate-300">{tooltip.capName}</div>
          <div className="text-slate-400">{statusLabels[tooltip.status]}</div>
        </div>
      )}
    </div>
  );
}
