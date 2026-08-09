import type { ContentTypeDto } from "@/gen/model";
import { useTranslation } from "react-i18next";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/form/Form";
import { FormRenderer } from "@/components/dynamic-form/FormRenderer";
import { buildDynamicSchema } from "@/lib/schema-builder";
import { useMemo } from "react";
import type { FieldDefinition } from "@/lib/field-registry";

export type ContentItemFormValues = Record<string, any>;

export interface ContentItemFormProps {
    formId: string;
    contentType: ContentTypeDto;
    initialData?: ContentItemFormValues;
    onSubmit: SubmitHandler<ContentItemFormValues>;
}

export function ContentItemForm({ formId, contentType, initialData, onSubmit }: ContentItemFormProps) {
    const { t } = useTranslation(["contentItems", "common"]);

    const fields = useMemo(() => {
        const fieldsConfig = contentType.fieldsConfig as any;
        const dynamicFields = (fieldsConfig || []) as FieldDefinition<any>[];

        const hasNameField = dynamicFields.some(f => f.name === "name");
        if (hasNameField) {
            return dynamicFields;
        }

        const nameField: FieldDefinition<any> = {
            type: "text",
            name: "name",
            label: t("fields.name", { defaultValue: "Name" }),
            properties: {
                placeholder: t("fields.namePlaceholder", { defaultValue: "Enter item name..." }),
                required: true,
            }
        };

        return [nameField, ...dynamicFields];
    }, [contentType, t]);

    const schema = useMemo(() => {
        return buildDynamicSchema(fields);
    }, [fields]);

    const defaultValues = useMemo(() => {
        const defaults = { ...initialData } as Record<string, any>;
        fields.forEach(f => {
            if (f.defaultValue !== undefined && defaults[f.name as string] === undefined) {
                defaults[f.name as string] = f.defaultValue;
            }
        });
        return defaults;
    }, [initialData, fields]);

    const form = useForm<ContentItemFormValues>({
        resolver: zodResolver(schema as any) as any,
        defaultValues,
    });

    return (
        <Form form={form as any} onSubmit={onSubmit as any} formId={formId} className="space-y-6">
            <FormRenderer control={form.control} fields={fields} />
        </Form>
    );
}
