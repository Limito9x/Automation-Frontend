import { useState } from "react";
import { useResourceInspections } from "@/features/inspectors/hooks/useInspections";
import { InspectionReportCard } from "./InspectionReportCard";
import { BatchTriggerInspectionDialog } from "@/features/inspections/dialogs/BatchTriggerInspectionDialog";
import { Button } from "@/components/ui/button";
import { Play, RefreshCw, ShieldCheck, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ResourceVersionDto } from "@/gen/model";

interface ResourceInspectionsTabProps {
    resourceVersionId: string;
    projectId: string;
    workspaceId?: string;
    resourceId?: string;
    versions?: ResourceVersionDto[];
    selectedVersionId?: string;
    onSelectVersionId?: (versionId: string) => void;
}

export function ResourceInspectionsTab({
    resourceVersionId,
    projectId,
    workspaceId = "",
    resourceId = "",
    versions = [],
    selectedVersionId,
    onSelectVersionId,
}: ResourceInspectionsTabProps) {
    const { t } = useTranslation();
    const activeVersionId = selectedVersionId || resourceVersionId;

    const { data: inspectionsData, isLoading, refetch } = useResourceInspections(activeVersionId);
    const inspections = Array.isArray(inspectionsData) ? inspectionsData : [];

    const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);

    return (
        <div className="space-y-4">
            {/* Version Selector Bar & Action */}
            <div className="p-3.5 bg-muted/20 border border-border/70 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            {t("inspections.selectResourceVersion", { defaultValue: "Select Resource Version:" })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {t("inspections.versionDetailDesc", { defaultValue: "Inspection reports and metric details for the selected version" })}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap ml-auto">
                    {/* Version Switcher Buttons */}
                    {versions.length > 0 && (
                        <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/50 gap-1">
                            {versions.map((ver, idx) => {
                                const isSelected = ver.id === activeVersionId;
                                const isLatest = idx === 0;
                                return (
                                    <button
                                        key={ver.id}
                                        type="button"
                                        onClick={() => onSelectVersionId?.(ver.id)}
                                        className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                                            isSelected
                                                ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                                                : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                                        }`}
                                    >
                                        <Layers className="w-3 h-3" />
                                        <span>V{ver.versionNo}</span>
                                        {isLatest && (
                                            <span
                                                className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                                                    isSelected
                                                        ? "bg-primary-foreground/20 text-primary-foreground"
                                                        : "bg-primary/15 text-primary"
                                                }`}
                                            >
                                                Current
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onPress={() => refetch()}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {t("common.refresh", { defaultValue: "Refresh" })}
                    </Button>

                    <Button
                        size="sm"
                        className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs font-semibold"
                        onPress={() => setTriggerDialogOpen(true)}
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {t("inspections.runInspection", { defaultValue: "Run Inspection" })}
                    </Button>
                </div>
            </div>

            {/* Vertical Inspection Cards List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-28 bg-muted/40 animate-pulse rounded-xl border border-border/60" />
                    ))}
                </div>
            ) : inspections.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-card/40 space-y-3">
                    <ShieldCheck className="w-8 h-8 text-muted-foreground/50 mx-auto" />
                    <p className="font-medium text-sm text-foreground">
                        {t("inspections.noInspectionsYet", { defaultValue: "No inspections have been run on this version yet." })}
                    </p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        {t("inspections.noInspectionsHelp", { defaultValue: "Click the button below to select an inspector and validate this file via Agent workstation." })}
                    </p>
                    <Button size="sm" variant="outline" className="gap-1.5" onPress={() => setTriggerDialogOpen(true)}>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {t("inspections.runFirstInspection", { defaultValue: "Run Inspection Now" })}
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {inspections.map((ins, index) => (
                        <InspectionReportCard
                            key={ins.id}
                            inspection={ins}
                            defaultExpanded={index === 0}
                        />
                    ))}
                </div>
            )}

            {/* Unified Trigger Dialog with Available Agents */}
            <BatchTriggerInspectionDialog
                open={triggerDialogOpen}
                onOpenChange={setTriggerDialogOpen}
                projectId={projectId}
                workspaceId={workspaceId}
                selectedResourceIds={resourceId ? [resourceId] : []}
                onSuccess={() => refetch()}
            />
        </div>
    );
}
