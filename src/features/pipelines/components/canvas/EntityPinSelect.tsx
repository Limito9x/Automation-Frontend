import { useState, useMemo } from "react";
import { BaseCombobox } from "@/components/custom-ui/inputs/combobox/BaseCombobox";
import { useWorkspaces } from "@/features/workspaces/hooks/useWorkspaces";
import { useWorkspaceResources } from "@/features/workspaces/hooks/useWorkspaceResources";
import { useAgents } from "@/features/agents/hooks/useAgents";
import { useTags } from "@/features/tags/hooks/useTags";
import { useInspectors } from "@/features/inspectors/hooks/useInspectors";

interface EntityPinSelectProps {
  entityType: string;
  projectId?: string;
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function EntityPinSelect({
  entityType,
  projectId = "",
  value,
  onChange,
  placeholder,
  disabled = false,
}: EntityPinSelectProps) {
  const normType = entityType.toLowerCase().replace(/[\s_-]+/g, "");
  const isResourceRef = normType.includes("resource");

  // 1. Workspaces
  const { data: workspacesData, isLoading: isWorkspacesLoading } = useWorkspaces(
    normType === "workspace" || isResourceRef ? projectId : ""
  );

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  // 2. Resources within Selected Workspace
  const { data: resourcesData, isLoading: isResourcesLoading } = useWorkspaceResources(
    selectedWorkspaceId,
    { projectId, pageSize: 100 },
    { enabled: isResourceRef && Boolean(selectedWorkspaceId) }
  );

  // 3. Agents
  const { data: agentsData, isLoading: isAgentsLoading } = useAgents();

  // 4. Tags
  const { data: tagsData, isLoading: isTagsLoading } = useTags(
    undefined,
    { enabled: normType === "tag" }
  );

  // 5. Inspectors
  const { data: inspectorsData, isLoading: isInspectorsLoading } = useInspectors(
    normType === "inspector" ? projectId : ""
  );

  // Map workspace options
  const workspaceOptions = useMemo(() => {
    const list = Array.isArray(workspacesData)
      ? workspacesData
      : (workspacesData as any)?.items || [];
    return list.map((w: any) => ({
      label: w.name || w.id,
      value: w.id,
    }));
  }, [workspacesData]);

  // Map resource options
  const resourceOptions = useMemo(() => {
    const list = Array.isArray(resourcesData)
      ? resourcesData
      : (resourcesData as any)?.items || [];
    return list.map((r: any) => ({
      label: r.displayName ? `${r.displayName} (${r.relativePath || `v${r.latestVersionNo || 1}`})` : r.id,
      value: r.latestVersionId || r.id,
    }));
  }, [resourcesData]);

  // General options based on entityType
  const options = useMemo(() => {
    switch (normType) {
      case "workspace":
        return workspaceOptions;
      case "agent": {
        const list = Array.isArray(agentsData)
          ? agentsData
          : (agentsData as any)?.items || [];
        return list.map((a: any) => ({
          label: a.name || a.id,
          value: a.id,
        }));
      }
      case "tag": {
        const list = Array.isArray(tagsData)
          ? tagsData
          : (tagsData as any)?.items || [];
        return list.map((t: any) => ({
          label: t.groupName ? `${t.groupName} / ${t.name}` : t.name,
          value: t.id,
        }));
      }
      case "inspector": {
        const list = Array.isArray(inspectorsData)
          ? inspectorsData
          : (inspectorsData as any)?.items || [];
        return list.map((i: any) => ({
          label: i.name || i.id,
          value: i.id,
        }));
      }
      default:
        return [];
    }
  }, [normType, workspaceOptions, agentsData, tagsData, inspectorsData]);

  // Resource Selector: Workspace -> Resource -> Latest Version
  if (isResourceRef) {
    return (
      <div className="space-y-2">
        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground">1. Select Workspace</span>
          <BaseCombobox
            items={workspaceOptions}
            value={selectedWorkspaceId || undefined}
            onValueChange={(wId) => {
              setSelectedWorkspaceId(wId || "");
            }}
            placeholder="Select workspace first..."
            disabled={disabled || isWorkspacesLoading}
            emptyText={isWorkspacesLoading ? "Loading workspaces..." : "No workspaces found."}
          />
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-medium text-muted-foreground">2. Select Resource (Auto Latest Version)</span>
          <BaseCombobox
            items={resourceOptions}
            value={value ? String(value) : undefined}
            onValueChange={(newVal) => onChange(newVal || null)}
            placeholder={selectedWorkspaceId ? "Select resource file..." : "Select workspace above first..."}
            disabled={disabled || !selectedWorkspaceId || isResourcesLoading}
            emptyText={isResourcesLoading ? "Loading resources..." : "No resources found in this workspace."}
          />
        </div>
      </div>
    );
  }

  const isLoading =
    (normType === "workspace" && isWorkspacesLoading) ||
    (normType === "agent" && isAgentsLoading) ||
    (normType === "tag" && isTagsLoading) ||
    (normType === "inspector" && isInspectorsLoading);

  return (
    <BaseCombobox
      items={options}
      value={value ? String(value) : undefined}
      onValueChange={(newVal) => onChange(newVal || null)}
      placeholder={placeholder || `Select ${entityType}...`}
      disabled={disabled || isLoading}
      emptyText={isLoading ? "Loading..." : `No ${entityType} found.`}
    />
  );
}
