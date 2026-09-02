import { useState, useEffect } from "react";
import type { Node, Edge } from "@xyflow/react";
import type { CustomPipelineNodeData } from "./CustomPipelineNode";
import { isBooleanPin, isNumberPin, isEntityRefPin, isAssetPin, isVariablePin, getPinVisual, formatPinTypeLabel } from "./CustomPipelineNode";
import { EntityPinSelect } from "./EntityPinSelect";
import { AssetPinUpload } from "./AssetPinUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trash2,
  X,
  Link,
  Sliders,
  Box,
  FileCode,
  PlayCircle,
  Sparkles,
  Plus,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineVariableDto } from "../../hooks/usePipelineGraph";
import {
  usePipelineInputSchema,
  useAddPipelineInput,
  useDeletePipelineInput,
} from "../../hooks/usePipelineGraph";
import { toast } from "sonner";

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 350,
  ...props
}: {
  value: string | number;
  onChange: (value: any) => void;
  debounce?: number;
  [key: string]: any;
}) {
  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (val !== initialValue) {
        onChange(val);
      }
    }, debounce);
    return () => clearTimeout(timer);
  }, [val, debounce, initialValue, onChange]);

  return (
    <Input
      value={val ?? ""}
      onChange={(e) => setVal(e.target.value)}
      {...props}
    />
  );
}

function DebouncedTextarea({
  value: initialValue,
  onChange,
  debounce = 350,
  ...props
}: {
  value: string;
  onChange: (value: any) => void;
  debounce?: number;
  [key: string]: any;
}) {
  const [val, setVal] = useState(initialValue);

  useEffect(() => {
    setVal(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (val !== initialValue) {
        onChange(val);
      }
    }, debounce);
    return () => clearTimeout(timer);
  }, [val, debounce, initialValue, onChange]);

  return (
    <Textarea
      value={val ?? ""}
      onChange={(e) => setVal(e.target.value)}
      {...props}
    />
  );
}

interface NodeConfigInspectorProps {
  pipelineId?: string;
  variables?: PipelineVariableDto[];
  node: Node | null;
  edges: Edge[];
  nodes: Node[];
  projectId?: string;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, pinId: string, value: any) => void;
  onDeleteNode: (nodeId: string) => void;
}

const PIN_PRIMITIVE_TYPES = [
  { value: "String", label: "String" },
  { value: "Number", label: "Number" },
  { value: "Boolean", label: "Boolean" },
  { value: "Path", label: "Path" },
  { value: "EntityRef", label: "Entity Reference (Resource/Workspace/Tag/...)" },
  { value: "Asset", label: "Asset / File (Upload preset, script, cloud file)" },
];

const CARDINALITY_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Array", label: "Array []" },
  { value: "Map", label: "Map (Dictionary)" },
];

const ENTITY_TARGETS = [
  { value: "Resource", label: "Resource File (3D Asset / File in Workspace)" },
  { value: "Workspace", label: "Workspace" },
  { value: "Tag", label: "Tag" },
  { value: "Inspector", label: "Inspector" },
  { value: "Inspection", label: "Inspection" },
  { value: "Agent", label: "Agent Worker" },
];

function resolveEntityTypeFromPin(pin: any, configValues: Record<string, any>): string | null {
  const idLower = (pin.id || "").toLowerCase();
  const labelLower = (pin.label || "").toLowerCase();

  if (idLower === "entityid" || idLower === "entity" || labelLower === "entity") {
    return configValues["EntityType"] || configValues["entityType"] || "Inspection";
  }

  if (pin.metadata) {
    try {
      const parsed = typeof pin.metadata === "string" ? JSON.parse(pin.metadata) : pin.metadata;
      if (parsed.type === "entity-select" && parsed.properties?.entity) {
        return parsed.properties.entity;
      }
      if (parsed.entity) return parsed.entity;
    } catch {}
  }

  if (isEntityRefPin(pin.primitiveType)) {
    if (idLower.includes("workspace") || labelLower.includes("workspace")) return "Workspace";
    if (idLower.includes("agent") || labelLower.includes("agent")) return "Agent";
    if (idLower.includes("tag") || labelLower.includes("tag")) return "Tag";
    if (idLower.includes("inspector") || labelLower.includes("inspector")) return "Inspector";
    if (idLower.includes("resource") || labelLower.includes("resource")) return "Resource";
    if (idLower.includes("inspection") || labelLower.includes("inspection")) return "Inspection";
  }

  return null;
}

export function NodeConfigInspector({
  pipelineId = "",
  variables = [],
  node,
  edges,
  nodes,
  projectId = "",
  onClose,
  onUpdateConfig,
  onDeleteNode,
}: NodeConfigInspectorProps) {
  const { data: schemaInputs = [], refetch: refetchSchema } = usePipelineInputSchema(pipelineId);
  const addInputMutation = useAddPipelineInput(pipelineId);
  const deleteInputMutation = useDeletePipelineInput(pipelineId);

  const [isAddingInput, setIsAddingInput] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isKeyManuallyEdited, setIsKeyManuallyEdited] = useState(false);
  const [newType, setNewType] = useState("String");
  const [newCardinality, setNewCardinality] = useState("Single");
  const [newEntityTarget, setNewEntityTarget] = useState("Resource");
  const [newIsRequired, setNewIsRequired] = useState(true);
  const [newDefaultValue, setNewDefaultValue] = useState("");
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);

  const toIdentifierKey = (text: string): string => {
    if (!text) return "";
    const words = text.replace(/[^a-zA-Z0-9\s_]/g, "").trim().split(/[\s_]+/);
    if (words.length === 0 || !words[0]) return "";
    const pascal = words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("");
    return /^[0-9]/.test(pascal) ? `Param${pascal}` : pascal;
  };

  const handleLabelChange = (val: string) => {
    setNewLabel(val);
    if (!isKeyManuallyEdited) {
      setNewKey(toIdentifierKey(val));
    }
  };

  const handleKeyChange = (val: string) => {
    setNewKey(val);
    setIsKeyManuallyEdited(true);
  };

  if (!node) return null;

  const data = node.data as unknown as CustomPipelineNodeData;
  const isStart = data.kind?.toLowerCase() === "start" || data.refId?.toLowerCase() === "start" || data.refId?.toLowerCase() === "beginexecute";
  const isTool = data.kind?.toLowerCase() === "tool" && !isStart;
  const inputs = data.inputs || [];
  const configValues = data.configValues || {};

  // Check wired edges
  const wiredInputPinIds = new Map<string, { sourceNodeLabel: string; sourcePin: string }>();
  for (const edge of edges) {
    if (edge.target === node.id && edge.targetHandle) {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const sourceLabel = (sourceNode?.data as any)?.label || edge.source;
      wiredInputPinIds.set(edge.targetHandle, {
        sourceNodeLabel: sourceLabel,
        sourcePin: edge.sourceHandle || "output",
      });
    }
  }

  const configurableInputs = inputs.filter(
    (pin) => !(pin.kind === 1 || (pin.kind as any) === "Exec" || pin.id === "exec_in" || pin.id === "exec_out")
  );

  const handleCreateInput = async () => {
    const finalLabel = newLabel.trim() || newKey.trim();
    const finalKey = newKey.trim() || toIdentifierKey(finalLabel) || `Param_${Date.now()}`;

    if (!finalKey && !finalLabel) {
      toast.error("Parameter label or key is required");
      return;
    }

    setIsSubmittingInput(true);
    try {
      const defaultValue = newType === "EntityRef" ? newEntityTarget : (newDefaultValue.trim() || null);
      await addInputMutation.mutateAsync({
        key: finalKey,
        label: finalLabel || finalKey,
        type: newType,
        cardinality: newCardinality,
        isRequired: newIsRequired,
        defaultValue,
      });

      toast.success(`Parameter '${finalLabel}' added`);
      setIsAddingInput(false);
      setNewKey("");
      setNewLabel("");
      setIsKeyManuallyEdited(false);
      setNewType("String");
      setNewCardinality("Single");
      setNewEntityTarget("Resource");
      setNewIsRequired(true);
      setNewDefaultValue("");
      refetchSchema();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to add parameter");
    } finally {
      setIsSubmittingInput(false);
    }
  };

  const handleDeleteInput = async (inputId: string, key: string) => {
    try {
      await deleteInputMutation.mutateAsync(inputId);
      toast.success(`Parameter '${key}' removed`);
      refetchSchema();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to delete parameter");
    }
  };

  return (
    <div className="flex h-full w-84 flex-col border-l border-border/80 bg-background/95 backdrop-blur-md shadow-xl z-20">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 p-4">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-inner",
              isStart
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : isTool
                ? "bg-blue-500/10 text-blue-500"
                : "bg-purple-500/10 text-purple-500"
            )}
          >
            {isStart ? <PlayCircle className="h-4 w-4" /> : isTool ? <Box className="h-4 w-4" /> : <FileCode className="h-4 w-4" />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground truncate" title={data.label}>
              {isStart ? "Start Pipeline" : data.label}
            </h3>
            <span className="text-[11px] text-muted-foreground font-mono truncate block">
              {data.refId}
            </span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" onPress={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Meta Bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-muted/30 border-b border-border/40 text-xs">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={cn("text-[10px] font-mono", isStart && "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10")}>
            {isStart ? "Entry Point" : data.kind || "Node"}
          </Badge>
          {data.executor && !isStart && (
            <Badge variant="secondary" className="text-[10px] font-mono capitalize">
              {data.executor}
            </Badge>
          )}
        </div>
        {!isStart && (
          <Button
            variant="destructive"
            size="sm"
            className="h-7 px-2 text-xs gap-1"
            onPress={() => onDeleteNode(node.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        )}
      </div>

      {/* Inputs / Outputs Configuration List */}
      <ScrollArea className="flex-1 p-4">
        {isStart ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Pipeline Inputs</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] gap-1 border-primary/40 text-primary hover:bg-primary/10"
                onPress={() => setIsAddingInput(true)}
              >
                <Plus className="h-3 w-3" />
                <span>Add Input</span>
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Define input parameters for this pipeline. Each parameter becomes an output pin on the Start Node:
            </p>

            {/* Add Parameter Inline Card */}
            {isAddingInput && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 space-y-3 shadow-sm animate-in fade-in-50 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">New Parameter</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingInput(false)}
                    className="text-muted-foreground hover:text-foreground text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-[10px] font-medium text-muted-foreground block mb-0.5">Name / Label</label>
                    <Input
                      value={newLabel}
                      onChange={(e) => handleLabelChange(e.target.value)}
                      placeholder="e.g. Target Resource, Model Path"
                      className="h-7 text-xs"
                      autoFocus
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-medium text-muted-foreground">Key (Identifier)</label>
                      <span className="text-[9px] text-muted-foreground/70 italic">Auto-generated</span>
                    </div>
                    <Input
                      value={newKey}
                      onChange={(e) => handleKeyChange(e.target.value)}
                      placeholder="e.g. TargetResource"
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-0.5">Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="w-full h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {PIN_PRIMITIVE_TYPES.map((pt) => (
                          <option key={pt.value} value={pt.value}>
                            {pt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-0.5">Structure / Format</label>
                      <select
                        value={newCardinality}
                        onChange={(e) => setNewCardinality(e.target.value)}
                        className="w-full h-7 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        {CARDINALITY_OPTIONS.map((co) => (
                          <option key={co.value} value={co.value}>
                            {co.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {newType === "EntityRef" ? (
                    <div>
                      <label className="text-[10px] font-medium text-primary block mb-0.5 font-semibold">Entity Target (Combobox Source)</label>
                      <select
                        value={newEntityTarget}
                        onChange={(e) => setNewEntityTarget(e.target.value)}
                        className="w-full h-7 rounded-md border border-primary/40 bg-primary/5 px-2 text-xs text-foreground font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        {ENTITY_TARGETS.map((et) => (
                          <option key={et.value} value={et.value}>
                            {et.label}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block leading-tight">
                        When running, a {newEntityTarget} selection combobox will be presented.
                      </span>
                    </div>
                  ) : (
                    <div>
                      <label className="text-[10px] font-medium text-muted-foreground block mb-0.5">Default Value (Optional)</label>
                      <Input
                        value={newDefaultValue}
                        onChange={(e) => setNewDefaultValue(e.target.value)}
                        placeholder="Default value..."
                        className="h-7 text-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-foreground font-medium">Required Input</span>
                    <Switch
                      isSelected={newIsRequired}
                      onChange={(v) => setNewIsRequired(v)}
                    />
                  </div>
                </div>

                <Button
                  size="sm"
                  className="w-full h-7 text-xs mt-1"
                  isDisabled={isSubmittingInput || (!newLabel.trim() && !newKey.trim())}
                  onPress={handleCreateInput}
                >
                  {isSubmittingInput ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1.5" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Parameter</span>
                  )}
                </Button>
              </div>
            )}

            {/* List of Current Pipeline Inputs */}
            {schemaInputs.length === 0 && !isAddingInput ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground space-y-2">
                <p className="italic">No input parameters configured.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  onPress={() => setIsAddingInput(true)}
                >
                  <Plus className="h-3 w-3" />
                  <span>Add First Parameter</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {schemaInputs.map((input) => {
                  const visual = getPinVisual(input.type);
                  return (
                    <div key={input.id} className="rounded-lg border border-border/70 bg-card p-3 space-y-2 shadow-sm group/item">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-semibold text-foreground truncate">
                            {input.label || input.key}
                          </span>
                          {input.isRequired && (
                            <span className="text-destructive font-bold text-xs" title="Required">*</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5 h-4", visual.textClass)}>
                            {formatPinTypeLabel(input.type, input.cardinality)}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleDeleteInput(input.id, input.key)}
                            className="text-muted-foreground/60 hover:text-destructive p-1 rounded transition-colors"
                            title="Delete Parameter"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-muted-foreground font-mono flex items-center justify-between">
                        <span>Key: {input.key}</span>
                        {input.defaultValue && (
                          <span className="truncate max-w-[120px]" title={input.defaultValue}>
                            Default: {input.defaultValue}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {data.refId?.toLowerCase() === "breakstruct" && (
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-3 space-y-2 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                  <Box className="h-3.5 w-3.5" />
                  <span>Struct Type</span>
                </div>
                <select
                  value={configValues["StructType"] || "Resource"}
                  onChange={(e) => onUpdateConfig(node.id, "StructType", e.target.value)}
                  className="w-full h-8 rounded-lg border border-sky-500/40 bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="Resource">Resource (File, BaseName, FullPath, Workspace)</option>
                  <option value="Workspace">Workspace (RootPath, WorkspaceId)</option>
                  <option value="Inspection">Resource Metadata (MainObjects, SkeletonBones)</option>
                </select>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  Selecting a struct type dynamically updates output pins to match the entity schema.
                </p>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Sliders className="h-3.5 w-3.5 text-primary" />
              <span>Input Properties</span>
            </div>

            {configurableInputs.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground italic">
                This node has no configurable inputs.
              </div>
            ) : (
              configurableInputs.map((pin, idx) => {
                const pinId = pin.id || `pin_${idx}`;
                const visual = getPinVisual(pin.primitiveType);
                const isWired = wiredInputPinIds.has(pinId);
                const wiredInfo = wiredInputPinIds.get(pinId);
                const currentVal = configValues[pinId] ?? pin.defaultValue ?? "";
                const entityType = resolveEntityTypeFromPin(pin, configValues);

                return (
                  <div
                    key={pinId}
                    className={cn(
                      "rounded-lg border p-3 space-y-2 transition-all",
                      isWired
                        ? "border-sky-500/30 bg-sky-500/5 dark:bg-sky-500/10"
                        : "border-border/70 bg-card shadow-sm"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate" title={pin.label || pinId}>
                          {pin.label || pinId}
                        </span>
                        {pin.isRequired && <span className="text-destructive font-bold text-xs">*</span>}
                      </div>

                      <Badge
                        variant="outline"
                        className={cn("text-[9px] font-mono px-1.5 h-4 font-semibold", visual.textClass)}
                      >
                        {visual.label}
                      </Badge>
                    </div>

                    {/* If pin is wired to another node */}
                    {isWired ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-sky-600 dark:text-sky-400 bg-sky-500/10 rounded-md p-2 font-mono">
                        <Link className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">
                          Connected from <strong className="text-foreground">{wiredInfo?.sourceNodeLabel}</strong> ({wiredInfo?.sourcePin})
                        </span>
                      </div>
                    ) : (
                      /* If pin is unwired, allow user inline static config */
                      <div className="space-y-1.5 pt-0.5">
                        {isBooleanPin(pin.primitiveType) ? (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Default State</span>
                            <Switch
                              isSelected={Boolean(currentVal)}
                              onChange={(val) => onUpdateConfig(node.id, pinId, val)}
                            />
                          </div>
                        ) : isNumberPin(pin.primitiveType) ? (
                          <DebouncedInput
                            type="number"
                            value={currentVal}
                            onChange={(val) =>
                              onUpdateConfig(node.id, pinId, val === "" ? null : Number(val))
                            }
                            placeholder="Enter number..."
                            className="h-8 text-xs"
                          />
                        ) : isAssetPin(pin.primitiveType) || pin.id?.toLowerCase().includes("preset") ? (
                          <AssetPinUpload
                            value={currentVal}
                            onChange={(val) => onUpdateConfig(node.id, pinId, val)}
                            placeholder="Upload asset file (Preset / Script)..."
                          />
                        ) : isVariablePin(pin.primitiveType, pinId) ? (
                          <div className="space-y-1.5">
                            <select
                              value={currentVal || ""}
                              onChange={(e) => onUpdateConfig(node.id, pinId, e.target.value)}
                              className="w-full h-8 rounded-lg border border-cyan-500/40 bg-cyan-500/5 px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500"
                            >
                              <option value="">-- Select Variable --</option>
                              {(variables || []).map((v) => (
                                <option key={v.name} value={v.name}>
                                  {v.name} ({formatPinTypeLabel(v.type, v.cardinality)})
                                </option>
                              ))}
                            </select>
                            {(!variables || variables.length === 0) && (
                              <p className="text-[10px] text-muted-foreground italic">
                                No variables declared yet. Use the Variables panel on the left to declare variables.
                              </p>
                            )}
                          </div>
                        ) : entityType ? (
                          <EntityPinSelect
                            entityType={entityType}
                            projectId={projectId}
                            value={currentVal}
                            onChange={(val) => onUpdateConfig(node.id, pinId, val)}
                            placeholder={`Select ${entityType}...`}
                          />
                        ) : pin.primitiveType === 0 && (pin.id?.toLowerCase().includes("json") || pin.id?.toLowerCase().includes("script")) ? (
                          <DebouncedTextarea
                            value={currentVal}
                            onChange={(val) => onUpdateConfig(node.id, pinId, val)}
                            placeholder="Enter value..."
                            className="text-xs min-h-[70px] font-mono"
                          />
                        ) : (
                          <DebouncedInput
                            type="text"
                            value={currentVal}
                            onChange={(val) => onUpdateConfig(node.id, pinId, val)}
                            placeholder="Enter value..."
                            className="h-8 text-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
