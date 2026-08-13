import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput } from "@/components/form-controls";
import { createWorkspaceSchema, type CreateWorkspaceInput, type CreateWorkspaceOutput } from "../schemas/workspaceSchema";

interface CreateWorkspaceFormProps {
  onSubmit: (values: CreateWorkspaceOutput) => void;
  defaultValues?: Partial<CreateWorkspaceInput>;
}

export function CreateWorkspaceForm({ onSubmit, defaultValues }: CreateWorkspaceFormProps) {
  const form = useForm<CreateWorkspaceInput, any, CreateWorkspaceOutput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: defaultValues?.name || "",
    },
  });

  return (
    <Form form={form} formId="workspace-form" onSubmit={onSubmit}>
      <FormGrid cols={1}>
        <FormInput
          control={form.control}
          label="Workspace Name"
          name="name"
          type="text"
          placeholder="e.g. Production Workspace"
        />
      </FormGrid>
    </Form>
  );
}
