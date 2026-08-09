import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput, FormTextarea, FormIconPicker, FormSelect } from "@/components/form-controls";
import { updateContentTypeSchema, type UpdateContentTypeInput, type UpdateContentTypeOutput } from "../schemas/updateContentTypeSchema";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

interface ContentTypeFormProps {
    initialData?: Partial<UpdateContentTypeInput>;
    onSubmit: (data: UpdateContentTypeOutput) => void;
}

export function UpdateContentTypeForm({ initialData, onSubmit }: ContentTypeFormProps) {
    const { t } = useTranslation("contentTypes");
    const form = useForm<UpdateContentTypeInput, any, UpdateContentTypeOutput>({
        resolver: zodResolver(updateContentTypeSchema),
        defaultValues: {
            name: initialData?.name || "",
            displayName: initialData?.displayName || "",
            description: initialData?.description || "",
            icon: initialData?.icon || "",
            color: initialData?.color || "",
            sortOrder: initialData?.sortOrder || 0,
            displayConfig: initialData?.displayConfig || { mode: "table" },
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset(initialData);
        }
    }, [initialData, form]);

    return (
        <Form form={form} formId={"update-content-type-form"} onSubmit={onSubmit}>
            <FormGrid cols={2}>
                <FormInput
                    control={form.control}
                    label={t("fields.name", { defaultValue: "Name" })}
                    name="name"
                    type="text"
                    placeholder="Enter name"
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
                <FormSelect
                    control={form.control}
                    label="Display Mode"
                    name="displayConfig.mode"
                    options={[
                        { label: "Table", value: "table" },
                        { label: "List Card", value: "list-card" }
                    ]}
                />
            </div>
        </Form>
    );
}
