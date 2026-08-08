import { lazy } from "react";
import { registerDialog } from "@/lib/dialog-registry";

declare module "@/lib/dialog-registry" {
    interface GlobalDialogRegistry {
        "delete-content-type": { id: string };
    }
}


const DeleteContentTypeDialog = lazy(() =>
    import("./DeleteContentTypeDialog").then((m) => ({
        default: m.DeleteContentTypeDialog
    }))
);


registerDialog({
    id: "delete-content-type",
    component: DeleteContentTypeDialog
});
