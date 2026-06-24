import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import type { Integration } from "@/types";

interface IntegrationFormProps {
  integration?: Integration;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IntegrationForm({ integration, onSuccess, onCancel }: IntegrationFormProps) {
  const isEditing = !!integration;

  const [name, setName] = useState(integration?.name ?? "");
  const [sourceApplicationId, setSourceApplicationId] = useState(integration?.sourceApplicationId ?? "");
  const [targetApplicationId, setTargetApplicationId] = useState(integration?.targetApplicationId ?? "");
  const [pattern, setPattern] = useState(integration?.pattern ?? "");
  const [protocol, setProtocol] = useState(integration?.protocol ?? "");
  const [dataClassification, setDataClassification] = useState(integration?.dataClassification ?? "");
  const [owner, setOwner] = useState(integration?.owner ?? "");
  const [lifecycleStatus, setLifecycleStatus] = useState(integration?.lifecycleStatus ?? "active");
  const [sla, setSla] = useState(integration?.sla ?? "");
  const [entityScope, setEntityScope] = useState(integration?.entityScope?.join(", ") ?? "");
  const [tags, setTags] = useState(integration?.tags?.join(", ") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEntity<Integration>("/integrations");
  const updateMutation = useUpdateEntity<Integration>("/integrations", integration?.id ?? "");

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
      sourceApplicationId: sourceApplicationId.trim() || null,
      targetApplicationId: targetApplicationId.trim() || null,
      pattern: pattern || null,
      protocol: protocol || null,
      dataClassification: dataClassification || null,
      owner: owner.trim() || null,
      lifecycleStatus,
      sla: sla.trim() || null,
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

        {/* Source Application ID */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Source Application ID</label>
          <input
            type="text"
            value={sourceApplicationId}
            onChange={(e) => setSourceApplicationId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Target Application ID */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Target Application ID</label>
          <input
            type="text"
            value={targetApplicationId}
            onChange={(e) => setTargetApplicationId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pattern */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Pattern</label>
          <select
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="API">API</option>
            <option value="ETL">ETL</option>
            <option value="event">Event</option>
            <option value="file">File</option>
          </select>
        </div>

        {/* Protocol */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Protocol</label>
          <select
            value={protocol}
            onChange={(e) => setProtocol(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="REST">REST</option>
            <option value="SOAP">SOAP</option>
            <option value="Kafka">Kafka</option>
            <option value="SFTP">SFTP</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Data Classification */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Data Classification</label>
          <select
            value={dataClassification}
            onChange={(e) => setDataClassification(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
            <option value="restricted">Restricted</option>
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

        {/* SLA */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">SLA</label>
          <input
            type="text"
            value={sla}
            onChange={(e) => setSla(e.target.value)}
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
