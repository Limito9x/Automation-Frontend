import { UpdateContentItemForm } from "../components/UpdateContentItemForm";
import { BaseFormDialog } from "@/components/custom-ui/overlays/dialog/BaseFormDialog";
import type { DialogProps } from "@/lib/dialog-registry";
import { useTranslation } from "react-i18next";
import { useUpdateContentItem } from "../hooks/useContentItems";

export function UpdateContentItemDialog({ open, onOpenChange, data }: DialogProps<{ id: string }>) {
    const { t } = useTranslation("contentItems");
    const updateContentItem = useUpdateContentItem();
    const isPending = updateContentItem.isPending;

    if (!data?.id) return null;

    return (
        <BaseFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title={t("actions.update", { defaultValue: "Edit ContentItem" })}
            formId={`update-content-item-form-${data.id}`}
            isPending={isPending}
            size="md"
        >
            <UpdateContentItemForm
                id={data.id}
                onSubmit={(values) => {
                    updateContentItem.mutate({ id: data.id, data: values }, {
                        onSuccess: () => onOpenChange(false)
                    });
                }}
            />
        </BaseFormDialog>
    );
}
