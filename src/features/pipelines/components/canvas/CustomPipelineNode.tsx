import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeProps } from "@xyflow/react";
import type { PinDefinition, PinPrimitiveType } from "@/gen/model";
import { Badge } from "@/components/ui/badge";
import {
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Box,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomPipelineNodeData extends Record<string, unknown> {
  refId: string;
  kind: string; // "Start" | "Tool" | "Custom"
  label: string;
  category?: string | null;
  executor?: string | null;
  inputs: PinDefinition[];
  outputs: PinDefinition[];
  configValues?: Record<string, any>;
  executionStatus?: "idle" | "running" | "succeeded" | "failed";
  executionError?: string | null;
}

export interface PinTypeVisual {
  label: string;
  hex: string;
  bgClass: string;
  textClass: string;
}

export function getPinVisual(type?: PinPrimitiveType | number | string): PinTypeVisual {
  // String: 0 in C# enum
  if (type === 0 || type === "0" || type === "String" || type === "string" || type === "str") {
    return {
      label: "String",
      hex: "#0ea5e9", // sky-500
      bgClass: "bg-sky-500",
      textClass: "text-sky-600 dark:text-sky-400",
    };
  }
  // Number: 1 in C# enum
  if (type === 1 || type === "1" || type === "Number" || type === "number" || type === "int" || type === "float") {
    return {
      label: "Number",
      hex: "#8b5cf6", // violet-500
      bgClass: "bg-violet-500",
      textClass: "text-violet-600 dark:text-violet-400",
    };
  }
  // Boolean: 2 in C# enum
  if (type === 2 || type === "2" || type === "Boolean" || type === "boolean" || type === "bool") {
    return {
      label: "Boolean",
      hex: "#f59e0b", // amber-500
      bgClass: "bg-amber-500",
      textClass: "text-amber-600 dark:text-amber-400",
    };
  }
  // Path: 3 in C# enum
  if (type === 3 || type === "3" || type === "Path" || type === "path") {
    return {
      label: "Path",
      hex: "#f97316", // orange-500
      bgClass: "bg-orange-500",
      textClass: "text-orange-600 dark:text-orange-400",
    };
  }
  // EntityRef / Workspace: 4 in C# enum
  if (type === 4 || type === "4" || type === "EntityRef" || type === "entityref" || type === "workspace") {
    return {
      label: "EntityRef",
      hex: "#10b981", // emerald-500
      bgClass: "bg-emerald-500",
      textClass: "text-emerald-600 dark:text-emerald-400",
    };
  }
  // Asset / File: 5 in C# enum
  if (type === 5 || type === "5" || type === "Asset" || type === "asset" || type === "file") {
    return {
      label: "Asset",
      hex: "#ec4899", // pink-500
      bgClass: "bg-pink-500",
      textClass: "text-pink-600 dark:text-pink-400",
    };
  }

  // Fallback
  return {
    label: "Any",
    hex: "#71717a", // zinc-500
    bgClass: "bg-zinc-500",
    textClass: "text-zinc-600 dark:text-zinc-400",
  };
}

export function isStringPin(type?: PinPrimitiveType | number | string) {
  return type === 0 || type === "0" || type === "String" || type === "string" || type === "str";
}
export function isNumberPin(type?: PinPrimitiveType | number | string) {
  return type === 1 || type === "1" || type === "Number" || type === "number" || type === "int" || type === "float";
}
export function isBooleanPin(type?: PinPrimitiveType | number | string) {
  return type === 2 || type === "2" || type === "Boolean" || type === "boolean" || type === "bool";
}
export function isPathPin(type?: PinPrimitiveType | number | string) {
  return type === 3 || type === "3" || type === "Path" || type === "path";
}
export function isEntityRefPin(type?: PinPrimitiveType | number | string) {
  return type === 4 || type === "4" || type === "EntityRef" || type === "entityref" || type === "workspace";
}
export function isAssetPin(type?: PinPrimitiveType | number | string) {
  return type === 5 || type === "5" || type === "Asset" || type === "asset" || type === "file";
}

export const CustomPipelineNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomPipelineNodeData;
  const rawKind = (nodeData.kind || "").toLowerCase();
  const rawRefId = (nodeData.refId || "").toLowerCase();

  const isStart = rawKind === "start" || rawRefId === "start" || rawRefId === "beginexecute";
  const isTool = rawKind === "tool" && !isStart;
  const inputs = nodeData.inputs || [];
  const outputs = nodeData.outputs || [];
  const status = nodeData.executionStatus || "idle";

  // Data pins (exclude exec pins)
  const isExecPin = (p: PinDefinition) => {
    const kind = (p as any).kind;
    return kind === 1 || kind === "Exec" || p.id === "exec_in" || p.id === "exec_out";
  };

  const hasExecInPin = inputs.some((p) => p.id === "exec_in" || (p as any).kind === 1 || (p as any).kind === "Exec");
  const hasExecOutPin = outputs.some((p) => p.id === "exec_out" || (p as any).kind === 1 || (p as any).kind === "Exec");

  // Pure nodes don't have exec pins in inputs/outputs
  const showExecIn = !isStart && (hasExecInPin || (!isTool && !isStart));
  const showExecOut = isStart || hasExecOutPin || (!isTool && !isStart);
  const hasExecFlow = showExecIn || showExecOut;

  const dataInputs = isStart ? [] : inputs.filter((p: PinDefinition) => !isExecPin(p));
  const dataOutputs = outputs.filter((p: PinDefinition) => !isExecPin(p));

  return (
    <div
      className={cn(
        "group relative min-w-[300px] max-w-[380px] rounded-xl border bg-card/95 backdrop-blur-md shadow-lg transition-all duration-200",
        selected ? "border-primary ring-2 ring-primary/40 shadow-primary/15" : "border-border/80 hover:border-primary/50",
        isStart && "border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 to-transparent",
        status === "running" && "border-amber-500 ring-2 ring-amber-500/40 animate-pulse",
        status === "succeeded" && "border-emerald-500/90 ring-1 ring-emerald-500/20",
        status === "failed" && "border-destructive ring-2 ring-destructive/40"
      )}
    >
      {/* Node Header */}
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-3.5 py-2.5 rounded-t-xl",
          isStart
            ? "border-emerald-500/20 bg-emerald-500/10"
            : "border-border/70 bg-muted/50"
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-inner",
              isStart
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : isTool
                ? "bg-blue-500/15 text-blue-500"
                : "bg-purple-500/15 text-purple-500"
            )}
          >
            {isStart ? (
              <PlayCircle className="h-4 w-4 fill-current/20" />
            ) : isTool ? (
              <Box className="h-4 w-4" />
            ) : (
              <FileCode className="h-4 w-4" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block truncate font-semibold text-xs text-foreground" title={nodeData.label}>
              {isStart ? "Start Pipeline" : nodeData.label}
            </span>
            <span className="block truncate text-[10px] text-muted-foreground font-mono">
              {nodeData.refId}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isStart ? (
            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-mono border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
              Entry
            </Badge>
          ) : nodeData.executor ? (
            <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-mono capitalize">
              {nodeData.executor === "dotNet" ? ".NET" : nodeData.executor}
            </Badge>
          ) : null}
          {status === "running" && <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin" />}
          {status === "succeeded" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          {status === "failed" && <AlertCircle className="h-3.5 w-3.5 text-destructive" />}
        </div>
      </div>

      {/* Control Flow (Exec Pin Bar) */}
      {hasExecFlow && (
        <div className="relative flex items-center justify-between px-3.5 py-1.5 bg-muted/30 border-b border-border/40 text-[11px] font-semibold text-foreground/90 select-none">
          {/* Exec In (Left) */}
          <div className="flex items-center gap-1.5 min-w-[70px]">
            {showExecIn ? (
              <div className="flex items-center gap-1">
                <Handle
                  type="target"
                  position={Position.Left}
                  id="exec_in"
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: "#3b82f6",
                    borderWidth: 2,
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    transform: "translateY(-50%) rotate(45deg)",
                    left: -7,
                    top: "50%",
                    zIndex: 50,
                  }}
                  className="!cursor-crosshair !pointer-events-auto shadow-md transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                />
                <span className="flex items-center gap-1 text-[11px] text-foreground font-bold tracking-wide pl-1">
                  <span className="text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]">▶</span> Exec
                </span>
              </div>
            ) : (
              <span />
            )}
          </div>

          {/* Exec Out (Right) */}
          <div className="flex items-center gap-1.5 justify-end min-w-[70px]">
            {showExecOut ? (
              <div className="flex items-center justify-end gap-1">
                <span className="flex items-center gap-1 text-[11px] text-foreground font-bold tracking-wide pr-1">
                  Exec <span className="text-white drop-shadow-[0_0_3px_rgba(255,255,255,0.8)]">▶</span>
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id="exec_out"
                  style={{
                    backgroundColor: "#ffffff",
                    borderColor: isStart ? "#10b981" : "#3b82f6",
                    borderWidth: 2,
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    transform: "translateY(-50%) rotate(45deg)",
                    right: -7,
                    top: "50%",
                    zIndex: 50,
                  }}
                  className="!cursor-crosshair !pointer-events-auto shadow-md transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(255,255,255,0.9)]"
                />
              </div>
            ) : (
              <span />
            )}
          </div>
        </div>
      )}

      {/* Data Pins Body */}
      {(dataInputs.length > 0 || dataOutputs.length > 0) && (
        <div className="p-3 space-y-2.5 text-xs">
          <div className="flex justify-between gap-6">
            {/* Left: Input Data Pins */}
            <div className="flex-1 space-y-2.5">
              {dataInputs.map((pin, idx) => {
                const pinId = pin.id || `in_${idx}`;
                const visual = getPinVisual(pin.primitiveType);
                const isArray = pin.cardinality === 1 || (pin.cardinality as any) === "Array";
                const hasConfig = nodeData.configValues?.[pinId] !== undefined;

                return (
                  <div key={pinId} className="relative flex items-center gap-2 group/pin py-0.5">
                    <Handle
                      type="target"
                      position={Position.Left}
                      id={pinId}
                      style={{
                        backgroundColor: visual.hex,
                        borderColor: "var(--background)",
                        borderWidth: 2,
                        width: 13,
                        height: 13,
                        left: -19,
                        zIndex: 40,
                      }}
                      className="!cursor-crosshair !pointer-events-auto shadow-md transition-transform hover:scale-125"
                    />
                    <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
                      <span
                        className="font-medium text-[11px] text-foreground/90 truncate"
                        title={`${pin.label || pinId} (${visual.label}${isArray ? "[]" : ""})`}
                      >
                        {pin.label || pinId}
                        {pin.isRequired && <span className="text-destructive ml-0.5">*</span>}
                      </span>
                      <span className={cn("text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-muted/60", visual.textClass)}>
                        {visual.label}{isArray ? "[]" : ""}
                      </span>
                      {hasConfig && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" title="Configured statically" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Output Data Pins */}
            <div className="flex-1 space-y-2.5 text-right">
              {dataOutputs.map((pin, idx) => {
                const pinId = pin.id || `out_${idx}`;
                const visual = getPinVisual(pin.primitiveType);
                const isArray = pin.cardinality === 1 || (pin.cardinality as any) === "Array";

                return (
                  <div key={pinId} className="relative flex items-center justify-end gap-2 group/pin py-0.5">
                    <div className="min-w-0 flex items-center justify-end gap-1.5 flex-wrap">
                      <span className={cn("text-[9px] font-mono font-semibold px-1 py-0.2 rounded bg-muted/60", visual.textClass)}>
                        {visual.label}{isArray ? "[]" : ""}
                      </span>
                      <span
                        className="font-medium text-[11px] text-foreground/90 truncate"
                        title={`${pin.label || pinId} (${visual.label}${isArray ? "[]" : ""})`}
                      >
                        {pin.label || pinId}
                      </span>
                    </div>
                    <Handle
                      type="source"
                      position={Position.Right}
                      id={pinId}
                      style={{
                        backgroundColor: visual.hex,
                        borderColor: "var(--background)",
                        borderWidth: 2,
                        width: 13,
                        height: 13,
                        right: -19,
                        zIndex: 40,
                      }}
                      className="!cursor-crosshair !pointer-events-auto shadow-md transition-transform hover:scale-125"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

CustomPipelineNode.displayName = "CustomPipelineNode";
