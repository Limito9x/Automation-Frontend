import { registerField, type ExtractConfig } from "@/lib/field-registry";
import { BaseFormField } from "./BaseFormField";
import { Textarea } from "../ui/textarea";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormTextareaProps<T extends FieldValues>
    extends BaseFormControlProps<T>,
    OmitFormProps<React.ComponentPropsWithoutRef<"textarea">> {
}

export function FormTextarea<T extends FieldValues>({
    placeholder,
    className,
    disabled,
    ...rest
}: FormTextareaProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <Textarea
                    {...field}
                    id={field.field_id}
                    name={field.input_name}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={field.value ?? ""}
                    className={cn("w-full min-h-[100px]", className)}
                />
            )}
        />
    );
}


declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "textarea": ExtractConfig<FormTextareaProps<any>>
    }
}
registerField({
    type: "textarea",
    component: FormTextarea
});
