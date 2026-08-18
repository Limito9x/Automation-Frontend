import { lazy } from "react";
import { registerDialog } from "@/lib/dialog-registry";
import type { CreateTagGroupData } from "./CreateTagGroupDialog";
import type { CreateTagData } from "./CreateTagDialog";

declare module "@/lib/dialog-registry" {
    interface GlobalDialogRegistry {
        "create-tag-group": CreateTagGroupData;
        "create-tag": CreateTagData;
    }
}

const CreateTagGroupDialog = lazy(() =>
    import("./CreateTagGroupDialog").then((m) => ({
        default: m.CreateTagGroupDialog,
    }))
);

const CreateTagDialog = lazy(() =>
    import("./CreateTagDialog").then((m) => ({
        default: m.CreateTagDialog,
    }))
);

registerDialog({
    id: "create-tag-group",
    component: CreateTagGroupDialog,
});

registerDialog({
    id: "create-tag",
    component: CreateTagDialog,
});
