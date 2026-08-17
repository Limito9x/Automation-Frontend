import type { InspectorRuleDto } from "@/gen/model";
import { useExtensions } from "@/features/platforms/hooks/usePlatforms";
import { useContentTypes } from "@/features/contentTypes/hooks/useContentTypes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Trash2, FileCode, Layers, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InspectorRulesTableProps {
    rules: InspectorRuleDto[];
    projectId: string;
    onToggleRule: (rule: InspectorRuleDto, enabled: boolean) => void;
    onDeleteRule: (rule: InspectorRuleDto) => void;
}

export function InspectorRulesTable({ rules, projectId, onToggleRule, onDeleteRule }: InspectorRulesTableProps) {
    const { t } = useTranslation();
    const { data: extensionsData } = useExtensions();
    const { data: contentTypesData } = useContentTypes({}, projectId);

    const extensions = Array.isArray(extensionsData) ? extensionsData : [];
    const contentTypes = Array.isArray(contentTypesData) ? contentTypesData : [];

    if (rules.length === 0) {
        return (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card">
                {t("inspectors.noRulesFound", { defaultValue: "No automation trigger rules configured yet. Create a rule to run inspections on synced files automatically." })}
            </div>
        );
    }

    return (
        <div className="border rounded-lg divide-y divide-border overflow-hidden bg-card shadow-xs">
            {rules.map((rule) => {
                const ext = extensions.find((e) => e.id === rule.platformExtensionId);
                const ct = contentTypes.find((c) => c.id === rule.contentTypeId);

                return (
                    <div
                        key={rule.id}
                        className="p-3.5 text-xs flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className={`p-2 rounded-lg shrink-0 ${
                                rule.enabled ? "bg-yellow-500/10 text-yellow-500" : "bg-muted text-muted-foreground"
                            }`}>
                                <Sparkles className="w-4 h-4" />
                            </div>

                            <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                                {/* Condition Trigger */}
                                <div className="flex items-center gap-1.5 font-medium">
                                    <FileCode className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <Badge variant="outline" className="font-mono text-xs bg-primary/5 text-primary border-primary/20 font-semibold px-2 py-0.5">
                                        {ext?.extension || rule.platformExtensionId || "*"}
                                    </Badge>
                                </div>

                                {ct && (
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                        <span className="text-[11px]">+</span>
                                        <Badge variant="secondary" className="text-[10px] flex items-center gap-1">
                                            <Layers className="w-2.5 h-2.5" />
                                            {ct.displayName || ct.name || ct.key}
                                        </Badge>
                                    </div>
                                )}

                                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0 mx-1" />

                                {/* Target Inspector Action */}
                                <div className="flex items-center gap-1.5">
                                    <Badge variant="default" className="font-semibold text-xs shadow-xs">
                                        {rule.inspectorName || rule.inspectorKey || rule.inspectorId}
                                    </Badge>
                                    {rule.executorKey && (
                                        <Badge variant="outline" className="uppercase text-[9px] font-mono tracking-wider">
                                            {rule.executorKey}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                <Switch
                                    isSelected={rule.enabled}
                                    onChange={(val) => onToggleRule(rule, val)}
                                />
                                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                                    {rule.enabled ? t("common.enabled", { defaultValue: "Enabled" }) : t("common.disabled", { defaultValue: "Disabled" })}
                                </span>
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onPress={() => onDeleteRule(rule)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
