import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  useReactFlow,
  MarkerType,
} from "@xyflow/react";
import type { Connection, Edge, Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomPipelineNode } from "./CustomPipelineNode";
import type { CustomPipelineNodeData } from "./CustomPipelineNode";
import { ContextMenuPalette } from "./ContextMenuPalette";
import { NodeConfigInspector } from "./NodeConfigInspector";
import { CanvasToolbar } from "./CanvasToolbar";
import { RunPipelineModal } from "../../dialogs/RunPipelineModal";
import { LiveExecutionDrawer } from "./LiveExecutionDrawer";
import {
  useAddPipelineNode,
  useUpdatePipelineNode,
  useDeletePipelineNode,
  useAddPipelineEdge,
  useDeletePipelineEdge,
  useValidatePipeline,
} from "../../hooks/usePipelineGraph";
import type { PipelineGraphDto, NodePaletteItemDto } from "@/gen/model";
import { toast } from "sonner";

interface PipelineCanvasProps {
  projectId: string;
  graph: PipelineGraphDto;
}

const nodeTypes = {
  pipelineNode: CustomPipelineNode,
};

const defaultEdgeOptions = {
  animated: true,
  style: { strokeWidth: 2 },
};

export function PipelineCanvas({ projectId, graph }: PipelineCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();

  // Convert graph DTO to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    return (graph.nodes || []).map((n) => {
      const isStart = n.kind?.toLowerCase() === "start" || n.refId?.toLowerCase() === "start";
      return {
        id: n.id,
        type: "pipelineNode",
        deletable: !isStart,
        position: { x: n.position.x, y: n.position.y },
        data: {
          refId: n.refId,
          kind: n.kind,
          label: n.label,
          category: n.category,
          executor: n.executor,
          inputs: n.inputs || [],
          outputs: n.outputs || [],
          configValues: n.configValues || {},
        } as CustomPipelineNodeData,
      };
    });
  }, [graph.nodes]);

  // Helper to determine if edge is Exec Flow
  const isExecEdge = (sourcePin?: string | null, targetPin?: string | null, kind?: any) => {
    return (
      kind === 1 ||
      kind === "Exec" ||
      sourcePin === "exec_out" ||
      targetPin === "exec_in"
    );
  };

  // Convert graph DTO to React Flow edges
  const initialEdges: Edge[] = useMemo(() => {
    return (graph.edges || []).map((e) => {
      const isExec = isExecEdge(e.sourcePin, e.targetPin, e.kind);
      return {
        id: e.id,
        source: e.sourceNodeId,
        sourceHandle: e.sourcePin,
        target: e.targetNodeId,
        targetHandle: e.targetPin,
        animated: !isExec,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isExec ? "currentColor" : "#38bdf8",
          width: 16,
          height: 16,
        },
        className: isExec ? "text-foreground" : "text-sky-400",
        style: isExec
          ? { stroke: "currentColor", strokeWidth: 3.5, strokeDasharray: "none" }
          : { stroke: "#38bdf8", strokeWidth: 2 },
      };
    });
  }, [graph.edges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync if pipeline graph changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [graph.id, initialNodes, initialEdges, setNodes, setEdges]);

  // Selected Node for Config Inspector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);

  // Right-click Context Palette Menu State
  const [palettePosition, setPalettePosition] = useState<{ x: number; y: number } | null>(null);
  const [flowCoordinates, setFlowCoordinates] = useState<{ x: number; y: number }>({ x: 100, y: 100 });

  // Run Modal & Live Execution Drawer State
  const [isRunModalOpen, setIsRunModalOpen] = useState(false);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerDefaultTab, setDrawerDefaultTab] = useState<"history" | "inspect">("inspect");

  // Granular CRUD Mutations
  const addNodeMutation = useAddPipelineNode(graph.id);
  const updateNodeMutation = useUpdatePipelineNode(graph.id);
  const deleteNodeMutation = useDeletePipelineNode(graph.id);
  const addEdgeMutation = useAddPipelineEdge(graph.id);
  const deleteEdgeMutation = useDeletePipelineEdge(graph.id);
  const validateMutation = useValidatePipeline(graph.id);

  // Strict Connection Validation
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      // 1. Cannot connect to self
      if (connection.source === connection.target) return false;
      if (!connection.sourceHandle || !connection.targetHandle) return false;

      const isSourceExec = connection.sourceHandle === "exec_out";
      const isTargetExec = connection.targetHandle === "exec_in";

      // 2. Exec flow can only connect to Exec flow
      if (isSourceExec || isTargetExec) {
        return isSourceExec && isTargetExec;
      }

      // 3. For Data pins: target cannot receive multiple wires if Single cardinality
      const targetNode = nodes.find((n) => n.id === connection.target);
      const targetPin = (targetNode?.data as any)?.inputs?.find(
        (p: any) => p.id === connection.targetHandle
      );
      const isArray = targetPin?.cardinality === 1 || targetPin?.cardinality === "Array";

      if (!isArray) {
        const alreadyConnected = edges.some(
          (e) => e.target === connection.target && e.targetHandle === connection.targetHandle
        );
        if (alreadyConnected) return false;
      }

      return true;
    },
    [nodes, edges]
  );

  // Connect Handler (Wired an edge) -> Calls POST /api/pipelines/{id}/edges
  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target || !params.sourceHandle || !params.targetHandle) return;

      const isExec = isExecEdge(params.sourceHandle, params.targetHandle);

      try {
        const createdEdge = await addEdgeMutation.mutateAsync({
          sourcePipelineNodeId: params.source,
          sourcePin: params.sourceHandle,
          targetPipelineNodeId: params.target,
          targetPin: params.targetHandle,
        });

        setEdges((eds) => {
          // If connecting ExecOut (1-to-1 rule), remove existing edge from this source exec handle
          const filtered = isExec
            ? eds.filter((e) => !(e.source === params.source && e.sourceHandle === params.sourceHandle))
            : eds;

          return addEdge(
            {
              ...params,
              id: createdEdge.id,
              animated: !isExec,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isExec ? "currentColor" : "#38bdf8",
                width: 16,
                height: 16,
              },
              className: isExec ? "text-foreground" : "text-sky-400",
              style: isExec
                ? { stroke: "currentColor", strokeWidth: 3.5, strokeDasharray: "none" }
                : { stroke: "#38bdf8", strokeWidth: 2 },
            },
            filtered
          );
        });
      } catch {
        // Handled by toast
      }
    },
    [addEdgeMutation, setEdges]
  );

  // Drag stop handler (Node moved) -> Calls PATCH /api/pipelines/{id}/nodes/{nodeId}
  const onNodeDragStop = useCallback(
    (_: MouseEvent | TouchEvent, node: Node) => {
      updateNodeMutation.mutate({
        nodeId: node.id,
        data: {
          positionX: node.position.x,
          positionY: node.position.y,
        },
      });
    },
    [updateNodeMutation]
  );

  // Nodes deleted handler (Delete key or backspace) -> Calls DELETE /api/pipelines/{id}/nodes/{nodeId}
  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      const filtered = deletedNodes.filter(
        (n) => (n.data as any)?.kind?.toLowerCase() !== "start" && (n.data as any)?.refId?.toLowerCase() !== "start"
      );
      filtered.forEach((n) => {
        deleteNodeMutation.mutate(n.id);
      });
      if (selectedNodeId && filtered.some((n) => n.id === selectedNodeId)) {
        setSelectedNodeId(null);
      }
    },
    [deleteNodeMutation, selectedNodeId]
  );

  // Edges deleted handler (Delete key or backspace on selected wire) -> Calls DELETE /api/pipelines/{id}/edges/{edgeId}
  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      deletedEdges.forEach((e) => {
        deleteEdgeMutation.mutate(e.id);
      });
      toast.info("Connection deleted");
    },
    [deleteEdgeMutation]
  );

  // Right-click on Edge to immediately cut/delete the connection wire
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.preventDefault();
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      deleteEdgeMutation.mutate(edge.id);
      toast.info("Connection deleted");
    },
    [deleteEdgeMutation, setEdges]
  );

  // Pane Context Menu (Right Click on Canvas) -> Opens Palette
  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent | MouseEvent) => {
      event.preventDefault();
      const coords = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setFlowCoordinates(coords);
      setPalettePosition({ x: event.clientX, y: event.clientY });
    },
    [screenToFlowPosition]
  );

  // Add Node from Palette -> Calls POST /api/pipelines/{id}/nodes immediately
  const handleSelectPaletteItem = useCallback(
    async (item: NodePaletteItemDto) => {
      try {
        const createdNode = await addNodeMutation.mutateAsync({
          refId: item.key,
          kind: item.source || "Tool",
          positionX: flowCoordinates.x,
          positionY: flowCoordinates.y,
          configValues: {},
        });

        const newNode: Node = {
          id: createdNode.id,
          type: "pipelineNode",
          position: { x: createdNode.position.x, y: createdNode.position.y },
          data: {
            refId: createdNode.refId,
            kind: createdNode.kind,
            label: createdNode.label,
            category: createdNode.category,
            executor: createdNode.executor,
            inputs: createdNode.inputs || [],
            outputs: createdNode.outputs || [],
            configValues: createdNode.configValues || {},
          } as CustomPipelineNodeData,
        };

        setNodes((nds) => [...nds, newNode]);
        setSelectedNodeId(createdNode.id);
      } catch {
        // Handled by toast
      }
    },
    [flowCoordinates, addNodeMutation, setNodes]
  );

  // Update Config for an unwired input pin -> Calls PATCH /api/pipelines/{id}/nodes/{nodeId}
  const handleUpdateConfig = useCallback(
    (nodeId: string, pinId: string, value: any) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id !== nodeId) return n;
          const currentConfig = (n.data as any).configValues || {};
          const updatedConfig = { ...currentConfig, [pinId]: value };

          updateNodeMutation.mutate({
            nodeId,
            data: {
              configValues: updatedConfig,
            },
          });

          return {
            ...n,
            data: {
              ...n.data,
              configValues: updatedConfig,
            },
          };
        })
      );
    },
    [setNodes, updateNodeMutation]
  );

  // Delete Node from inspector -> Calls DELETE /api/pipelines/{id}/nodes/{nodeId}
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      deleteNodeMutation.mutate(nodeId);
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [deleteNodeMutation, selectedNodeId, setNodes, setEdges]
  );

  // Validate Pipeline
  const handleValidate = async () => {
    try {
      const res = await validateMutation.mutateAsync({
        runtimeInputs: {},
      });
      if (res.isValid) {
        toast.success("Pipeline graph is valid with no unresolved dependencies.");
      } else {
        if (res.cycleNodeIds && res.cycleNodeIds.length > 0) {
          toast.error(`Pipeline contains a cycle involving nodes: ${res.cycleNodeIds.join(", ")}`);
        } else if (res.unresolvedPins && res.unresolvedPins.length > 0) {
          toast.error(`Unresolved required pins: ${res.unresolvedPins.map((p) => p.pinLabel || p.pinKey).join(", ")}`);
        }
      }
    } catch (err: any) {
      toast.error(err?.message || "Validation failed");
    }
  };

  const isMutating =
    addNodeMutation.isPending ||
    updateNodeMutation.isPending ||
    deleteNodeMutation.isPending ||
    addEdgeMutation.isPending ||
    deleteEdgeMutation.isPending;

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-background">
      {/* Top Toolbar */}
      <CanvasToolbar
        projectId={projectId}
        pipelineName={graph.name}
        isSaving={isMutating}
        onOpenRunModal={() => setIsRunModalOpen(true)}
        onOpenHistory={() => {
          setDrawerDefaultTab("history");
          setIsDrawerOpen(true);
        }}
        onValidate={handleValidate}
        isValidating={validateMutation.isPending}
      />

      {/* Main Canvas & Inspector Layout */}
      <div className="relative flex flex-1 overflow-hidden">
        <div className="relative flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeDragStop={onNodeDragStop}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onEdgeContextMenu={onEdgeContextMenu}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={defaultEdgeOptions}
            deleteKeyCode={["Backspace", "Delete"]}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            onPaneContextMenu={onPaneContextMenu}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
            className="bg-dot-grid"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="opacity-40" />
            <Controls className="!border-border !bg-background/90 !shadow-md !rounded-lg" />
            <MiniMap
              className="!border-border !bg-background/90 !shadow-md !rounded-lg overflow-hidden hidden md:block"
              zoomable
              pannable
              nodeColor={(node) => {
                const kind = (node.data as any)?.kind?.toLowerCase();
                if (kind === "start") return "#10b981";
                if (kind === "tool") return "#3b82f6";
                return "#a855f7";
              }}
            />
          </ReactFlow>

          {/* Right-click Context Palette Popover */}
          <ContextMenuPalette
            projectId={projectId}
            position={palettePosition}
            onClose={() => setPalettePosition(null)}
            onSelect={handleSelectPaletteItem}
          />

          {/* Live Execution Run & History Drawer */}
          {isDrawerOpen && (
            <LiveExecutionDrawer
              pipelineId={graph.id}
              executionId={activeExecutionId}
              defaultTab={drawerDefaultTab}
              onSelectExecution={(id) => {
                setActiveExecutionId(id);
                setDrawerDefaultTab("inspect");
              }}
              onClose={() => setIsDrawerOpen(false)}
            />
          )}
        </div>

        {/* Selected Node Config Inspector Side Panel */}
        {selectedNode && (
          <NodeConfigInspector
            pipelineId={graph.id}
            node={selectedNode}
            edges={edges}
            nodes={nodes}
            projectId={projectId}
            onClose={() => setSelectedNodeId(null)}
            onUpdateConfig={handleUpdateConfig}
            onDeleteNode={handleDeleteNode}
          />
        )}
      </div>

      {/* Run Pipeline Modal */}
      <RunPipelineModal
        pipelineId={graph.id}
        pipelineName={graph.name}
        projectId={projectId}
        nodes={nodes}
        edges={edges}
        isOpen={isRunModalOpen}
        onClose={() => setIsRunModalOpen(false)}
        onExecutionStarted={(execId) => {
          setActiveExecutionId(execId);
          setDrawerDefaultTab("inspect");
          setIsDrawerOpen(true);
        }}
      />
    </div>
  );
}
