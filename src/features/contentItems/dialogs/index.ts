import { lazy } from "react";
import { registerDialog } from "@/lib/dialog-registry";

declare module "@/lib/dialog-registry" {
    interface GlobalDialogRegistry {
        "delete-content-item": { id: string; typeKey: string; projectId: string };
    }
}

const DeleteContentItemDialog = lazy(() =>
    import("./DeleteContentItemDialog").then((m) => ({
        default: m.DeleteContentItemDialog
    }))
);

registerDialog({
    id: "delete-content-item",
    component: DeleteContentItemDialog
});
