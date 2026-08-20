import { useState, useMemo } from "react";
import { usePipelineExecution, usePipelineExecutions } from "../../hooks/usePipelineGraph";
import type { PipelineExecutionDto } from "../../hooks/usePipelineGraph";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Terminal,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Server,
  History,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  ChevronRight,
  RefreshCw,
  Layers,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveExecutionDrawerProps {
  pipelineId: string;
  executionId: string | null;
  onSelectExecution?: (id: string) => void;
  onClose: () => void;
  defaultTab?: "history" | "inspect";
}

export function LiveExecutionDrawer({
  pipelineId,
  executionId,
  onSelectExecution,
  onClose,
  defaultTab = "inspect",
}: LiveExecutionDrawerProps) {
  const [activeTab, setActiveTab] = useState<"history" | "inspect">(defaultTab);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Queries
  const { data: executions, isLoading: isHistoryLoading, refetch: refetchHistory } = usePipelineExecutions(pipelineId);
  const { data: execution, isLoading: isExecLoading } = usePipelineExecution(executionId || undefined);

  // Selected execution defaults to current executionId or first in history
  const activeExecution: PipelineExecutionDto | undefined = useMemo(() => {
    if (execution && execution.id === executionId) return execution;
    if (executionId && executions) {
      return executions.find((e) => e.id === executionId) || execution;
    }
    return executions?.[0] || execution;
  }, [execution, executionId, executions]);

  const getStatusBadge = (status: any) => {
    const s = Number(status) || status;
    const isSucc = s === 4 || s === "Succeeded";
    const isFail = s === 5 || s === "Failed";
    const isRun = s === 2 || s === 3 || s === "Running" || s === "WaitingForAgent";

    const label =
      s === 1 || s === "Pending" ? "Pending" :
      s === 2 || s === "Running" ? "Running" :
      s === 3 || s === "WaitingForAgent" ? "WaitingForAgent" :
      s === 4 || s === "Succeeded" ? "Succeeded" :
      s === 5 || s === "Failed" ? "Failed" :
      s === 6 || s === "Cancelled" ? "Cancelled" : String(s);

    return (
      <Badge
        variant={isSucc ? "default" : isFail ? "destructive" : "secondary"}
        className={cn(
          "text-[10px] capitalize gap-1 shrink-0 font-medium",
          isSucc && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          isRun && "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 animate-pulse",
          isFail && "bg-destructive/15 text-destructive border-destructive/30"
        )}
      >
        {isRun && <Loader2 className="h-3 w-3 animate-spin" />}
        {isSucc && <CheckCircle2 className="h-3 w-3" />}
        {isFail && <AlertCircle className="h-3 w-3" />}
        <span>{label}</span>
      </Badge>
    );
  };

  // Parse ExecutionState JSON
  const stateData = useMemo(() => {
    if (!activeExecution?.executionState) return null;
    try {
      if (typeof activeExecution.executionState === "string") {
        return JSON.parse(activeExecution.executionState);
      }
      return activeExecution.executionState;
    } catch {
      return null;
    }
  }, [activeExecution?.executionState]);

  const handleCopyJson = () => {
    if (!stateData) return;
    navigator.clipboard.writeText(JSON.stringify(stateData, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "absolute bottom-4 left-4 right-4 md:left-12 md:right-12 z-30 rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl overflow-hidden transition-all duration-300 flex flex-col",
        isExpanded ? "h-[540px]" : "h-[300px]"
      )}
    >
      {/* Drawer Header & Tabs */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2 shrink-0">
        <div className="flex items-center gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center bg-background/80 rounded-lg p-0.5 border border-border/60">
            <button
              onClick={() => setActiveTab("inspect")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all",
                activeTab === "inspect"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
              <span>Inspect Details</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all",
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="h-3.5 w-3.5" />
              <span>History</span>
              {executions && executions.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[9px] rounded-full bg-primary/20 text-foreground font-mono">
                  {executions.length}
                </span>
              )}
            </button>
          </div>

          {/* Active Status Badge */}
          {activeExecution && activeTab === "inspect" && getStatusBadge(activeExecution.status)}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {activeTab === "history" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onPress={() => refetchHistory()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}

          {activeTab === "inspect" && stateData && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
              onPress={handleCopyJson}
            >
              {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              <span>{isCopied ? "Copied State" : "Copy JSON"}</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onPress={() => setIsExpanded((prev) => !prev)}
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>

          <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground" onPress={onClose}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 text-xs">
        {/* TAB 1: HISTORY LIST */}
        {activeTab === "history" && (
          <div className="space-y-2">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading execution history...
              </div>
            ) : !executions || executions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-1">
                <History className="h-8 w-8 opacity-30" />
                <p>No executions found for this pipeline.</p>
                <span className="text-[11px]">Click "Run Pipeline" above to execute.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {executions.map((exec) => {
                  const isSelected = exec.id === activeExecution?.id;
                  return (
                    <div
                      key={exec.id}
                      onClick={() => {
                        onSelectExecution?.(exec.id);
                        setActiveTab("inspect");
                      }}
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-lg border bg-card/60 hover:bg-muted/50 cursor-pointer transition-all duration-150",
                        isSelected ? "border-primary ring-1 ring-primary/40 bg-primary/5" : "border-border/60"
                      )}
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-[11px] font-semibold text-foreground truncate">
                            {exec.id.slice(0, 8)}...{exec.id.slice(-4)}
                          </code>
                          {getStatusBadge(exec.status)}
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                          {exec.startedAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(exec.startedAt).toLocaleTimeString()}
                            </span>
                          )}
                          {exec.agentId && (
                            <span className="flex items-center gap-1">
                              <Server className="h-3 w-3" />
                              Agent: {exec.agentId.slice(0, 6)}...
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="text-[10px] font-medium hidden sm:inline">Inspect</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INSPECT DETAILS */}
        {activeTab === "inspect" && (
          <div className="space-y-3">
            {isExecLoading && !activeExecution ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connecting to execution stream...
              </div>
            ) : !activeExecution ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground space-y-1">
                <Terminal className="h-8 w-8 opacity-30" />
                <p>No execution selected.</p>
                <span className="text-[11px]">Select a run from the History tab.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Meta Overview Bar */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40 border border-border/60 text-[11px]">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-muted-foreground">
                      Execution ID: <code className="font-mono text-foreground font-semibold">{activeExecution.id}</code>
                    </span>
                    <span className="text-muted-foreground">
                      Next Step: <strong className="text-foreground">#{activeExecution.nextNodeIndex ?? 0}</strong>
                    </span>
                    {activeExecution.agentId && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Server className="h-3 w-3" />
                        Agent: <code className="font-mono text-foreground">{activeExecution.agentId}</code>
                      </span>
                    )}
                  </div>
                  {activeExecution.startedAt && (
                    <span className="text-muted-foreground flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3" />
                      Started: {new Date(activeExecution.startedAt).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Error Alert */}
                {activeExecution.errorMessage && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-2.5 text-destructive text-xs space-y-0.5">
                    <strong className="flex items-center gap-1 font-semibold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Execution Error:
                    </strong>
                    <p className="font-mono text-[11px] whitespace-pre-wrap">{activeExecution.errorMessage}</p>
                  </div>
                )}

                {/* Node Outputs Summary & State Viewer */}
                {stateData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {/* Left: Node Outputs Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                        <Layers className="h-3.5 w-3.5 text-primary" />
                        <span>Node Outputs Breakdown</span>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {stateData.NodeOutputs && Object.keys(stateData.NodeOutputs).length > 0 ? (
                          Object.entries(stateData.NodeOutputs).map(([nodeId, outputs]: [string, any]) => (
                            <div key={nodeId} className="p-2.5 rounded-lg border border-border/60 bg-card/60 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <code className="font-mono text-[10px] text-muted-foreground font-semibold">
                                  Node: {nodeId.slice(0, 8)}...{nodeId.slice(-4)}
                                </code>
                                <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-mono">
                                  {Object.keys(outputs || {}).length} output(s)
                                </Badge>
                              </div>

                              <div className="space-y-1 font-mono text-[11px]">
                                {Object.entries(outputs || {}).map(([outKey, outVal]: [string, any]) => (
                                  <div key={outKey} className="flex items-start gap-2 bg-muted/40 px-2 py-1 rounded">
                                    <span className="text-primary font-semibold shrink-0">{outKey}:</span>
                                    <span className="text-foreground break-all">
                                      {typeof outVal === "object" ? JSON.stringify(outVal) : String(outVal)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground border border-dashed rounded-lg">
                            No node outputs recorded yet.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Raw JSON State Inspector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                          <Code2 className="h-3.5 w-3.5 text-primary" />
                          <span>Full JSON Execution State</span>
                        </div>
                      </div>

                      <div className="relative rounded-lg border border-border/60 bg-muted/30 p-2.5 font-mono text-[11px] text-foreground max-h-[300px] overflow-auto">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(stateData, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
