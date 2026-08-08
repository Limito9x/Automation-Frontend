import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput, FormTextarea, FormIconPicker } from "@/components/form-controls";
import { createContentTypeSchema, type CreateContentTypeInput, type CreateContentTypeOutput } from "../schemas/createContentTypeSchema";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { SchemaBuilder } from "./SchemaBuilder";

interface ContentTypeFormProps {
    onSubmit: (data: CreateContentTypeOutput) => void;
    projectId: string;
}

export function CreateContentTypeForm({ onSubmit, projectId }: ContentTypeFormProps) {
    const { t } = useTranslation("contentTypes");
    const form = useForm<CreateContentTypeInput, any, CreateContentTypeOutput>({
        resolver: zodResolver(createContentTypeSchema),
        defaultValues: {
            projectId: projectId,
            name: "",
            displayName: "",
            key: "",
            description: "",
            icon: "",
            color: "",
            sortOrder: 0,
            fieldsConfig: [],
            displayConfig: {},
        }
    });

    const nameValue = form.watch("name");

    useEffect(() => {
        if (nameValue) {
            const slug = nameValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            form.setValue("key", slug, { shouldValidate: true });
            form.setValue("displayName", nameValue, { shouldValidate: true });
        }
    }, [nameValue, form]);

    return (
        <Form form={form} formId={"create-content-type-form"} onSubmit={onSubmit}>
            <FormGrid cols={2}>
                <FormInput
                    control={form.control}
                    label={t("fields.name", { defaultValue: "Name" })}
                    name="name"
                    type="text"
                    placeholder="Enter name (e.g. Blog Post)"
                />
                <FormIconPicker
                    control={form.control}
                    label={t("fields.icon", { defaultValue: "Icon (optional)" })}
                    name="icon"
                />
            </FormGrid>
            <div className="mt-4">
                <FormTextarea
                    control={form.control}
                    label={t("fields.description", { defaultValue: "Description" })}
                    name="description"
                    placeholder="Describe this content type..."
                />
            </div>
            <SchemaBuilder />
        </Form>
    );
}
