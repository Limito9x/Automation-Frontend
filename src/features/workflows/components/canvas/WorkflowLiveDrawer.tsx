import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  Radio,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowExecutionDto, WorkflowNodeDto, WorkflowNodeExecutionDto } from "@/gen/model";

interface WorkflowLiveDrawerProps {
  executions: WorkflowExecutionDto[];
  selectedExecutionId?: string;
  nodes: WorkflowNodeDto[];
  onSelectExecution: (id: string) => void;
  onManualTrigger: () => void;
  isTriggering?: boolean;
}

export function WorkflowLiveDrawer({
  executions,
  selectedExecutionId,
  nodes,
  onSelectExecution,
  onManualTrigger,
  isTriggering,
}: WorkflowLiveDrawerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedExecution = executions.find((e) => e.id === selectedExecutionId) || executions[0];

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div
      className={cn(
        "absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border shadow-2xl transition-all duration-300 z-30 flex flex-col",
        isExpanded ? "h-80" : "h-11"
      )}
    >
      {/* Drawer Bar */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border/40 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs gap-1.5 font-medium"
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Terminal className="h-3.5 w-3.5 text-primary" />
            <span>Live Executions</span>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronUp className="h-3.5 w-3.5" />
            )}
          </Button>

          <Badge
            variant="outline"
            className="text-[10px] px-2 py-0 h-5 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1"
          >
            <Radio className="h-2.5 w-2.5 animate-pulse" />
            SignalR Live
          </Badge>

          {selectedExecution && (
            <span className="text-xs text-muted-foreground hidden sm:inline-block">
              Latest:{" "}
              <span className="font-mono text-foreground">
                {selectedExecution.id.slice(0, 8)}
              </span>{" "}
              ({selectedExecution.status})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="default"
            className="h-7 text-xs px-3 gap-1.5 bg-primary"
            onPress={onManualTrigger}
            isDisabled={isTriggering}
          >
            {isTriggering ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            Trigger Run
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-x divide-border/60 overflow-hidden text-xs">
          {/* Left Column: Execution History List */}
          <div className="h-full flex flex-col overflow-hidden">
            <div className="p-2 border-b border-border/40 bg-muted/20 font-semibold text-[11px] text-muted-foreground">
              Executions History ({executions.length})
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-border/30">
              {executions.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-xs">
                  No executions recorded yet.
                </div>
              ) : (
                executions.map((exec) => {
                  const isSel = exec.id === selectedExecution?.id;
                  return (
                    <div
                      key={exec.id}
                      onClick={() => onSelectExecution(exec.id)}
                      className={cn(
                        "p-2.5 cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between gap-2",
                        isSel && "bg-muted/80 border-l-2 border-primary"
                      )}
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-semibold">
                            {exec.id.slice(0, 8)}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {exec.triggerEventType || "Manual"}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {exec.startedAt
                            ? new Date(exec.startedAt).toLocaleTimeString()
                            : "Just now"}
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 capitalize shrink-0",
                          (String(exec.status) === "2" || String(exec.status).toLowerCase() === "running") &&
                            "bg-blue-500/20 text-blue-500 border-blue-500/40 animate-pulse",
                          (String(exec.status) === "3" || String(exec.status).toLowerCase() === "succeeded") &&
                            "bg-emerald-500/20 text-emerald-500 border-emerald-500/40",
                          (String(exec.status) === "4" || String(exec.status).toLowerCase() === "failed") &&
                            "bg-destructive/20 text-destructive border-destructive/40"
                        )}
                      >
                        {String(exec.status) === "2" ? "Running" : String(exec.status) === "3" ? "Succeeded" : String(exec.status) === "4" ? "Failed" : "Pending"}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right 2 Columns: Node Execution Step Details */}
          <div className="col-span-2 h-full flex flex-col overflow-hidden bg-muted/10">
            <div className="p-2 border-b border-border/40 bg-muted/20 font-semibold text-[11px] text-muted-foreground flex justify-between items-center">
              <span>
                Node Execution Flow & Output Trace (
                {selectedExecution?.id.slice(0, 8) || "None"})
              </span>
              {selectedExecution?.errorMessage && (
                <span className="text-destructive font-normal truncate max-w-xs">
                  {selectedExecution.errorMessage}
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {!selectedExecution ? (
                <div className="text-center text-muted-foreground py-8">
                  Select an execution to inspect details.
                </div>
              ) : (selectedExecution.nodeExecutions?.length ?? 0) === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No node steps recorded for this execution.
                </div>
              ) : (
                ((selectedExecution.nodeExecutions as WorkflowNodeExecutionDto[]) || []).map((ne) => {
                  const nodeDef = nodeMap.get(ne.workflowNodeId);
                  const statusStr = String(ne.status);
                  const isNodeFailed = statusStr === "4" || statusStr.toLowerCase() === "failed";
                  const isNodeRunning = statusStr === "2" || statusStr.toLowerCase() === "running";
                  const isNodeSuccess = statusStr === "3" || statusStr.toLowerCase() === "succeeded";

                  return (
                    <div
                      key={ne.id}
                      className="p-2.5 rounded-lg border border-border/60 bg-card space-y-1.5 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-medium">
                          {isNodeRunning && (
                            <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
                          )}
                          {isNodeSuccess && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          {isNodeFailed && (
                            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                          )}
                          <span>
                            {nodeDef?.refId || ne.workflowNodeId}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            ({nodeDef?.kind || "Node"})
                          </span>
                        </div>

                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 capitalize",
                            isNodeRunning &&
                              "bg-blue-500/20 text-blue-500 border-blue-500/40",
                            isNodeSuccess &&
                              "bg-emerald-500/20 text-emerald-500 border-emerald-500/40",
                            isNodeFailed &&
                              "bg-destructive/20 text-destructive border-destructive/40"
                          )}
                        >
                          {isNodeRunning ? "Running" : isNodeSuccess ? "Succeeded" : isNodeFailed ? "Failed" : "Pending"}
                        </Badge>
                      </div>

                      {ne.errorMessage && (
                        <div className="p-1.5 rounded bg-destructive/10 text-destructive text-[11px] font-mono">
                          {ne.errorMessage}
                        </div>
                      )}

                      {ne.output && (
                        <pre className="p-1.5 rounded bg-muted/60 text-[10px] font-mono overflow-x-auto max-h-24">
                          {typeof ne.output === "string"
                            ? ne.output
                            : JSON.stringify(ne.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
