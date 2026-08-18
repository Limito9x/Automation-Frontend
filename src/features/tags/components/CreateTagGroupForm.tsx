import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput } from "@/components/form-controls";
import {
    createTagGroupSchema,
    type CreateTagGroupInput,
    type CreateTagGroupOutput,
} from "../schemas/createTagGroupSchema";

interface CreateTagGroupFormProps {
    projectId: string;
    scope?: string;
    onSubmit: (data: CreateTagGroupOutput) => void;
}

export function CreateTagGroupForm({
    projectId,
    scope = "inspection",
    onSubmit,
}: CreateTagGroupFormProps) {
    const form = useForm<CreateTagGroupInput, any, CreateTagGroupOutput>({
        resolver: zodResolver(createTagGroupSchema),
        defaultValues: {
            name: "",
            scope,
            projectId,
        },
    });

    return (
        <Form form={form} formId="create-tag-group-form" onSubmit={onSubmit}>
            <FormGrid cols={1}>
                <FormInput
                    control={form.control}
                    label="Group Name"
                    name="name"
                    type="text"
                    placeholder="e.g. Geometry & Mesh Topology, QA & Approval"
                />
            </FormGrid>
        </Form>
    );
}
