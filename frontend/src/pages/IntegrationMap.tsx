import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type NodeProps,
  type Node,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useIntegrationMapData } from "@/hooks/useIntegrationMapData";

type AppNodeData = {
  label: string;
  lifecycleStatus: string;
  borderColor: string;
};

function AppNode({ data, id }: NodeProps<Node<AppNodeData>>) {
  const navigate = useNavigate();

  return (
    <div
      className="cursor-pointer rounded-lg border-2 bg-white px-4 py-2 shadow-sm text-sm font-medium"
      style={{ borderColor: data.borderColor }}
      onClick={() => navigate(`/applications/${id}`)}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400" />
      <span>{data.label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400" />
    </div>
  );
}

const nodeTypes = { custom: AppNode };

export function IntegrationMap() {
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const { nodes: initialNodes, edges: initialEdges, isLoading } =
    useIntegrationMapData(showOnlyActive);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync React Flow state when upstream data changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-gray-500">Loading integration map...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integration Map</h1>
          <p className="text-sm text-gray-500">
            Active integration flows between applications
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showOnlyActive}
            onChange={(e) => setShowOnlyActive(e.target.checked)}
            className="rounded border-gray-300"
          />
          Show only active integrations
        </label>
      </div>

      {/* React Flow Canvas */}
      <div
        className="rounded-lg border border-gray-200 overflow-hidden"
        style={{ height: "calc(100vh - 200px)" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{
            style: { stroke: "#64748b", strokeWidth: 1.5 },
          }}
        >
          <Controls position="top-left" />
          <MiniMap
            position="bottom-right"
            nodeColor={(node) => {
              const data = node.data as AppNodeData;
              return data?.borderColor ?? "#94a3b8";
            }}
            maskColor="rgba(0,0,0,0.08)"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        </ReactFlow>
      </div>
    </div>
  );
}
