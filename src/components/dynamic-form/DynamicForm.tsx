import { useForm, type DefaultValues, type FieldValues, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import { Form } from "@/components/form/Form";
import { FormRenderer } from "./FormRenderer";
import type { FieldDefinition } from "@/lib/field-registry";
import { Button } from "@/components/ui/button";

export interface DynamicFormProps<T extends FieldValues> {
    /** Zod schema for form validation */
    schema?: ZodType<any, any, any>;
    /** Initial values for the form */
    defaultValues?: DefaultValues<T>;
    /** Array of field definitions */
    fields: FieldDefinition<T>[];
    /** Submit handler */
    onSubmit: SubmitHandler<T>;
    /** Text to display on the submit button */
    submitText?: string;
    formId?: string;
}

export function DynamicForm<T extends FieldValues>({
    schema,
    defaultValues,
    fields,
    onSubmit,
    submitText = "Lưu thông tin",
    formId,
}: DynamicFormProps<T>) {
    const form = useForm<T>({
        resolver: schema ? zodResolver(schema) : undefined,
        defaultValues,
    });

    return (
        <Form form={form} onSubmit={onSubmit} formId={formId}>
            <FormRenderer control={form.control} fields={fields} />
            <div className="flex justify-end mt-4">
                <Button type="submit">
                    {submitText}
                </Button>
            </div>
        </Form>
    );
}
