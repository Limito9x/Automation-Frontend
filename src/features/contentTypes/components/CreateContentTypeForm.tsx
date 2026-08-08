import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput } from "@/components/form-controls";
import { createContentTypeSchema, type CreateContentTypeInput, type CreateContentTypeOutput } from "../schemas/createContentTypeSchema";
import { useTranslation } from "react-i18next";

interface ContentTypeFormProps {
    onSubmit: (data: CreateContentTypeOutput) => void;
}

export function CreateContentTypeForm({ onSubmit }: ContentTypeFormProps) {
    const { t } = useTranslation("contentTypes");
    const form = useForm<CreateContentTypeInput, any, CreateContentTypeOutput>({
        resolver: zodResolver(createContentTypeSchema),
        defaultValues: {
            name: "",
        }
    });

    return (
        <Form form={form} formId={"create-content-type-form"} onSubmit={onSubmit}>
            <FormGrid cols={1}>
                <FormInput
                    control={form.control}
                    label={t("fields.name", { defaultValue: "Name" })}
                    name="name"
                    type="text"
                    placeholder="Enter name"
                />
            </FormGrid>
        </Form>
    );
}
