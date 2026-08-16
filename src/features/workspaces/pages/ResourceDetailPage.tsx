import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useResourceById } from "../hooks/useResourceDetail";
import { useResourceInspections, useTriggerInspection } from "@/features/inspectors/hooks/useInspections";
import { useInspectors } from "@/features/inspectors/hooks/useInspectors";
import { ResourceInspectionsTab } from "@/features/inspections/components/ResourceInspectionsTab";
import { ResourceVersionsTab } from "../components/tabs/ResourceVersionsTab";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    ShieldCheck,
    History,
    HardDrive,
    GitBranch,
    Play,
    Loader2,
} from "lucide-react";

interface ResourceDetailPageProps {
    projectId: string;
    workspaceId?: string;
    resourceId: string;
}

export function ResourceDetailPage({
    projectId,
    workspaceId,
    resourceId,
}: ResourceDetailPageProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"inspections" | "versions">("inspections");
    const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
    const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");

    // 1. Single source of truth: Get Resource Detail (includes all versions)
    const { data: resource, isLoading: isResourceLoading } = useResourceById(resourceId);

    const versions = resource?.versions || [];
    const latestVersion = versions[0];

    // 2. Default to the latest version on initial load
    const [selectedVersionId, setSelectedVersionId] = useState<string | undefined>(undefined);
    const currentActiveVersionId = selectedVersionId || latestVersion?.id || "";

    // 3. Inspections for the selected version
    const { data: inspectionsData } = useResourceInspections(currentActiveVersionId);
    const { data: inspectorsData } = useInspectors(projectId);
    const { triggerInspection, isTriggering } = useTriggerInspection(currentActiveVersionId);

    const inspections = Array.isArray(inspectionsData) ? inspectionsData : [];
    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];

    const handleRunInspection = async () => {
        if (!currentActiveVersionId) return;
        try {
            await triggerInspection({
                projectId,
                resourceVersionIds: [currentActiveVersionId],
                specificInspectorId: selectedInspectorId || undefined,
            });
            setTriggerDialogOpen(false);
            setSelectedInspectorId("");
        } catch {
            // Handled by hook toast
        }
    };

    const formatBytes = (bytes?: number) => {
        if (!bytes) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    const handleBack = () => {
        if (workspaceId) {
            navigate({
                to: "/projects/$projectId/workspaces/$workspaceId",
                params: { projectId, workspaceId },
            });
        } else {
            navigate({
                to: "/projects/$projectId/workspaces",
                params: { projectId },
            });
        }
    };

    return (
        <div className="p-6 space-y-6 w-full min-w-0">
            {/* Header matching WorkspaceDetailPage style */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleBack}
                        className="size-9 shrink-0 cursor-pointer"
                        aria-label="Back to workspace"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
                                {isResourceLoading ? "Loading Resource..." : resource?.name || "Resource Detail"}
                            </h1>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                            Resource ID: <code className="bg-muted px-1.5 py-0.5 rounded">{resourceId}</code>
                            {resource?.filePath && (
                                <span className="ml-2 text-muted-foreground/80">
                                    • Path: <span className="text-primary">{resource.filePath}</span>
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Tab Navigation & Action Buttons in Header */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <div className="flex items-center p-1 rounded-xl bg-muted/60 border">
                        {/* Tab 1: Inspections */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("inspections")}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                activeTab === "inspections"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <ShieldCheck className="size-3.5" />
                            <span>Overview & Inspections</span>
                        </button>

                        {/* Tab 2: Versions */}
                        <button
                            type="button"
                            onClick={() => setActiveTab("versions")}
                            className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                activeTab === "versions"
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <History className="size-3.5" />
                            <span>Version History</span>
                        </button>
                    </div>

                    <Button
                        onPress={() => setTriggerDialogOpen(true)}
                        isDisabled={!currentActiveVersionId}
                        className="gap-2 text-xs h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
                    >
                        <Play className="size-3.5 fill-current" /> Run Inspection
                    </Button>
                </div>
            </div>

            {/* 3 Stats KPI Cards (Same style as WorkspaceStatsBar) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stat 1: Total Inspections */}
                <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                        <ShieldCheck className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Inspections Executed</p>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">{inspections.length}</h3>
                    </div>
                </div>

                {/* Stat 2: Active Version */}
                <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                        <GitBranch className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Current Version</p>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                            {latestVersion ? `v${latestVersion.versionNo}.0.0` : "v1.0.0"}
                        </h3>
                    </div>
                </div>

                {/* Stat 3: File Size */}
                <div className="p-4 rounded-xl border bg-card shadow-xs flex items-center gap-3.5">
                    <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 shrink-0">
                        <HardDrive className="size-5" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-muted-foreground">Resource File Size</p>
                        <h3 className="text-2xl font-bold tracking-tight text-foreground">
                            {formatBytes(latestVersion?.sizeBytes)}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 rounded-xl border bg-card shadow-xs">
                {isResourceLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 bg-muted/40 animate-pulse rounded-lg border" />
                        ))}
                    </div>
                ) : (
                    <>
                        {activeTab === "inspections" && (
                            <ResourceInspectionsTab
                                resourceVersionId={currentActiveVersionId}
                                projectId={projectId}
                                versions={versions}
                                selectedVersionId={currentActiveVersionId}
                                onSelectVersionId={(verId) => setSelectedVersionId(verId)}
                            />
                        )}

                        {activeTab === "versions" && (
                            <ResourceVersionsTab
                                versions={versions}
                                resourceName={resource?.name}
                                filePath={resource?.filePath || undefined}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Run Inspection Modal */}
            <BaseDialog
                open={triggerDialogOpen}
                onOpenChange={setTriggerDialogOpen}
                title="Run Quality Inspection"
                description="Select an inspector to evaluate this file, or choose auto-detect to trigger all matching rules."
                size="md"
            >
                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="resourceSelectInspector" className="text-xs font-medium">
                            Select Inspector:
                        </Label>
                        <select
                            id="resourceSelectInspector"
                            value={selectedInspectorId}
                            onChange={(e) => setSelectedInspectorId(e.target.value)}
                            className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background mt-1.5 focus:ring-1 focus:ring-primary outline-hidden"
                        >
                            <option value="">-- Auto-detect from Project Rules --</option>
                            {inspectors.map((inspector) => (
                                <option key={inspector.id} value={inspector.id}>
                                    {inspector.name} ({inspector.executorKey})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t">
                        <Button
                            variant="outline"
                            type="button"
                            onPress={() => setTriggerDialogOpen(false)}
                            isDisabled={isTriggering}
                        >
                            Cancel
                        </Button>
                        <Button onPress={handleRunInspection} isDisabled={isTriggering} className="gap-1.5">
                            {isTriggering ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                    Dispatching...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                                    Run Now
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
}
