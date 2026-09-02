import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePipelines } from "@/features/pipelines/hooks/usePipelines";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import {
  X,
  Trash2,
  Zap,
  GitBranch,
  Boxes,
  Send,
  Save,
} from "lucide-react";
import type { WorkflowNodeDto } from "@/gen/model";

interface WorkflowNodeInspectorProps {
  node: WorkflowNodeDto;
  projectId: string;
  onClose: () => void;
  onUpdateConfig: (nodeId: string, config: any) => Promise<void>;
  onDeleteNode: (nodeId: string) => Promise<void>;
}

export function WorkflowNodeInspector({
  node,
  projectId,
  onClose,
  onUpdateConfig,
  onDeleteNode,
}: WorkflowNodeInspectorProps) {
  const { data: pipelines = [] } = usePipelines(projectId);
  const { data: workspaces = [] } = useWorkspaces(projectId);

  const [config, setConfig] = useState<Record<string, any>>(() => {
    if (!node.config) return {};
    if (typeof node.config === "string") {
      try {
        return JSON.parse(node.config);
      } catch {
        return {};
      }
    }
    return node.config;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!node.config) {
      setConfig({});
    } else if (typeof node.config === "string") {
      try {
        setConfig(JSON.parse(node.config));
      } catch {
        setConfig({});
      }
    } else {
      setConfig(node.config);
    }
  }, [node]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateConfig(node.id, config);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDeleteNode(node.id);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const kindStr = String(node.kind);
  const isEvent = kindStr === "EventTrigger" || kindStr === "1";
  const isCondition = kindStr === "ConditionFilter" || kindStr === "2";
  const isExecutePipeline = kindStr === "ExecutePipeline" || kindStr === "3";
  const isNotification = kindStr === "SendNotification" || kindStr === "4";

  return (
    <div className="w-80 border-l border-border bg-card/95 backdrop-blur flex flex-col h-full shadow-lg z-20 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/60">
        <div className="flex items-center gap-2">
          {isEvent && <Zap className="h-4 w-4 text-purple-500" />}
          {isCondition && <GitBranch className="h-4 w-4 text-amber-500" />}
          {isExecutePipeline && <Boxes className="h-4 w-4 text-emerald-500" />}
          {isNotification && <Send className="h-4 w-4 text-sky-500" />}
          <span className="font-semibold text-sm">Node Configuration</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onPress={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content Form */}
      <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
        {/* Event Trigger Config */}
        {isEvent && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Event Type</Label>
              <select
                className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                value={config.eventType || "OnResourceCreated"}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, eventType: e.target.value }))
                }
              >
                <option value="OnResourceCreated">On Resource Created</option>
                <option value="OnResourceVersionUpdated">
                  On Resource Version Updated
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Filter Workspace (Optional)</Label>
              <select
                className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs"
                value={config.workspaceId || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    workspaceId: e.target.value || undefined,
                  }))
                }
              >
                <option value="">All Workspaces</option>
                {workspaces.map((ws) => (
                  <option key={ws.id} value={ws.id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Condition Filter Config */}
        {isCondition && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">File Extensions (comma separated)</Label>
              <Input
                placeholder=".blend, .fbx, .png"
                className="h-8 text-xs font-mono"
                value={config.extensions?.join(", ") || ""}
                onChange={(e) => {
                  const exts = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  setConfig((prev) => ({ ...prev, extensions: exts }));
                }}
              />
              <p className="text-[10px] text-muted-foreground">
                Leave empty to accept any extension.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Path Pattern (Optional)</Label>
              <Input
                placeholder="Characters/ or Props/"
                className="h-8 text-xs font-mono"
                value={config.pathPattern || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    pathPattern: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}

        {/* Execute Pipeline Config */}
        {isExecutePipeline && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Pipeline</Label>
              <select
                className="w-full h-8 px-2 rounded-md border border-input bg-background text-xs font-medium"
                value={config.pipelineId || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    pipelineId: e.target.value,
                  }))
                }
              >
                <option value="">-- Select a Pipeline --</option>
                {pipelines.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Notification Config */}
        {isNotification && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Webhook URL</Label>
              <Input
                placeholder="https://discord.com/api/webhooks/..."
                className="h-8 text-xs font-mono"
                value={config.webhookUrl || ""}
                onChange={(e) =>
                  setConfig((prev) => ({
                    ...prev,
                    webhookUrl: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-border/60 flex items-center justify-between gap-2 bg-muted/20">
        <Button
          variant="destructive"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onPress={handleDelete}
          isDisabled={isDeleting || isEvent}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </Button>

        <Button
          size="sm"
          className="h-8 text-xs gap-1.5"
          onPress={handleSave}
          isDisabled={isSaving}
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving..." : "Save Config"}
        </Button>
      </div>
    </div>
  );
}
