import { Link } from "@tanstack/react-router";
import {
  useWorkflowGraph,
  useWorkflowNodePalette,
  useUpdateWorkflowMutation,
  useTriggerWorkflowMutation,
} from "../hooks/useWorkflows";
import { WorkflowCanvas } from "../components/canvas/WorkflowCanvas";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowLeft,
  Play,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowEditorPageProps {
  projectId: string;
  workflowId: string;
}

export function WorkflowEditorPage({
  projectId,
  workflowId,
}: WorkflowEditorPageProps) {
  const { data: graph, isLoading: isGraphLoading } = useWorkflowGraph(workflowId);
  const { data: palette = [] } = useWorkflowNodePalette();
  const updateMutation = useUpdateWorkflowMutation(projectId, workflowId);
  const triggerMutation = useTriggerWorkflowMutation(workflowId);

  const handleToggleActive = async () => {
    if (!graph) return;
    await updateMutation.mutateAsync({
      id: graph.id,
      data: {
        name: graph.name,
        description: graph.description,
        isActive: !graph.isActive,
      },
    });
  };

  const handleManualTrigger = async () => {
    await triggerMutation.mutateAsync({
      workspaceId: "00000000-0000-0000-0000-000000000000",
      agentId: "00000000-0000-0000-0000-000000000000",
    });
  };

  if (isGraphLoading || !graph) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="text-xs text-muted-foreground">Loading workflow graph...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-background">
      {/* Top Navigation Bar */}
      <div className="h-12 border-b border-border/60 px-4 flex items-center justify-between gap-4 bg-card/80 backdrop-blur shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            to="/projects/$projectId/workflows"
            params={{ projectId }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Workflows</span>
          </Link>

          <span className="text-muted-foreground/40">/</span>

          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-purple-500" />
            <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-md">
              {graph.name}
            </span>
          </div>

          <button
            onClick={handleToggleActive}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-medium border transition-colors flex items-center gap-1.5",
              graph.isActive
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
            )}
          >
            <span
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                graph.isActive ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"
              )}
            />
            {graph.isActive ? "Active (Listening)" : "Paused"}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-8 text-xs gap-1.5 bg-primary shadow-sm"
            onPress={handleManualTrigger}
            isDisabled={triggerMutation.isPending}
          >
            {triggerMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Run Workflow
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <WorkflowCanvas
          graph={graph}
          palette={palette}
          projectId={projectId}
        />
      </div>
    </div>
  );
}
