import { CreateContentItemForm } from "../components/CreateContentItemForm";
import { BaseFormDialog } from "@/components/custom-ui/overlays/dialog/BaseFormDialog";
import type { DialogProps } from "@/lib/dialog-registry";
import { useTranslation } from "react-i18next";
import { useCreateContentItem } from "../hooks/useContentItems";

export function CreateContentItemDialog({ open, onOpenChange }: DialogProps<undefined>) {
    const { t } = useTranslation("contentItems");
    const createContentItem = useCreateContentItem();
    const isPending = createContentItem.isPending;

    return (
        <BaseFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("actions.create", { defaultValue: "Create ContentItem" })}
            formId="create-content-item-form"
            isPending={isPending}
            size="md"
        >
            <CreateContentItemForm
                onSubmit={(values) => {
                    createContentItem.mutate({ data: values }, {
                        onSuccess: () => onOpenChange(false)
                    });
                }}
            />
        </BaseFormDialog>
    );
}
