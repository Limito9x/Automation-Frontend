export interface DraggableTagPayload {
    type: "tag";
    tagId: string;
    tagName: string;
    tagColor?: string | null;
    tagGroupId: string;
    tagGroupName: string;
}

export interface TagDropZonePayload {
    type: "tag-drop-zone";
    path: string;
    entityId: string;
    entityType: string;
}

export interface TagLinkDetailDto {
    tagLinkId: string;
    tagId: string;
    tagName: string;
    tagColor?: string | null;
    tagGroupId: string;
    tagGroupScope: string;
    tagGroupName: string;
    metadataJson?: string | null;
}
