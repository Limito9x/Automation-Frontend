import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  GitBranch,
  Boxes,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowNodeKind } from "@/gen/model";

export interface WorkflowNodeData extends Record<string, unknown> {
  refId: string;
  kind: WorkflowNodeKind | string;
  label: string;
  config?: Record<string, any>;
  executionStatus?: "idle" | "pending" | "running" | "succeeded" | "failed";
  executionError?: string | null;
  pipelineName?: string;
  pipelineInputs?: Array<{ key: string; label: string; type: string }>;
  pipelineOutputs?: Array<{ key: string; label: string; type: string }>;
}

export const WorkflowNode = memo(({ data, selected }: NodeProps<any>) => {
  const nodeData = data as WorkflowNodeData;
  const kind = String(nodeData.kind);
  const isEvent = kind === "EventTrigger" || kind === "1";
  const isCondition = kind === "ConditionFilter" || kind === "2";
  const isExecutePipeline = kind === "ExecutePipeline" || kind === "3";
  const isNotification = kind === "SendNotification" || kind === "4";

  const status = nodeData.executionStatus || "idle";
  const isRunning = status === "running";
  const isSucceeded = status === "succeeded";
  const isFailed = status === "failed";

  // Visual header styling by kind
  const getTheme = () => {
    if (isEvent) {
      return {
        bg: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
        badge: "bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/30",
        icon: <Zap className="h-4 w-4 text-purple-500" />,
        headerTitle: "Event Trigger",
      };
    }
    if (isCondition) {
      return {
        bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
        badge: "bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30",
        icon: <GitBranch className="h-4 w-4 text-amber-500" />,
        headerTitle: "Condition Filter",
      };
    }
    if (isExecutePipeline) {
      return {
        bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
        badge: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
        icon: <Boxes className="h-4 w-4 text-emerald-500" />,
        headerTitle: "Execute Pipeline",
      };
    }
    return {
      bg: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400",
      badge: "bg-sky-500/20 text-sky-600 dark:text-sky-300 border-sky-500/30",
      icon: <Send className="h-4 w-4 text-sky-500" />,
      headerTitle: "Notification",
    };
  };

  const theme = getTheme();

  return (
    <div
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200 min-w-[240px] max-w-[320px] select-none",
        selected && "ring-2 ring-primary shadow-md",
        isRunning && "ring-2 ring-blue-500 shadow-blue-500/20 animate-pulse",
        isSucceeded && "border-emerald-500/60 shadow-emerald-500/10",
        isFailed && "border-destructive ring-1 ring-destructive"
      )}
    >
      {/* Node Header */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 rounded-t-xl border-b",
          theme.bg
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {theme.icon}
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold truncate leading-tight">
              {nodeData.label || theme.headerTitle}
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              {theme.headerTitle}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        {status !== "idle" && (
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0 h-4 capitalize shrink-0 gap-1",
              isRunning && "bg-blue-500/20 text-blue-500 border-blue-500/40 animate-pulse",
              isSucceeded && "bg-emerald-500/20 text-emerald-500 border-emerald-500/40",
              isFailed && "bg-destructive/20 text-destructive border-destructive/40"
            )}
          >
            {isRunning && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
            {isSucceeded && <CheckCircle2 className="h-2.5 w-2.5" />}
            {isFailed && <AlertCircle className="h-2.5 w-2.5" />}
            {status}
          </Badge>
        )}
      </div>

      {/* Node Body & Handles */}
      <div className="p-3 space-y-2.5 text-xs">
        {/* Node description / metadata preview */}
        {isEvent && (
          <div className="space-y-1 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
            <div className="flex justify-between">
              <span>Event:</span>
              <span className="font-medium text-foreground">
                {nodeData.config?.eventType || "OnResourceCreated"}
              </span>
            </div>
            {nodeData.config?.workspaceId && (
              <div className="flex justify-between truncate">
                <span>Workspace:</span>
                <span className="font-medium text-foreground truncate max-w-[120px]">
                  {nodeData.config.workspaceId}
                </span>
              </div>
            )}
          </div>
        )}

        {isCondition && (
          <div className="space-y-1 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
            <div className="flex justify-between">
              <span>Extensions:</span>
              <span className="font-medium text-foreground">
                {nodeData.config?.extensions?.join(", ") || "All"}
              </span>
            </div>
            {nodeData.config?.pathPattern && (
              <div className="flex justify-between">
                <span>Pattern:</span>
                <span className="font-medium text-foreground">
                  {nodeData.config.pathPattern}
                </span>
              </div>
            )}
          </div>
        )}

        {isExecutePipeline && (
          <div className="space-y-1 text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50">
            <div className="flex justify-between">
              <span>Pipeline:</span>
              <span className="font-medium text-foreground truncate max-w-[130px]">
                {nodeData.pipelineName ||
                  nodeData.config?.pipelineId ||
                  "Not Selected"}
              </span>
            </div>
          </div>
        )}

        {isNotification && (
          <div className="text-[11px] text-muted-foreground bg-muted/40 p-2 rounded-md border border-border/50 truncate">
            <span className="block truncate">
              {nodeData.config?.webhookUrl || "No webhook URL configured"}
            </span>
          </div>
        )}

        {/* Error message display if failed */}
        {isFailed && nodeData.executionError && (
          <div className="p-2 rounded bg-destructive/10 border border-destructive/30 text-destructive text-[11px] break-words">
            {nodeData.executionError}
          </div>
        )}

        {/* Pin Connections */}
        <div className="flex justify-between items-center pt-1">
          {/* Input Handle (Left) */}
          {!isEvent ? (
            <div className="relative flex items-center gap-1.5">
              <Handle
                type="target"
                position={Position.Left}
                id="exec_in"
                className="!w-3 !h-3 !bg-muted-foreground !border-2 !border-background hover:!bg-primary transition-colors !-left-[19px]"
              />
              <span className="text-[10px] text-muted-foreground font-mono">
                in
              </span>
            </div>
          ) : (
            <div />
          )}

          {/* Output Handles (Right) */}
          {isCondition ? (
            <div className="flex flex-col gap-2 items-end">
              <div className="relative flex items-center gap-1.5">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  True
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="true_out"
                  className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-background hover:!bg-emerald-600 transition-colors !-right-[19px]"
                />
              </div>
              <div className="relative flex items-center gap-1.5">
                <span className="text-[10px] text-destructive font-semibold">
                  False
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="false_out"
                  className="!w-3 !h-3 !bg-destructive !border-2 !border-background hover:!bg-red-600 transition-colors !-right-[19px]"
                />
              </div>
            </div>
          ) : (
            <div className="relative flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground font-mono">
                out
              </span>
              <Handle
                type="source"
                position={Position.Right}
                id="exec_out"
                className="!w-3 !h-3 !bg-primary !border-2 !border-background hover:!bg-primary/80 transition-colors !-right-[19px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

WorkflowNode.displayName = "WorkflowNode";
