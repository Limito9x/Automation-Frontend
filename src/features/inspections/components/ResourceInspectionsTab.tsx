import { useState } from "react";
import { useResourceInspections, useTriggerInspection } from "@/features/inspectors/hooks/useInspections";
import { useInspectors } from "@/features/inspectors/hooks/useInspectors";
import { InspectionReportCard } from "./InspectionReportCard";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Play, RefreshCw, ShieldCheck, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ResourceVersionDto } from "@/gen/model";

interface ResourceInspectionsTabProps {
    resourceVersionId: string;
    projectId: string;
    versions?: ResourceVersionDto[];
    selectedVersionId?: string;
    onSelectVersionId?: (versionId: string) => void;
}

export function ResourceInspectionsTab({
    resourceVersionId,
    projectId,
    versions = [],
    selectedVersionId,
    onSelectVersionId,
}: ResourceInspectionsTabProps) {
    const { t } = useTranslation();
    const activeVersionId = selectedVersionId || resourceVersionId;

    const { data: inspectionsData, isLoading, refetch } = useResourceInspections(activeVersionId);
    const { triggerInspection, isTriggering } = useTriggerInspection(activeVersionId);
    const { data: inspectorsData } = useInspectors(projectId);

    const inspections = Array.isArray(inspectionsData) ? inspectionsData : [];
    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];

    const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
    const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");

    const handleRunInspection = async () => {
        try {
            await triggerInspection({
                projectId,
                resourceVersionIds: [activeVersionId],
                specificInspectorId: selectedInspectorId || undefined,
            });
            setTriggerDialogOpen(false);
            setSelectedInspectorId("");
        } catch {
            // Handled in hook
        }
    };

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
                            Select Resource Version:
                        </div>
                        <div className="text-xs text-muted-foreground">
                            Inspection reports and metric details for the selected version
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
                        Click the button below to select an inspector and validate this file via Agent workstation.
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

            {/* Trigger Dialog */}
            <BaseDialog
                open={triggerDialogOpen}
                onOpenChange={setTriggerDialogOpen}
                title={t("inspections.triggerDialogTitle", { defaultValue: "Run Quality Inspection" })}
                description={t("inspections.triggerDialogDesc", {
                    defaultValue: "Select an inspector to evaluate this file, or choose auto-detect to trigger all matching rules.",
                })}
                size="md"
            >
                <div className="space-y-4 py-2">
                    <div>
                        <Label htmlFor="selectSpecificInspector" className="text-xs font-medium">
                            {t("inspections.selectSpecificInspector", { defaultValue: "Specific Inspector:" })}
                        </Label>
                        <select
                            id="selectSpecificInspector"
                            value={selectedInspectorId}
                            onChange={(e) => setSelectedInspectorId(e.target.value)}
                            className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background mt-1.5 focus:ring-1 focus:ring-primary outline-hidden"
                        >
                            <option value="">
                                {t("inspections.allMatchingRules", { defaultValue: "-- Auto-detect from Automation Rules --" })}
                            </option>
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
                            {t("common.cancel", { defaultValue: "Cancel" })}
                        </Button>
                        <Button onPress={handleRunInspection} isDisabled={isTriggering} className="gap-1.5">
                            {isTriggering ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                    {t("inspections.dispatching", { defaultValue: "Dispatching..." })}
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                                    {t("inspections.runNow", { defaultValue: "Run Now" })}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </BaseDialog>
        </div>
    );
}
