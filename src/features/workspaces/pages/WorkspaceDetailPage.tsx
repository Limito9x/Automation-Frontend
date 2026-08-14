import { useWorkspaceDetail } from "../hooks/useWorkspaces";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Loader2, Layers, HardDrive } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useDialogStore } from "@/stores/dialogStore";
import { WorkspaceStatsBar } from "../components/WorkspaceStatsBar";
import { WorkspaceResourcesTab } from "../components/tabs/WorkspaceResourcesTab";
import { WorkspaceAgentsTab } from "../components/tabs/WorkspaceAgentsTab";
import { useResourceQuery, type BaseSearchParams } from "@/lib/useResourceQuery";

interface WorkspaceDetailPageProps {
  projectId: string;
  workspaceId: string;
  useSearch: () => BaseSearchParams & { tab?: "resources" | "agents"; agentId?: string };
  useNavigate: () => any;
}

export function WorkspaceDetailPage({
  projectId,
  workspaceId,
  useSearch,
  useNavigate,
}: WorkspaceDetailPageProps) {
  const search = useSearch();
  const navigate = useNavigate();
  const resource = useResourceQuery(search, navigate);

  const activeTab = search.tab || "resources";

  const { data: workspace, isLoading: isWorkspaceLoading, isError, error } = useWorkspaceDetail(workspaceId);
  const openDialog = useDialogStore((state) => state.openDialog);

  const selectedAgentId = search.agentId || workspace?.workspaceAgents[0]?.agentId || "";

  const handleTabChange = (tab: "resources" | "agents") => {
    resource.onParamChange({ tab, page: 1 } as any, true);
  };

  const handleAgentSelect = (agentId: string) => {
    resource.onParamChange({ agentId, page: 1 } as any, true);
  };

  return (
    <div className="p-6 space-y-6 w-full min-w-0">
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
              {isWorkspaceLoading ? "Loading Workspace..." : workspace?.name || "Workspace Detail"}
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
      {isWorkspaceLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="size-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground font-medium">Loading workspace details...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/10 text-destructive text-center">
          <p className="font-semibold">Failed to load workspace</p>
          <p className="text-xs mt-1">{(error as any)?.message || "An unexpected error occurred."}</p>
        </div>
      )}

      {/* Main Content */}
      {!isWorkspaceLoading && !isError && workspace && (
        <div className="space-y-6">
          {/* Stats Bar */}
          <WorkspaceStatsBar
            agentCount={workspace.workspaceAgents.length}
            resourceCount={0}
          />

          {/* Tab Navigation */}
          <div className="flex items-center justify-between border-b pb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTabChange("resources")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === "resources"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Layers className="size-4" />
                <span>All Resources</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("agents")}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  activeTab === "agents"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <HardDrive className="size-4" />
                <span>Agent View</span>
                {workspace.workspaceAgents.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === "agents" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {workspace.workspaceAgents.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "resources" && (
            <WorkspaceResourcesTab
              workspaceId={workspaceId}
              projectId={projectId}
              resource={resource}
              search={search}
            />
          )}

          {activeTab === "agents" && (
            <WorkspaceAgentsTab
              workspace={workspace}
              projectId={projectId}
              selectedAgentId={selectedAgentId}
              onAgentSelect={handleAgentSelect}
              resource={resource}
              search={search}
            />
          )}
        </div>
      )}
    </div>
  );
}
