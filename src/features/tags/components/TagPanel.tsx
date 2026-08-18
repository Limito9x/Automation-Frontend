import { useState, useMemo } from "react";
import { useTagGroups, useTags } from "../hooks/useTags";
import { DraggableTagCard } from "./DraggableTagCard";
import { useProjectToolbarStore } from "@/stores/projectToolbarStore";
import { useDialogStore } from "@/stores/dialogStore";
import "@/features/tags/dialogs";
import {
    Tag,
    X,
    Search,
    Sparkles,
    Plus,
    FolderPlus,
    Layers,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagPanelProps {
    projectId: string;
    scope?: string;
    contextTitle?: string;
}

export function TagPanel({ projectId, scope = "inspection", contextTitle }: TagPanelProps) {
    const closePanel = useProjectToolbarStore((s) => s.closePanel);
    const isCollapsed = useProjectToolbarStore((s) => s.isCollapsed);
    const toggleCollapse = useProjectToolbarStore((s) => s.toggleCollapse);
    const isDragging = useProjectToolbarStore((s) => s.isDragging);
    const openDialog = useDialogStore((s) => s.openDialog);

    // Minimize either when manually collapsed or during tag dragging
    const isMinimized = isCollapsed || isDragging;
    
    const { data: groupsData, isLoading: isLoadingGroups } = useTagGroups({
        projectId,
        scope: scope || undefined,
    });
    const { data: tagsData, isLoading: isLoadingTags } = useTags(undefined, {
        enabled: Boolean(projectId),
    });

    const groups = groupsData ?? [];
    const tags = tagsData ?? [];
    const isLoading = isLoadingGroups || isLoadingTags;

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    // Group tags by group ID
    const tagsByGroupId = useMemo(() => {
        const map = new Map<string, typeof tags>();
        tags.forEach((tag) => {
            const list = map.get(tag.tagGroupId) || [];
            list.push(tag);
            map.set(tag.tagGroupId, list);
        });
        return map;
    }, [tags]);

    // Filter groups and their tags
    const displayGroups = useMemo(() => {
        return groups.filter((group) => {
            if (selectedGroupId && group.id !== selectedGroupId) return false;

            if (!searchQuery) return true;

            const lowerQuery = searchQuery.toLowerCase();
            const groupMatches = group.name.toLowerCase().includes(lowerQuery);
            const groupTags = tagsByGroupId.get(group.id) || [];
            const hasMatchingTag = groupTags.some((t) =>
                t.name.toLowerCase().includes(lowerQuery)
            );

            return groupMatches || hasMatchingTag;
        });
    }, [groups, selectedGroupId, searchQuery, tagsByGroupId]);

    const totalMatchingTags = useMemo(() => {
        let count = 0;
        displayGroups.forEach((group) => {
            const groupTags = tagsByGroupId.get(group.id) || [];
            if (!searchQuery) {
                count += groupTags.length;
            } else {
                const lower = searchQuery.toLowerCase();
                count += groupTags.filter(
                    (t) =>
                        t.name.toLowerCase().includes(lower) ||
                        group.name.toLowerCase().includes(lower)
                ).length;
            }
        });
        return count;
    }, [displayGroups, tagsByGroupId, searchQuery]);

    return (
        <div
            className={cn(
                "fixed bottom-3 left-4 right-14 md:left-6 md:right-16 z-40 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
                isMinimized
                    ? "h-[54px] max-h-[54px] border-primary/40 shadow-lg"
                    : "h-[390px] max-h-[55vh]"
            )}
        >
            {/* Top Header Bar */}
            <div className="px-4 py-2.5 border-b border-border/70 flex flex-wrap items-center justify-between gap-3 bg-muted/20 shrink-0 h-[52px]">
                {/* Left: Scope title and info */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Tag className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                                {scope.toUpperCase()} TAGS
                            </span>
                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono">
                                {tags.length} tags
                            </Badge>
                        </div>
                        {contextTitle && (
                            <span className="text-[11px] text-muted-foreground truncate block">
                                Context: {contextTitle}
                            </span>
                        )}
                    </div>
                </div>

                {/* Center: Hint banner or Dragging active indicator */}
                {isDragging ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-semibold animate-pulse shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Dragging tag — drop onto any table value cell above</span>
                    </div>
                ) : (
                    <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-[11px]">
                            <strong className="text-foreground">Drag & Drop</strong> any tag below onto a <span className="font-semibold text-primary">Value cell</span> in the JSON table.
                        </span>
                    </div>
                )}

                {/* Right: Search, Actions, Collapse & Close */}
                <div className="flex items-center gap-2 ml-auto">
                    {!isMinimized && (
                        <>
                            <div className="relative w-40 sm:w-56">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search tags or groups..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-7.5 text-xs bg-card"
                                />
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7.5 text-xs gap-1 px-2.5 cursor-pointer"
                                onPress={() => {
                                    openDialog("create-tag-group", { projectId, scope });
                                }}
                            >
                                <FolderPlus className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">New Group</span>
                            </Button>
                        </>
                    )}

                    {/* Collapse / Expand Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg text-muted-foreground hover:text-foreground"
                        onPress={toggleCollapse}
                        aria-label={isCollapsed ? "Expand tags panel" : "Collapse tags panel"}
                    >
                        {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>

                    {/* Close Button */}
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="rounded-lg text-muted-foreground hover:text-foreground"
                        onPress={closePanel}
                        aria-label="Close tags panel"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Collapsible Body Area */}
            <div
                className={cn(
                    "flex-1 flex flex-col min-h-0 overflow-hidden transition-opacity duration-200",
                    isMinimized ? "opacity-0 pointer-events-none hidden" : "opacity-100"
                )}
            >
                {/* Quick Filter Group Tabs */}
                <div className="px-4 py-2 border-b border-border/50 flex items-center gap-1.5 overflow-x-auto bg-muted/10 shrink-0 no-scrollbar">
                    <button
                        type="button"
                        onClick={() => setSelectedGroupId(null)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                            selectedGroupId === null
                                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                    >
                        All Groups ({groups.length})
                    </button>
                    {groups.map((group) => {
                        const countInGroup = tags.filter((t) => t.tagGroupId === group.id).length;
                        const isSelected = selectedGroupId === group.id;
                        return (
                            <button
                                key={group.id}
                                type="button"
                                onClick={() => setSelectedGroupId(group.id)}
                                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                                    isSelected
                                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                                <span>{group.name}</span>
                                <span className="text-[10px] opacity-70 font-mono">({countInGroup})</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area: 2 Group Boxes Per Row */}
                <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {[1, 2].map((i) => (
                                <div
                                    key={i}
                                    className="h-36 bg-muted/30 animate-pulse rounded-xl border border-border/60"
                                />
                            ))}
                        </div>
                    ) : displayGroups.length === 0 ? (
                        <div className="h-full min-h-[160px] flex flex-col items-center justify-center text-center text-xs text-muted-foreground border border-dashed rounded-xl bg-muted/10 space-y-2 p-6">
                            <Tag className="w-7 h-7 mx-auto text-muted-foreground/40" />
                            <p className="font-semibold text-sm text-foreground">No matching tag groups</p>
                            <p className="text-xs text-muted-foreground max-w-sm">
                                Try searching with different keywords or click "New Group" to create one.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {displayGroups.map((group) => {
                                const allGroupTags = tagsByGroupId.get(group.id) || [];
                                const filteredGroupTags = allGroupTags.filter(
                                    (tag) =>
                                        !searchQuery ||
                                        tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        group.name.toLowerCase().includes(searchQuery.toLowerCase())
                                );

                                return (
                                    <div
                                        key={group.id}
                                        className="border border-border/70 rounded-xl bg-card/60 p-3.5 flex flex-col gap-3 shadow-xs hover:border-border/90 transition-colors"
                                    >
                                        {/* Group Card Header */}
                                        <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/50">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Layers className="w-4 h-4 text-primary shrink-0" />
                                                <span className="font-semibold text-xs text-foreground tracking-tight truncate">
                                                    {group.name}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className="text-[10px] py-0 px-1.5 text-muted-foreground font-mono"
                                                >
                                                    {allGroupTags.length} tags
                                                </Badge>
                                            </div>

                                            {/* Horizontal Add Tag button next to group name */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6.5 text-[11px] gap-1 px-2 shrink-0 bg-background/80 hover:bg-accent cursor-pointer"
                                                onPress={() => {
                                                    openDialog("create-tag", {
                                                        tagGroupId: group.id,
                                                        groupName: group.name,
                                                    });
                                                }}
                                            >
                                                <Plus className="w-3 h-3 text-primary" />
                                                <span>Add Tag</span>
                                            </Button>
                                        </div>

                                        {/* Group Card Tags Grid */}
                                        {filteredGroupTags.length === 0 ? (
                                            <div className="py-4 text-center text-xs text-muted-foreground/70 border border-dashed rounded-lg bg-muted/5">
                                                No tags in this group yet.{" "}
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        openDialog("create-tag", {
                                                            tagGroupId: group.id,
                                                            groupName: group.name,
                                                        });
                                                    }}
                                                    className="text-primary font-semibold hover:underline cursor-pointer inline-flex items-center gap-0.5"
                                                >
                                                    + Add Tag
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {filteredGroupTags.map((tag) => (
                                                    <DraggableTagCard
                                                        key={tag.id}
                                                        tag={tag}
                                                        groupName={group.name}
                                                        scope={scope}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Bottom Status Footer */}
                <div className="px-4 py-2 border-t border-border/70 bg-muted/20 flex items-center justify-between gap-2 text-[11px] text-muted-foreground font-mono shrink-0">
                    <span>
                        Showing {totalMatchingTags} tags across {displayGroups.length} groups
                    </span>
                    <span className="text-[10px] text-muted-foreground/70">
                        Scope: {scope}
                    </span>
                </div>
            </div>
        </div>
    );
}
