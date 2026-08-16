import type { InspectorDto, InspectorVersionDto } from "@/gen/model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, Terminal, Edit, Layers, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InspectorsTableProps {
    inspectors: InspectorDto[];
    onEdit: (inspector: InspectorDto) => void;
    onManageVersions: (inspector: InspectorDto) => void;
    onDelete: (inspector: InspectorDto) => void;
}

export function InspectorsTable({ inspectors, onEdit, onManageVersions, onDelete }: InspectorsTableProps) {
    const { t } = useTranslation();

    if (inspectors.length === 0) {
        return (
            <div className="p-8 text-center text-xs text-muted-foreground border border-dashed rounded-lg bg-card">
                {t("inspectors.noInspectorsFound", { defaultValue: "No inspectors configured for this project." })}
            </div>
        );
    }

    return (
        <div className="border rounded-md divide-y divide-border overflow-hidden bg-card">
            {inspectors.map((ins) => {
                const versions = (ins.versions || []) as unknown as InspectorVersionDto[];
                const publishedVersion = versions.find(v => v.isPublished);

                return (
                    <div
                        key={ins.id}
                        className="p-4 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                        <div className="space-y-1.5 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded text-primary">
                                    {ins.executorKey === "blender" ? (
                                        <Cpu className="w-4 h-4 text-orange-500" />
                                    ) : (
                                        <Terminal className="w-4 h-4 text-blue-500" />
                                    )}
                                </div>
                                <span className="font-semibold text-sm text-foreground">{ins.name}</span>
                                <Badge variant="outline" className="font-mono text-[11px]">
                                    {ins.key}
                                </Badge>
                                <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                                    {ins.executorKey}
                                </Badge>
                            </div>

                            {ins.description && (
                                <p className="text-muted-foreground line-clamp-1">{ins.description}</p>
                            )}

                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                                <span>
                                    {t("inspectors.currentVersion", { defaultValue: "Published Version:" })}{" "}
                                    {publishedVersion ? (
                                        <span className="font-mono font-semibold text-foreground">
                                            v{publishedVersion.version} ({publishedVersion.entryPoint})
                                        </span>
                                    ) : (
                                        <span className="text-amber-500 italic">
                                            {t("inspectors.noPublishedVersion", { defaultValue: "None (Upload script first)" })}
                                        </span>
                                    )}
                                </span>
                                <span>•</span>
                                <span>
                                    {versions.length} {t("inspectors.totalVersions", { defaultValue: "versions uploaded" })}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs flex items-center gap-1.5"
                                onPress={() => onManageVersions(ins)}
                            >
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                {t("inspectors.versionsBtn", { defaultValue: "Versions & Scripts" })}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs"
                                onPress={() => onEdit(ins)}
                            >
                                <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                onPress={() => onDelete(ins)}
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
