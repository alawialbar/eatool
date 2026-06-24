import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import type { TechnologyComponent } from "@/types";

interface TechnologyComponentFormProps {
  technologyComponent?: TechnologyComponent;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TechnologyComponentForm({ technologyComponent, onSuccess, onCancel }: TechnologyComponentFormProps) {
  const isEditing = !!technologyComponent;

  const [name, setName] = useState(technologyComponent?.name ?? "");
  const [type, setType] = useState(technologyComponent?.type ?? "");
  const [version, setVersion] = useState(technologyComponent?.version ?? "");
  const [vendor, setVendor] = useState(technologyComponent?.vendor ?? "");
  const [endOfLifeDate, setEndOfLifeDate] = useState(
    technologyComponent?.endOfLifeDate ? technologyComponent.endOfLifeDate.split("T")[0] : ""
  );
  const [lifecycleStatus, setLifecycleStatus] = useState(technologyComponent?.lifecycleStatus ?? "active");
  const [owner, setOwner] = useState(technologyComponent?.owner ?? "");
  const [entityScope, setEntityScope] = useState(technologyComponent?.entityScope?.join(", ") ?? "");
  const [tags, setTags] = useState(technologyComponent?.tags?.join(", ") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEntity<TechnologyComponent>("/technology-components");
  const updateMutation = useUpdateEntity<TechnologyComponent>("/technology-components", technologyComponent?.id ?? "");

  const mutation = isEditing ? updateMutation : createMutation;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: Record<string, unknown> = {
      name: name.trim(),
      type: type || null,
      version: version.trim() || null,
      vendor: vendor.trim() || null,
      endOfLifeDate: endOfLifeDate || null,
      lifecycleStatus,
      owner: owner.trim() || null,
      entityScope: entityScope.trim() ? entityScope.split(",").map((s) => s.trim()).filter(Boolean) : [],
      tags: tags.trim() ? tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
    };

    mutation.mutate(data, {
      onSuccess: () => onSuccess(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex-1 space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Name<span className="ml-0.5 text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>

        {/* Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="database">Database</option>
            <option value="middleware">Middleware</option>
            <option value="runtime">Runtime</option>
            <option value="network">Network</option>
            <option value="cloudService">Cloud Service</option>
          </select>
        </div>

        {/* Version */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Version</label>
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Vendor */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Vendor</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* End of Life Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">End of Life Date</label>
          <input
            type="date"
            value={endOfLifeDate}
            onChange={(e) => setEndOfLifeDate(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Lifecycle Status */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Lifecycle Status</label>
          <select
            value={lifecycleStatus}
            onChange={(e) => setLifecycleStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="phaseOut">Phase Out</option>
            <option value="deprecated">Deprecated</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Owner */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Owner</label>
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Entity Scope */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Entity Scope</label>
          <input
            type="text"
            value={entityScope}
            onChange={(e) => setEntityScope(e.target.value)}
            placeholder="Comma-separated values"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated values"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEditing ? "Save Changes" : "Create"}
        </button>
      </div>

      {mutation.isError && (
        <p className="mt-2 text-xs text-red-600">
          {(mutation.error as any)?.response?.data?.error ?? "An error occurred. Please try again."}
        </p>
      )}
    </form>
  );
}
