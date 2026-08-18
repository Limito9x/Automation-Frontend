import { BaseFormDialog } from "@/components/custom-ui/overlays/dialog/BaseFormDialog";
import type { DialogProps } from "@/lib/dialog-registry";
import { CreateTagGroupForm } from "../components/CreateTagGroupForm";
import { useCreateTagGroup } from "../hooks/useTags";
import { toast } from "sonner";

export interface CreateTagGroupData {
    projectId: string;
    scope?: string;
}

export function CreateTagGroupDialog({
    open,
    onOpenChange,
    data,
}: DialogProps<CreateTagGroupData>) {
    const createGroup = useCreateTagGroup();
    const isPending = createGroup.isPending;

    if (!data?.projectId) return null;

    return (
        <BaseFormDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Create Tag Group"
            formId="create-tag-group-form"
            isPending={isPending}
            size="sm"
        >
            <CreateTagGroupForm
                projectId={data.projectId}
                scope={data.scope}
                onSubmit={(values) => {
                    createGroup.mutate(
                        { data: values },
                        {
                            onSuccess: () => {
                                toast.success("Tag group created successfully");
                                onOpenChange(false);
                            },
                            onError: (err: any) => {
                                toast.error(err?.response?.data?.message || "Failed to create tag group");
                            },
                        }
                    );
                }}
            />
        </BaseFormDialog>
    );
}
