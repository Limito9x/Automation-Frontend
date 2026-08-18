import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Tag as TagIcon } from "lucide-react";
import type { DraggableTagPayload } from "../types";
import { cn } from "@/lib/utils";

interface DraggableTagCardProps {
    tag: {
        id: string;
        name: string;
        color?: string | null;
        tagGroupId: string;
    };
    groupName: string;
    scope?: string;
    isOverlay?: boolean;
}

export function DraggableTagCard({
    tag,
    groupName,
    isOverlay = false,
}: DraggableTagCardProps) {
    const payload: DraggableTagPayload = {
        type: "tag",
        tagId: tag.id,
        tagName: tag.name,
        tagColor: tag.color,
        tagGroupId: tag.tagGroupId,
        tagGroupName: groupName,
    };

    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `tag-${tag.id}`,
        data: payload,
        disabled: isOverlay,
    });

    const tagColor = tag.color || "#3b82f6";

    return (
        <div
            ref={isOverlay ? undefined : setNodeRef}
            {...(isOverlay ? {} : listeners)}
            {...(isOverlay ? {} : attributes)}
            className={cn(
                "group relative flex items-center justify-between p-2.5 rounded-xl border select-none text-xs transition-all",
                isOverlay
                    ? "bg-card/95 border-primary shadow-2xl ring-2 ring-primary/40 cursor-grabbing scale-105"
                    : isDragging
                    ? "opacity-30 border-dashed border-primary/60 bg-primary/5"
                    : "border-border/70 bg-card/60 hover:bg-card/90 hover:border-border/90 hover:shadow-md cursor-grab active:cursor-grabbing"
            )}
        >
            {/* Left: Drag Handle + Tag name + color indicator */}
            <div className="flex items-center gap-2.5 min-w-0">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors shrink-0" />

                <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: tagColor }}
                />

                <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-foreground truncate tracking-tight">
                        {tag.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                        {groupName}
                    </span>
                </div>
            </div>

            {/* Right: Badge style tag */}
            <div
                className="px-2 py-0.5 rounded-md text-[10px] font-medium shrink-0 flex items-center gap-1 border"
                style={{
                    backgroundColor: `${tagColor}15`,
                    color: tagColor,
                    borderColor: `${tagColor}30`,
                }}
            >
                <TagIcon className="w-2.5 h-2.5" />
                <span>{tag.name}</span>
            </div>
        </div>
    );
}
