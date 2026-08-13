import { BaseFormDialog } from "@/components/custom-ui/overlays/dialog/BaseFormDialog";
import { CreateWorkspaceForm } from "../components/CreateWorkspaceForm";
import { useUpdateWorkspace } from "../hooks/useWorkspaces";
import type { DialogProps } from "@/lib/dialog-registry";

export function UpdateWorkspaceDialog({ open, onOpenChange, data }: DialogProps<{ id: string; name: string }>) {
  const updateWorkspace = useUpdateWorkspace();

  return (
    <BaseFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Workspace"
      formId="workspace-form"
      isPending={updateWorkspace.isPending}
      size="md"
    >
      <CreateWorkspaceForm
        defaultValues={{ name: data?.name }}
        onSubmit={(values) => {
          if (!data) return;
          updateWorkspace.mutate(
            { id: data.id, data: { name: values.name } },
            {
              onSuccess: () => onOpenChange(false),
            }
          );
        }}
      />
    </BaseFormDialog>
  );
}
