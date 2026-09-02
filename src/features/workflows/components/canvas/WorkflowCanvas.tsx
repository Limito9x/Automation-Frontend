import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { WorkflowNode } from "./WorkflowNode";
import { WorkflowNodeInspector } from "./WorkflowNodeInspector";
import { WorkflowLiveDrawer } from "./WorkflowLiveDrawer";
import {
  useAddWorkflowNodeMutation,
  useUpdateWorkflowNodeMutation,
  useDeleteWorkflowNodeMutation,
  useAddWorkflowEdgeMutation,
  useDeleteWorkflowEdgeMutation,
  useTriggerWorkflowMutation,
  useWorkflowExecutions,
} from "../../hooks/useWorkflows";
import { useWorkflowSignalR } from "../../hooks/useWorkflowSignalR";
import type {
  WorkflowGraphDto,
  WorkflowNodePaletteItemDto,
  WorkflowNodeExecutionDto,
} from "@/gen/model";

const nodeTypes = {
  workflowNode: WorkflowNode as any,
};

interface WorkflowCanvasProps {
  graph: WorkflowGraphDto;
  palette: WorkflowNodePaletteItemDto[];
  projectId: string;
}

export function WorkflowCanvas({ graph, palette, projectId }: WorkflowCanvasProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | undefined>();

  // Mutations
  const addNodeMutation = useAddWorkflowNodeMutation(graph.id);
  const updateNodeMutation = useUpdateWorkflowNodeMutation(graph.id);
  const deleteNodeMutation = useDeleteWorkflowNodeMutation(graph.id);
  const addEdgeMutation = useAddWorkflowEdgeMutation(graph.id);
  const deleteEdgeMutation = useDeleteWorkflowEdgeMutation(graph.id);
  const triggerMutation = useTriggerWorkflowMutation(graph.id);

  // Query executions
  const { data: executions = [] } = useWorkflowExecutions(graph.id);

  // Active execution for highlighting nodes on canvas
  const activeExecution =
    executions.find((e) => e.id === selectedExecutionId) || executions[0];

  // SignalR realtime updates
  useWorkflowSignalR(graph.id, {
    onExecutionStarted: (exec) => {
      setSelectedExecutionId(exec.executionId);
    },
  });

  // Convert backend graph nodes to xyflow nodes
  const initialNodes: Node[] = useMemo(() => {
    return graph.nodes.map((n) => {
      const nodeExecs = (activeExecution?.nodeExecutions as WorkflowNodeExecutionDto[]) || [];
      const nodeExec = nodeExecs.find((ne) => ne.workflowNodeId === n.id);

      let parsedConfig = n.config;
      if (typeof n.config === "string") {
        try {
          parsedConfig = JSON.parse(n.config);
        } catch {}
      }

      const statusStr = String(nodeExec?.status || "");
      let execStatus: "idle" | "running" | "succeeded" | "failed" | "pending" = "idle";
      if (statusStr === "2" || statusStr.toLowerCase() === "running") execStatus = "running";
      else if (statusStr === "3" || statusStr.toLowerCase() === "succeeded") execStatus = "succeeded";
      else if (statusStr === "4" || statusStr.toLowerCase() === "failed") execStatus = "failed";
      else if (statusStr === "1" || statusStr.toLowerCase() === "pending") execStatus = "pending";

      return {
        id: n.id,
        type: "workflowNode",
        position: { x: n.position.x, y: n.position.y },
        data: {
          refId: n.refId,
          kind: n.kind,
          label: n.refId,
          config: parsedConfig,
          executionStatus: execStatus,
          executionError: nodeExec?.errorMessage,
        },
      };
    });
  }, [graph.nodes, activeExecution]);

  // Convert backend graph edges to xyflow edges
  const initialEdges: Edge[] = useMemo(() => {
    const isExecRunning =
      String(activeExecution?.status) === "2" ||
      String(activeExecution?.status).toLowerCase() === "running";

    return graph.edges.map((e) => ({
      id: e.id,
      source: e.sourceWorkflowNodeId,
      sourceHandle: e.sourcePin,
      target: e.targetWorkflowNodeId,
      targetHandle: e.targetPin,
      animated: isExecRunning,
      style: { strokeWidth: 2 },
    }));
  }, [graph.edges, activeExecution]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Keep xyflow state in sync when graph or activeExecution changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Edge connection handler
  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: Edge = {
        id: `temp_${Date.now()}`,
        source: params.source,
        sourceHandle: params.sourceHandle || "exec_out",
        target: params.target,
        targetHandle: params.targetHandle || "exec_in",
        animated: true,
      };

      setEdges((eds) => addEdge(newEdge, eds));

      try {
        await addEdgeMutation.mutateAsync({
          sourceWorkflowNodeId: params.source,
          sourcePin: params.sourceHandle || "exec_out",
          targetWorkflowNodeId: params.target,
          targetPin: params.targetHandle || "exec_in",
        });
      } catch {
        // Rollback edge if failed
        setEdges((eds) => eds.filter((e) => e.id !== newEdge.id));
      }
    },
    [addEdgeMutation, setEdges]
  );

  // Edge deletion handler
  const onEdgesDelete = useCallback(
    async (deletedEdges: Edge[]) => {
      for (const edge of deletedEdges) {
        if (!edge.id.startsWith("temp_")) {
          await deleteEdgeMutation.mutateAsync(edge.id);
        }
      }
    },
    [deleteEdgeMutation]
  );

  // Node drag end handler (save positions)
  const onNodeDragStop = useCallback(
    async (_: any, node: Node) => {
      const graphNode = graph.nodes.find((n) => n.id === node.id);
      if (!graphNode) return;

      let parsedConfig = graphNode.config;
      if (typeof graphNode.config === "string") {
        try {
          parsedConfig = JSON.parse(graphNode.config);
        } catch {}
      }

      await updateNodeMutation.mutateAsync({
        nodeId: node.id,
        data: {
          positionX: node.position.x,
          positionY: node.position.y,
          config: parsedConfig,
        },
      });
    },
    [graph.nodes, updateNodeMutation]
  );

  // Node selection handler
  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);

  const handleUpdateConfig = async (nodeId: string, config: any) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    await updateNodeMutation.mutateAsync({
      nodeId,
      data: {
        positionX: node.position.x,
        positionY: node.position.y,
        config,
      },
    });
  };

  const handleDeleteNode = async (nodeId: string) => {
    await deleteNodeMutation.mutateAsync(nodeId);
    setSelectedNodeId(null);
  };

  const handleManualTrigger = async () => {
    await triggerMutation.mutateAsync({
      workspaceId: "00000000-0000-0000-0000-000000000000",
      agentId: "00000000-0000-0000-0000-000000000000",
    });
  };

  // Add node from Palette
  const handleAddPaletteNode = async (item: WorkflowNodePaletteItemDto) => {
    const posX = 400 + Math.random() * 80;
    const posY = 150 + Math.random() * 80;

    let kindEnum: any = 1;
    if (item.kind === "ConditionFilter" || item.kind === "2") kindEnum = 2;
    if (item.kind === "ExecutePipeline" || item.kind === "3") kindEnum = 3;
    if (item.kind === "SendNotification" || item.kind === "4") kindEnum = 4;

    await addNodeMutation.mutateAsync({
      kind: kindEnum,
      refId: item.name || item.kind,
      positionX: posX,
      positionY: posY,
      config: {},
    });
  };

  return (
    <div className="relative w-full h-full flex overflow-hidden">
      {/* Palette Toolbar (Floating Top Left) */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur border border-border/80 rounded-xl p-2 shadow-lg flex items-center gap-2">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2">
          Add Step:
        </span>
        {palette.map((item) => {
          const isTrigger = item.kind === "EventTrigger" || item.kind === "1";
          if (isTrigger) return null; // EventTrigger is single entry point

          return (
            <button
              key={item.name || item.kind}
              onClick={() => handleAddPaletteNode(item)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/60 bg-muted/30 hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all text-xs font-medium cursor-pointer select-none"
            >
              <span>+</span>
              <span>{item.name || item.kind}</span>
            </button>
          );
        })}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          onNodeDragStop={onNodeDragStop}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: "smoothstep",
            animated: true,
          }}
        >
          <Background gap={16} size={1} />
          <Controls position="top-right" />
          <MiniMap
            position="bottom-right"
            className="!bottom-14 !right-4 !bg-card/80 !border-border"
          />
        </ReactFlow>

        {/* Live Execution Monitoring Drawer */}
        <WorkflowLiveDrawer
          executions={executions}
          selectedExecutionId={selectedExecutionId}
          nodes={graph.nodes}
          onSelectExecution={setSelectedExecutionId}
          onManualTrigger={handleManualTrigger}
          isTriggering={triggerMutation.isPending}
        />
      </div>

      {/* Right Side Inspector */}
      {selectedNode && (
        <WorkflowNodeInspector
          node={selectedNode}
          projectId={projectId}
          onClose={() => setSelectedNodeId(null)}
          onUpdateConfig={handleUpdateConfig}
          onDeleteNode={handleDeleteNode}
        />
      )}
    </div>
  );
}
