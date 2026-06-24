import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import type { DataObject } from "@/types";

interface DataObjectFormProps {
  dataObject?: DataObject;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DataObjectForm({ dataObject, onSuccess, onCancel }: DataObjectFormProps) {
  const isEditing = !!dataObject;

  const [name, setName] = useState(dataObject?.name ?? "");
  const [description, setDescription] = useState(dataObject?.description ?? "");
  const [classification, setClassification] = useState(dataObject?.classification ?? "internal");
  const [owningApplication, setOwningApplication] = useState(dataObject?.owningApplication ?? "");
  const [owningCapability, setOwningCapability] = useState(dataObject?.owningCapability ?? "");
  const [residencyCountry, setResidencyCountry] = useState(dataObject?.residencyCountry ?? "");
  const [regulatoryFlag, setRegulatoryFlag] = useState(dataObject?.regulatoryFlag ?? "");
  const [lifecycleStatus, setLifecycleStatus] = useState(dataObject?.lifecycleStatus ?? "active");
  const [owner, setOwner] = useState(dataObject?.owner ?? "");
  const [entityScope, setEntityScope] = useState(dataObject?.entityScope?.join(", ") ?? "");
  const [tags, setTags] = useState(dataObject?.tags?.join(", ") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEntity<DataObject>("/data-objects");
  const updateMutation = useUpdateEntity<DataObject>("/data-objects", dataObject?.id ?? "");

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
      description: description.trim() || null,
      classification,
      owningApplication: owningApplication.trim() || null,
      owningCapability: owningCapability.trim() || null,
      residencyCountry: residencyCountry.trim() || null,
      regulatoryFlag: regulatoryFlag || null,
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

        {/* Description */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Classification */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Classification</label>
          <select
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>

        {/* Owning Application */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Owning Application</label>
          <input
            type="text"
            value={owningApplication}
            onChange={(e) => setOwningApplication(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Owning Capability */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Owning Capability</label>
          <input
            type="text"
            value={owningCapability}
            onChange={(e) => setOwningCapability(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Residency Country */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Residency Country</label>
          <input
            type="text"
            value={residencyCountry}
            onChange={(e) => setResidencyCountry(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Regulatory Flag */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Regulatory Flag</label>
          <select
            value={regulatoryFlag}
            onChange={(e) => setRegulatoryFlag(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">None</option>
            <option value="GDPR">GDPR</option>
            <option value="SAMA">SAMA</option>
            <option value="PDPL">PDPL</option>
            <option value="FRA">FRA</option>
            <option value="other">Other</option>
          </select>
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
