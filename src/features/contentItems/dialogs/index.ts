import { lazy } from "react";
import { registerDialog } from "@/lib/dialog-registry";

declare module "@/lib/dialog-registry" {
    interface GlobalDialogRegistry {
        "create-content-item": undefined;
        "update-content-item": { id: string };
        "delete-content-item": { id: string };
    }
}

const CreateContentItemDialog = lazy(() =>
    import("./CreateContentItemDialog").then((m) => ({
        default: m.CreateContentItemDialog
    }))
);

const UpdateContentItemDialog = lazy(() =>
    import("./UpdateContentItemDialog").then((m) => ({
        default: m.UpdateContentItemDialog
    }))
);

const DeleteContentItemDialog = lazy(() =>
    import("./DeleteContentItemDialog").then((m) => ({
        default: m.DeleteContentItemDialog
    }))
);

registerDialog({
    id: "create-content-item",
    component: CreateContentItemDialog
});

registerDialog({
    id: "update-content-item",
    component: UpdateContentItemDialog
});

registerDialog({
    id: "delete-content-item",
    component: DeleteContentItemDialog
});
