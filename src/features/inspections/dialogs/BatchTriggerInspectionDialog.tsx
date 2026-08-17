import { useState, useEffect, useMemo } from "react";
import { BaseDialog } from "@/components/custom-ui/overlays/dialog/BaseDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useInspectors } from "@/features/inspectors/hooks/useInspectors";
import { useManualTriggerInspection } from "@/features/inspectors/hooks/useInspections";
import { useAvailableAgents } from "@/features/workspaces/hooks/useWorkspaceResources";
import { Play, Loader2, ShieldCheck, Server, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface BatchTriggerInspectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    workspaceId: string;
    selectedResourceIds: string[];
    onSuccess?: () => void;
}

export function BatchTriggerInspectionDialog({
    open,
    onOpenChange,
    projectId,
    workspaceId,
    selectedResourceIds,
    onSuccess,
}: BatchTriggerInspectionDialogProps) {
    const { t } = useTranslation();
    const { data: inspectorsData, isLoading: isLoadingInspectors } = useInspectors(projectId);
    const { data: agentsData, isLoading: isLoadingAgents } = useAvailableAgents(
        workspaceId,
        selectedResourceIds,
        { enabled: open }
    );
    const { manualTrigger, isTriggering } = useManualTriggerInspection();

    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];
    const availableAgents = Array.isArray(agentsData) ? agentsData : [];

    const [selectedInspectorId, setSelectedInspectorId] = useState<string>("");
    const [selectedAgentId, setSelectedAgentId] = useState<string>("");

    // Auto-select first inspector
    useEffect(() => {
        if (inspectors.length > 0 && !selectedInspectorId) {
            setSelectedInspectorId(inspectors[0].id);
        }
    }, [inspectors, selectedInspectorId]);

    // Selected inspector object
    const selectedInspector = useMemo(() => {
        return inspectors.find((i) => i.id === selectedInspectorId);
    }, [inspectors, selectedInspectorId]);

    // Analyze agent eligibility
    const agentOptions = useMemo(() => {
        return availableAgents.map((agent) => {
            const hasAllResources = agent.availableResources.length >= selectedResourceIds.length;
            const supportsExecutor = selectedInspector
                ? agent.availableExecutors.some((e) => e.toLowerCase() === selectedInspector.executorKey.toLowerCase())
                : true;
            const isEligible = agent.isAvailable && hasAllResources && supportsExecutor;

            let reason: string | null = null;
            if (!agent.isAvailable) {
                reason = t("inspections.agentOffline", { defaultValue: "Agent is offline" });
            } else if (!hasAllResources) {
                reason = t("inspections.agentMissingResources", { defaultValue: "Missing selected resources" });
            } else if (!supportsExecutor && selectedInspector) {
                reason = t("inspections.agentMissingExecutor", {
                    defaultValue: `Missing runtime '${selectedInspector.executorKey}'`,
                });
            }

            return {
                ...agent,
                hasAllResources,
                supportsExecutor,
                isEligible,
                reason,
            };
        });
    }, [availableAgents, selectedResourceIds.length, selectedInspector, t]);

    // Auto-select best eligible agent
    useEffect(() => {
        if (agentOptions.length > 0 && (!selectedAgentId || !agentOptions.some((a) => a.agentId === selectedAgentId))) {
            const best = agentOptions.find((a) => a.isEligible) || agentOptions[0];
            if (best) {
                setSelectedAgentId(best.agentId);
            }
        }
    }, [agentOptions, selectedAgentId]);

    const activeAgent = agentOptions.find((a) => a.agentId === selectedAgentId);
    const canRun = !!selectedInspectorId && !!selectedAgentId && !!activeAgent?.isEligible && !isTriggering;

    const handleBatchRun = async () => {
        if (!selectedAgentId || !selectedInspectorId || !activeAgent) return;

        // Collect latest resource version IDs on this agent
        const resourceVersionIds = activeAgent.availableResources
            .map((r) => r.latestVersion?.id)
            .filter((id): id is string => Boolean(id));

        if (resourceVersionIds.length === 0) return;

        try {
            await manualTrigger({
                agentId: selectedAgentId,
                inspectorId: selectedInspectorId,
                resourceVersionIds,
            });
            onOpenChange(false);
            onSuccess?.();
        } catch {
            // Error handled by hook toast
        }
    };

    return (
        <BaseDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("inspections.triggerInspectionTitle", { defaultValue: "Run Quality Inspection" })}
            description={t("inspections.triggerInspectionDesc", {
                defaultValue: "Select an Inspector and a target Worker Agent to execute quality checks on the selected files.",
            })}
            size="md"
        >
            <div className="space-y-4 py-2">
                {/* Selected Resources Count Summary */}
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 text-primary font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t("inspections.selectedResources", { defaultValue: "Target Resources:" })}</span>
                    </div>
                    <Badge variant="default" className="font-mono text-xs font-semibold py-0.5 px-2.5">
                        {selectedResourceIds.length} {selectedResourceIds.length === 1 ? "Resource" : "Resources"}
                    </Badge>
                </div>

                {/* Inspector Select */}
                <div className="space-y-1.5">
                    <Label htmlFor="batchSelectInspector" className="text-xs font-medium text-foreground">
                        {t("inspections.selectInspectorLabel", { defaultValue: "1. Select Inspector:" })}
                    </Label>
                    {isLoadingInspectors ? (
                        <div className="h-9 w-full bg-muted/50 animate-pulse rounded-md border" />
                    ) : inspectors.length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground border border-dashed rounded-lg bg-card/50 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>{t("inspections.noInspectorsFound", { defaultValue: "No inspectors registered for this project." })}</span>
                        </div>
                    ) : (
                        <select
                            id="batchSelectInspector"
                            value={selectedInspectorId}
                            onChange={(e) => setSelectedInspectorId(e.target.value)}
                            className="w-full h-9 px-3 text-xs rounded-md border border-input bg-background focus:ring-1 focus:ring-primary outline-hidden"
                        >
                            {inspectors.map((inspector) => (
                                <option key={inspector.id} value={inspector.id}>
                                    {inspector.name} ({inspector.executorKey})
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Target Agent Select */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="batchSelectAgent" className="text-xs font-medium text-foreground">
                            {t("inspections.selectAgentLabel", { defaultValue: "2. Target Worker Agent:" })}
                        </Label>
                        {isLoadingAgents && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {t("inspections.checkingAgents", { defaultValue: "Checking agents..." })}
                            </span>
                        )}
                    </div>

                    {isLoadingAgents ? (
                        <div className="space-y-2">
                            <div className="h-14 w-full bg-muted/40 animate-pulse rounded-lg border" />
                        </div>
                    ) : agentOptions.length === 0 ? (
                        <div className="p-3.5 border border-dashed border-destructive/40 bg-destructive/5 rounded-xl space-y-1 text-xs">
                            <div className="flex items-center gap-2 text-destructive font-semibold">
                                <XCircle className="w-4 h-4 shrink-0" />
                                <span>{t("inspections.noAgentsAvailable", { defaultValue: "No Worker Agents Available" })}</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] pl-6">
                                {t("inspections.noAgentsAvailableDesc", {
                                    defaultValue: "None of the registered agents hold the selected resources or are currently online.",
                                })}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {agentOptions.map((agent) => {
                                const isSelected = agent.agentId === selectedAgentId;
                                return (
                                    <div
                                        key={agent.agentId}
                                        onClick={() => setSelectedAgentId(agent.agentId)}
                                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected
                                                ? "border-primary bg-primary/5 ring-1 ring-primary shadow-xs"
                                                : "border-border hover:border-primary/50 bg-card hover:bg-accent/40"
                                            } ${!agent.isEligible ? "opacity-70" : ""}`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${agent.isAvailable
                                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                                        : "bg-muted text-muted-foreground border border-border"
                                                    }`}
                                            >
                                                <Server className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-foreground truncate">
                                                        {agent.agentName}
                                                    </span>
                                                    {agent.isAvailable ? (
                                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                                                            Online
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground">
                                                            Offline
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5 truncate flex items-center gap-1.5">
                                                    <span>
                                                        Executors: {agent.availableExecutors.length > 0 ? agent.availableExecutors.join(", ") : "None"}
                                                    </span>
                                                    {agent.reason && (
                                                        <span className="text-amber-500 font-medium">
                                                            • {agent.reason}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {agent.isEligible ? (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            ) : (
                                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Active Agent Warnings */}
                {activeAgent && !activeAgent.isEligible && activeAgent.reason && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{activeAgent.reason}</span>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button
                        variant="outline"
                        type="button"
                        onPress={() => onOpenChange(false)}
                        isDisabled={isTriggering}
                    >
                        {t("common.cancel", { defaultValue: "Cancel" })}
                    </Button>
                    <Button
                        onPress={handleBatchRun}
                        isDisabled={!canRun}
                        className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                    >
                        {isTriggering ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                                {t("inspections.dispatching", { defaultValue: "Dispatching..." })}
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4 mr-1.5 fill-current" />
                                {t("inspections.runInspectionNow", { defaultValue: "Run Inspection" })}
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </BaseDialog>
    );
}
