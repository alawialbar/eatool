import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCreateEntity } from "@/hooks/useCreateEntity";
import { useUpdateEntity } from "@/hooks/useUpdateEntity";
import type { Application } from "@/types";

interface ApplicationFormProps {
  application?: Application;
  onSuccess: () => void;
  onCancel: () => void;
}

export function ApplicationForm({ application, onSuccess, onCancel }: ApplicationFormProps) {
  const isEditing = !!application;

  const [name, setName] = useState(application?.name ?? "");
  const [description, setDescription] = useState(application?.description ?? "");
  const [vendor, setVendor] = useState(application?.vendor ?? "");
  const [deploymentType, setDeploymentType] = useState(application?.deploymentType ?? "");
  const [businessCriticality, setBusinessCriticality] = useState(application?.businessCriticality ?? "standard");
  const [lifecycleStatus, setLifecycleStatus] = useState(application?.lifecycleStatus ?? "active");
  const [hostingCountry, setHostingCountry] = useState(application?.hostingCountry ?? "");
  const [owner, setOwner] = useState(application?.owner ?? "");
  const [contractRenewalDate, setContractRenewalDate] = useState(
    application?.contractRenewalDate ? application.contractRenewalDate.split("T")[0] : ""
  );
  const [entityScope, setEntityScope] = useState(application?.entityScope?.join(", ") ?? "");
  const [tags, setTags] = useState(application?.tags?.join(", ") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateEntity<Application>("/applications");
  const updateMutation = useUpdateEntity<Application>("/applications", application?.id ?? "");

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
      vendor: vendor.trim() || null,
      deploymentType: deploymentType || null,
      businessCriticality,
      lifecycleStatus,
      hostingCountry: hostingCountry.trim() || null,
      owner: owner.trim() || null,
      contractRenewalDate: contractRenewalDate || null,
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

        {/* Deployment Type */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Deployment Type</label>
          <select
            value={deploymentType}
            onChange={(e) => setDeploymentType(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            <option value="SaaS">SaaS</option>
            <option value="OnPrem">OnPrem</option>
            <option value="CloudHosted">CloudHosted</option>
          </select>
        </div>

        {/* Business Criticality */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Business Criticality</label>
          <select
            value={businessCriticality}
            onChange={(e) => setBusinessCriticality(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            <option value="missionCritical">Mission Critical</option>
            <option value="businessCritical">Business Critical</option>
            <option value="standard">Standard</option>
            <option value="low">Low</option>
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

        {/* Hosting Country */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Hosting Country</label>
          <input
            type="text"
            value={hostingCountry}
            onChange={(e) => setHostingCountry(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          />
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

        {/* Contract Renewal Date */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Contract Renewal Date</label>
          <input
            type="date"
            value={contractRenewalDate}
            onChange={(e) => setContractRenewalDate(e.target.value)}
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
