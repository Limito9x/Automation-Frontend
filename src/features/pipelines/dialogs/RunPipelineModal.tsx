import { useState, useMemo, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import { useGetAgents } from "@/gen/endpoints/agents/agents";
import { useRunPipeline, usePipelineInputSchema } from "../hooks/usePipelineGraph";
import type { PipelineInputDto } from "@/gen/model";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Play, Server, Loader2, AlertCircle, Sparkles, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { getPinVisual, isBooleanPin, isNumberPin, isEntityRefPin, isAssetPin } from "../components/canvas/CustomPipelineNode";
import { EntityPinSelect } from "../components/canvas/EntityPinSelect";
import { AssetPinUpload } from "../components/canvas/AssetPinUpload";

export interface MissingRuntimeInput {
  nodeId: string;
  nodeLabel: string;
  pinId: string;
  pinLabel: string;
  primitiveType: any;
  metadata?: any;
}

interface RunPipelineModalProps {
  pipelineId: string;
  pipelineName: string;
  projectId?: string;
  nodes?: Node[];
  edges?: Edge[];
  isOpen: boolean;
  onClose: () => void;
  onExecutionStarted?: (executionId: string) => void;
}

export function RunPipelineModal({
  pipelineId,
  pipelineName,
  projectId = "",
  nodes = [],
  edges = [],
  isOpen,
  onClose,
  onExecutionStarted,
}: RunPipelineModalProps) {
  const { data: agents = [], isLoading: isLoadingAgents } = useGetAgents();
  const { data: schemaInputs = [], isLoading: isLoadingSchema } = usePipelineInputSchema(pipelineId);

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [runtimeValues, setRuntimeValues] = useState<Record<string, any>>({});
  const runMutation = useRunPipeline(pipelineId);

  // Initialize runtime values with default values from schema inputs
  useEffect(() => {
    if (schemaInputs && schemaInputs.length > 0) {
      setRuntimeValues((prev) => {
        const next = { ...prev };
        for (const input of schemaInputs) {
          if (next[input.key] === undefined && input.defaultValue !== null && input.defaultValue !== undefined) {
            next[input.key] = input.defaultValue;
          }
        }
        return next;
      });
    }
  }, [schemaInputs]);

  // Compute unwired & unconfigured required inputs on other nodes (excluding Start node)
  const additionalMissingInputs = useMemo<MissingRuntimeInput[]>(() => {
    const list: MissingRuntimeInput[] = [];
    for (const node of nodes) {
      const nodeData = node.data as any;
      if (nodeData?.kind === "Start" || nodeData?.refId === "BeginExecute") {
        continue;
      }

      const inputs = nodeData?.inputs || [];
      const configValues = nodeData?.configValues || {};
      for (const pin of inputs) {
        // Skip Exec Pins
        if (pin.kind === 1 || (pin.kind as any) === "Exec" || pin.id === "exec_in" || pin.id === "exec_out") {
          continue;
        }

        if (pin.isRequired) {
          const pinId = pin.id;
          const isConnected = edges.some((e) => e.target === node.id && e.targetHandle === pinId);
          const hasConfig =
            (configValues[pinId] !== undefined && configValues[pinId] !== null && configValues[pinId] !== "") ||
            (pin.defaultValue !== undefined && pin.defaultValue !== null && pin.defaultValue !== "");

          if (!isConnected && !hasConfig) {
            list.push({
              nodeId: node.id,
              nodeLabel: nodeData.label || node.id,
              pinId: pinId,
              pinLabel: pin.label || pinId,
              primitiveType: pin.primitiveType,
              metadata: pin.metadata,
            });
          }
        }
      }
    }
    return list;
  }, [nodes, edges]);

  const handleUpdateRuntimeInput = (key: string, value: any) => {
    setRuntimeValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    if (!selectedAgentId) return;

    try {
      const execution = await runMutation.mutateAsync({
        agentId: selectedAgentId,
        runtimeInputs: runtimeValues,
      });

      onClose();
      if (execution?.id && onExecutionStarted) {
        onExecutionStarted(execution.id);
      }
    } catch {
      // Toast handled by API client
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      className="sm:max-w-[560px] p-6 gap-5"
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-base font-semibold">
          <Play className="h-4 w-4 text-primary fill-primary" />
          <span>Run Pipeline</span>
        </DialogTitle>
        <p className="text-xs text-muted-foreground">
          Running <span className="font-semibold text-foreground">{pipelineName}</span> requires selecting an Execution Agent and specifying pipeline inputs.
        </p>
      </DialogHeader>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* 1. Pipeline Start Inputs Section (From Backend Schema) */}
          {isLoadingSchema ? (
            <div className="flex items-center justify-center py-4 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              Loading input schema...
            </div>
          ) : schemaInputs.length > 0 ? (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Pipeline Start Inputs ({schemaInputs.length})</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                These inputs are injected into the Start Node when execution begins:
              </p>

              <div className="space-y-2.5">
                {schemaInputs.map((input: PipelineInputDto) => {
                  const key = input.key;
                  const visual = getPinVisual(input.type);
                  const currentVal = runtimeValues[key] ?? "";

                  return (
                    <div key={key} className="rounded-lg border border-border/70 bg-card p-2.5 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-[11px] font-semibold text-foreground truncate">
                            {input.label || input.key}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono truncate">
                            ({input.key})
                          </span>
                          {input.isRequired && (
                            <span className="text-destructive font-bold text-xs">*</span>
                          )}
                        </div>
                        <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5 h-4 font-semibold", visual.textClass)}>
                          {visual.label}
                        </Badge>
                      </div>

                      <div>
                        {isBooleanPin(input.type) ? (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-muted-foreground">Enable</span>
                            <Switch
                              isSelected={Boolean(currentVal)}
                              onChange={(v) => handleUpdateRuntimeInput(key, v)}
                            />
                          </div>
                        ) : isNumberPin(input.type) ? (
                          <Input
                            type="number"
                            value={currentVal}
                            onChange={(e) => handleUpdateRuntimeInput(key, e.target.value === "" ? null : Number(e.target.value))}
                            placeholder={`Enter ${input.label || input.key}...`}
                            className="h-8 text-xs bg-background"
                          />
                        ) : isAssetPin(input.type) || input.key?.toLowerCase().includes("preset") ? (
                          <AssetPinUpload
                            value={currentVal}
                            onChange={(val) => handleUpdateRuntimeInput(key, val)}
                            placeholder={`Upload ${input.label || input.key} file...`}
                          />
                        ) : isEntityRefPin(input.type) ? (
                          <EntityPinSelect
                            entityType={
                              input.defaultValue ||
                              (input.key?.toLowerCase().includes("workspace")
                                ? "Workspace"
                                : input.key?.toLowerCase().includes("tag")
                                ? "Tag"
                                : input.key?.toLowerCase().includes("inspector")
                                ? "Inspector"
                                : input.key?.toLowerCase().includes("agent")
                                ? "Agent"
                                : "Resource")
                            }
                            projectId={projectId}
                            value={currentVal}
                            onChange={(val) => handleUpdateRuntimeInput(key, val)}
                            placeholder={`Select ${input.label || input.key}...`}
                          />
                        ) : (
                          <Input
                            type="text"
                            value={currentVal}
                            onChange={(e) => handleUpdateRuntimeInput(key, e.target.value)}
                            placeholder={`Enter ${input.label || input.key}...`}
                            className="h-8 text-xs bg-background"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* 2. Additional Unwired Required Inputs */}
          {additionalMissingInputs.length > 0 && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Additional Unconnected Inputs ({additionalMissingInputs.length})</span>
              </div>
              <div className="space-y-2.5">
                {additionalMissingInputs.map((input) => {
                  const key = `${input.nodeId}.${input.pinId}`;
                  const visual = getPinVisual(input.primitiveType);
                  const currentVal = runtimeValues[key] ?? "";

                  return (
                    <div key={key} className="rounded-lg border border-border/70 bg-card p-2.5 space-y-1.5 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold text-foreground truncate">
                          {input.nodeLabel} &rarr; {input.pinLabel}
                        </span>
                        <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5 h-4 font-semibold", visual.textClass)}>
                          {visual.label}
                        </Badge>
                      </div>
                      {isAssetPin(input.primitiveType) || input.pinId?.toLowerCase().includes("preset") ? (
                        <AssetPinUpload
                          value={currentVal}
                          onChange={(val) => handleUpdateRuntimeInput(key, val)}
                          placeholder={`Upload ${input.pinLabel}...`}
                        />
                      ) : (
                        <Input
                          type="text"
                          value={currentVal}
                          onChange={(e) => handleUpdateRuntimeInput(key, e.target.value)}
                          placeholder={`Enter ${input.pinLabel}...`}
                          className="h-8 text-xs bg-background"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Select Agent Section */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Select Execution Agent</span>
            </Label>
            {isLoadingAgents ? (
              <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading registered agents...
              </div>
            ) : agents.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-dashed border-destructive/40 p-4 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>No agents registered. Please start an Automation-Agent worker first.</span>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id;
                  const isOnline = agent.isActive;

                  return (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setSelectedAgentId(agent.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-lg border p-2.5 text-left text-xs transition-all",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border/70 hover:border-border hover:bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
                            isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Server className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="block font-medium text-foreground truncate">{agent.name}</span>
                          <span className="block text-[10px] text-muted-foreground font-mono truncate">{agent.id}</span>
                        </div>
                      </div>

                      <Badge
                        variant={isOnline ? "default" : "secondary"}
                        className={cn(
                          "h-5 text-[10px] shrink-0 capitalize",
                          isOnline && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30"
                        )}
                      >
                        {isOnline ? "Active" : "Inactive"}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t">
          <Button variant="outline" size="sm" onPress={onClose} isDisabled={runMutation.isPending}>
            Cancel
          </Button>
          <Button
            size="sm"
            onPress={handleRun}
            isDisabled={!selectedAgentId || runMutation.isPending}
            className="gap-1.5"
          >
            {runMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Triggering...</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Execute Run</span>
              </>
            )}
          </Button>
        </DialogFooter>
    </Dialog>
  );
}
