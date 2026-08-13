import { useWorkspaceDetail } from "../hooks/useWorkspaces";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot, Plus, Loader2, FolderTree } from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useDialogStore } from "@/stores/dialogStore";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectPopover,
  SelectList,
} from "@/components/ui/select";

interface WorkspaceDetailPageProps {
  projectId: string;
  workspaceId: string;
}

export function WorkspaceDetailPage({ projectId, workspaceId }: WorkspaceDetailPageProps) {
  const { data: workspace, isLoading, isError, error } = useWorkspaceDetail(workspaceId);
  const openDialog = useDialogStore((state) => state.openDialog);
  const navigate = useNavigate();
  const routerState = useRouterState();

  // Selected agentId from search params or first workspace agent
  const searchParams = new URLSearchParams(typeof routerState.location.search === "string" ? routerState.location.search : "");
  const selectedAgentId = searchParams.get("agentId") || workspace?.workspaceAgents[0]?.agentId || "";

  const handleAgentSelect = (agentId: string) => {
    navigate({
      search: (prev: Record<string, any>) => ({ ...prev, agentId }),
    } as any);
  };

  const selectedWorkspaceAgent = workspace?.workspaceAgents.find((wa) => wa.agentId === selectedAgentId);

  return (
    <div className="p-6 mx-auto space-y-6 w-full min-w-0">

      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/projects/$projectId/workspaces" params={{ projectId }}>
            <Button variant="outline" size="icon" className="size-9">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isLoading ? "Loading Workspace..." : workspace?.name || "Workspace Detail"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Workspace ID: <code className="bg-muted px-1.5 py-0.5 rounded">{workspaceId}</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openDialog("attach-agent-workspace", { workspaceId })}
            className="gap-2"
          >
            <Plus className="size-4" /> Add Agent to Workspace
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading workspace environment details...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-center">
          <p className="font-semibold">Failed to load workspace</p>
          <p className="text-xs mt-1">{(error as any)?.message || "An unexpected error occurred."}</p>
        </div>
      )}

      {/* Workspace Content */}
      {!isLoading && !isError && workspace && (
        <div className="space-y-6">
          {/* Agent Selection Top Bar */}
          <div className="p-5 rounded-xl border bg-card shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 font-medium text-sm text-foreground">
                <Bot className="size-4 text-primary" />
                <span>Selected Agent Connection:</span>
              </div>

              {workspace.workspaceAgents.length > 0 ? (
                <div className="w-full sm:w-72">
                  <Select
                    selectedKey={selectedAgentId}
                    onSelectionChange={(key) => handleAgentSelect(String(key))}
                    placeholder="Select an Agent"
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopover>
                      <SelectList>
                        {workspace.workspaceAgents.map((wa) => (
                          <SelectItem key={wa.agentId} id={wa.agentId} textValue={wa.agent?.name || wa.agentId}>
                            <div className="flex items-center justify-between w-full">
                              <span className="font-medium">{wa.agent?.name || "Agent"}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {wa.agent?.isActive ? "🟢 Active" : "🔴 Offline"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectList>
                    </SelectPopover>
                  </Select>
                </div>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  No agents attached to this workspace yet. Click "Add Agent to Workspace" above.
                </div>
              )}
            </div>

            {/* Selected Agent Details Badge */}
            {selectedWorkspaceAgent && (
              <div className="flex flex-wrap items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
                <div>
                  <span className="font-medium text-foreground">Machine:</span>{" "}
                  {selectedWorkspaceAgent.agent?.machineKey || "N/A"}
                </div>
                <div>
                  <span className="font-medium text-foreground">Root Path:</span>{" "}
                  <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                    {selectedWorkspaceAgent.rootPath}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-foreground">Last Seen:</span>{" "}
                  {selectedWorkspaceAgent.agent?.lastSeenAt
                    ? new Date(selectedWorkspaceAgent.agent.lastSeenAt).toLocaleString()
                    : "Never"}
                </div>
              </div>
            )}
          </div>

          {/* Directory Tree Section */}
          <div className="p-6 rounded-xl border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2 font-semibold text-base">
                <FolderTree className="size-4 text-primary" />
                <span>Agent Environment Directory Tree</span>
              </div>
              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                Lazy-Loaded
              </span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
