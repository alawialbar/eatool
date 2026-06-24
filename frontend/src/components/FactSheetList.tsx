import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronUp, ChevronDown, Plus, Loader2 } from "lucide-react";
import { useFactSheets } from "@/hooks/useFactSheets";
import { FormDrawer } from "@/components/FormDrawer";
import type { QueryParams } from "@/hooks/useFactSheets";
import type { LifecycleStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface FactSheetListProps<T> {
  title: string;
  entityType: string;
  apiEndpoint: string;
  detailPath: string;
  columns: Column<T>[];
  createButtonLabel?: string;
  renderForm?: (props: { onSuccess: () => void; onCancel: () => void }) => React.ReactNode;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LIFECYCLE_OPTIONS: { value: LifecycleStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "planned", label: "Planned" },
  { value: "active", label: "Active" },
  { value: "phaseOut", label: "Phase Out" },
  { value: "deprecated", label: "Deprecated" },
  { value: "archived", label: "Archived" },
];

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export function FactSheetList<T extends { id: string; entityScope?: string[] }>({
  title,
  entityType,
  apiEndpoint,
  detailPath,
  columns,
  createButtonLabel,
  renderForm,
}: FactSheetListProps<T>) {
  const navigate = useNavigate();

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState<LifecycleStatus | "">("");
  const [owner, setOwner] = useState("");
  const [entityScope, setEntityScope] = useState("");

  // Sort state
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [page, setPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [lifecycleStatus, owner, entityScope]);

  // Build query params
  const params: QueryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch || undefined,
      lifecycleStatus: lifecycleStatus || undefined,
      owner: owner || undefined,
      entityScope: entityScope || undefined,
      sortBy: sortBy || undefined,
      sortOrder: sortBy ? sortOrder : undefined,
    }),
    [page, debouncedSearch, lifecycleStatus, owner, entityScope, sortBy, sortOrder]
  );

  const { data, isLoading, isError } = useFactSheets<T>(apiEndpoint, params);

  // Compute unique entity scopes from current data
  const scopeOptions = useMemo(() => {
    if (!data?.data) return [];
    const scopes = new Set<string>();
    data.data.forEach((item) => {
      if (item.entityScope) {
        item.entityScope.forEach((s) => scopes.add(s));
      }
    });
    return Array.from(scopes).sort();
  }, [data]);

  // Handle column sort
  const handleSort = useCallback(
    (key: string) => {
      if (sortBy === key) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(key);
        setSortOrder("asc");
      }
      setPage(1);
    },
    [sortBy]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (item: T) => {
      navigate(`${detailPath}/${item.id}`);
    },
    [navigate, detailPath]
  );

  const totalPages = data?.meta?.totalPages ?? 0;
  const totalCount = data?.meta?.total ?? 0;

  const handleDrawerSuccess = () => {
    setIsDrawerOpen(false);
  };

  const handleDrawerCancel = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {title}
          {!isLoading && (
            <span className="ml-2 text-lg font-normal text-gray-500">
              ({totalCount})
            </span>
          )}
        </h1>
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          {createButtonLabel ?? `Create ${entityType}`}
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Lifecycle Status */}
        <select
          value={lifecycleStatus}
          onChange={(e) => setLifecycleStatus(e.target.value as LifecycleStatus | "")}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {LIFECYCLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Owner */}
        <input
          type="text"
          placeholder="Filter by owner..."
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />

        {/* Entity Scope */}
        {scopeOptions.length > 0 && (
          <select
            value={entityScope}
            onChange={(e) => setEntityScope(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Scopes</option>
            {scopeOptions.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${
                    col.sortable !== false ? "cursor-pointer select-none hover:text-gray-700" : ""
                  }`}
                  onClick={() => {
                    if (col.sortable !== false) handleSort(col.key);
                  }}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortBy === col.key && (
                      sortOrder === "asc" ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading {title.toLowerCase()}...</span>
                  </div>
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-red-600">
                  Failed to load data. Please try again.
                </td>
              </tr>
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
                  No {title.toLowerCase()} found matching your filters.
                </td>
              </tr>
            ) : (
              data?.data.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className="cursor-pointer border-b border-gray-100 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render
                        ? col.render(item)
                        : (item as Record<string, unknown>)[col.key] as React.ReactNode ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Drawer */}
      {renderForm && (
        <FormDrawer
          isOpen={isDrawerOpen}
          onClose={handleDrawerCancel}
          title={`Create ${entityType}`}
        >
          {renderForm({ onSuccess: handleDrawerSuccess, onCancel: handleDrawerCancel })}
        </FormDrawer>
      )}
    </div>
  );
}
