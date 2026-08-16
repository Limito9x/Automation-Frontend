import type { InspectorRuleDto } from "@/gen/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Sparkles, Trash2, FileType } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InspectorRulesTableProps {
    rules: InspectorRuleDto[];
    onToggleRule: (rule: InspectorRuleDto, enabled: boolean) => void;
    onDeleteRule: (rule: InspectorRuleDto) => void;
}

export function InspectorRulesTable({ rules, onToggleRule, onDeleteRule }: InspectorRulesTableProps) {
    const { t } = useTranslation();

    if (rules.length === 0) {
        return (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card">
                {t("inspectors.noRulesFound", { defaultValue: "No automation trigger rules configured yet." })}
            </div>
        );
    }

    return (
        <div className="border rounded-md divide-y divide-border overflow-hidden bg-card">
            {rules.map((rule) => (
                <div
                    key={rule.id}
                    className="p-3.5 text-xs flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="p-1.5 bg-yellow-500/10 rounded text-yellow-500">
                            <Sparkles className="w-4 h-4" />
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground flex items-center gap-1 font-mono">
                                    <FileType className="w-3.5 h-3.5 text-muted-foreground" />
                                    {rule.platformExtensionId || "*"}
                                </span>
                                <span className="text-muted-foreground">➔</span>
                                <Badge variant="outline" className="font-semibold">
                                    {rule.inspectorName || rule.inspectorKey || rule.inspectorId}
                                </Badge>
                                {rule.executorKey && (
                                    <Badge variant="secondary" className="uppercase text-[10px]">
                                        {rule.executorKey}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2">
                            <Switch
                                isSelected={rule.enabled}
                                onChange={(val) => onToggleRule(rule, val)}
                            />
                            <span className="text-[11px] text-muted-foreground">
                                {rule.enabled ? t("common.enabled", { defaultValue: "Enabled" }) : t("common.disabled", { defaultValue: "Disabled" })}
                            </span>
                        </div>

                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                            onPress={() => onDeleteRule(rule)}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
}
