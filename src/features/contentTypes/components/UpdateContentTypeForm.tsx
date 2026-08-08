import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput } from "@/components/form-controls";
import { updateContentTypeSchema, type UpdateContentTypeInput, type UpdateContentTypeOutput } from "../schemas/updateContentTypeSchema";
import { useTranslation } from "react-i18next";
// import { useGetContentTypeById } from "../hooks/useContentTypes";

interface ContentTypeFormProps {
    id: string;
    onSubmit: (data: UpdateContentTypeOutput) => void;
}

export function UpdateContentTypeForm({ id, onSubmit }: ContentTypeFormProps) {
    const { t } = useTranslation("contentTypes");
    
    // TODO: Bỏ comment khi API get by id khả dụng
    // const { data: contentType } = useGetContentTypeById(id);
    const contentType: any = null;

    const form = useForm<UpdateContentTypeInput, any, UpdateContentTypeOutput>({
        resolver: zodResolver(updateContentTypeSchema),
        values: contentType ? {
            name: contentType.name || "",
        } : undefined,
        defaultValues: {
            name: "",
        }
    });

    return (
        <Form form={form} formId={`update-content-type-form-${id}`} onSubmit={onSubmit}>
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
