import { useState } from "react";
import type { InspectorDto, InspectorRuleDto } from "@/gen/model";
import { useInspectors, useInspectorMutations } from "./hooks/useInspectors";
import { useInspectorRules, useInspectorRuleMutations } from "./hooks/useInspectorRules";
import { InspectorsTable } from "./components/InspectorsTable";
import { InspectorRulesTable } from "./components/InspectorRulesTable";
import { CreateInspectorDialog } from "./dialogs/CreateInspectorDialog";
import { UpdateInspectorDialog } from "./dialogs/UpdateInspectorDialog";
import { InspectorVersionsDialog } from "./dialogs/InspectorVersionsDialog";
import { CreateInspectorRuleDialog } from "./dialogs/CreateInspectorRuleDialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InspectorsPageProps {
    projectId: string;
}

export function InspectorsPage({ projectId }: InspectorsPageProps) {
    const { t } = useTranslation();

    // Data
    const { data: inspectorsData, isLoading: isLoadingInspectors, refetch: refetchInspectors } = useInspectors(projectId);
    const { deleteInspector } = useInspectorMutations(projectId);

    const { data: rulesData, isLoading: isLoadingRules, refetch: refetchRules } = useInspectorRules(projectId);
    const { updateRule, deleteRule } = useInspectorRuleMutations(projectId);

    const inspectors = Array.isArray(inspectorsData) ? inspectorsData : [];
    const rules = Array.isArray(rulesData) ? rulesData : [];

    // Active tab
    const [activeTab, setActiveTab] = useState<"inspectors" | "rules">("inspectors");

    // Dialog states
    const [createInspectorOpen, setCreateInspectorOpen] = useState(false);
    const [editInspector, setEditInspector] = useState<InspectorDto | null>(null);
    const [versionsInspector, setVersionsInspector] = useState<InspectorDto | null>(null);
    const [createRuleOpen, setCreateRuleOpen] = useState(false);

    const handleToggleRule = async (rule: InspectorRuleDto, enabled: boolean) => {
        try {
            await updateRule({
                id: rule.id,
                data: {
                    enabled,
                    platformExtensionId: rule.platformExtensionId,
                    contentTypeId: rule.contentTypeId || undefined,
                }
            });
        } catch {
            // Handled in hook
        }
    };

    const handleDeleteRule = async (rule: InspectorRuleDto) => {
        if (confirm(t("inspectors.confirmDeleteRule", { defaultValue: "Are you sure you want to delete this rule?" }))) {
            await deleteRule(rule.id);
        }
    };

    const handleDeleteInspector = async (ins: InspectorDto) => {
        if (confirm(t("inspectors.confirmDeleteInspector", { defaultValue: `Are you sure you want to delete inspector "${ins.name}"?` }))) {
            await deleteInspector(ins.id);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        {t("inspectors.title", { defaultValue: "Resource Inspectors & Automation" })}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t("inspectors.subtitle", { defaultValue: "Define custom validation scripts (Blender / Python) and auto-inspection rules." })}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onPress={() => { refetchInspectors(); refetchRules(); }}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        {t("common.refresh", { defaultValue: "Refresh" })}
                    </Button>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg w-fit">
                        <button
                            type="button"
                            onClick={() => setActiveTab("inspectors")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                activeTab === "inspectors"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t("inspectors.tabInspectors", { defaultValue: "Inspectors" })}</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-muted-foreground/15 text-[10px]">
                                {inspectors.length}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("rules")}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                activeTab === "rules"
                                    ? "bg-background text-foreground shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
                            <span>{t("inspectors.tabRules", { defaultValue: "Automation Rules" })}</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-muted-foreground/15 text-[10px]">
                                {rules.length}
                            </span>
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {activeTab === "inspectors" ? (
                            <Button size="sm" onPress={() => setCreateInspectorOpen(true)}>
                                <Plus className="w-4 h-4 mr-1.5" />
                                {t("inspectors.addInspector", { defaultValue: "New Inspector" })}
                            </Button>
                        ) : (
                            <Button size="sm" variant="outline" onPress={() => setCreateRuleOpen(true)}>
                                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-yellow-500" />
                                {t("inspectors.addRule", { defaultValue: "New Rule" })}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === "inspectors" ? (
                    isLoadingInspectors ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-muted/40 animate-pulse rounded-lg border" />
                            ))}
                        </div>
                    ) : (
                        <InspectorsTable
                            inspectors={inspectors}
                            onEdit={(ins) => setEditInspector(ins)}
                            onManageVersions={(ins) => setVersionsInspector(ins)}
                            onDelete={handleDeleteInspector}
                        />
                    )
                ) : (
                    isLoadingRules ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="h-16 bg-muted/40 animate-pulse rounded-lg border" />
                            ))}
                        </div>
                    ) : (
                        <InspectorRulesTable
                            rules={rules}
                            onToggleRule={handleToggleRule}
                            onDeleteRule={handleDeleteRule}
                        />
                    )
                )}
            </div>

            {/* Dialogs */}
            <CreateInspectorDialog
                open={createInspectorOpen}
                onOpenChange={setCreateInspectorOpen}
                projectId={projectId}
            />

            <UpdateInspectorDialog
                open={!!editInspector}
                onOpenChange={(open) => { if (!open) setEditInspector(null); }}
                projectId={projectId}
                inspector={editInspector}
            />

            <InspectorVersionsDialog
                open={!!versionsInspector}
                onOpenChange={(open) => { if (!open) setVersionsInspector(null); }}
                projectId={projectId}
                inspectorId={versionsInspector?.id ?? ""}
            />

            <CreateInspectorRuleDialog
                open={createRuleOpen}
                onOpenChange={setCreateRuleOpen}
                projectId={projectId}
            />
        </div>
    );
}
