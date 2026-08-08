import { registerField, type ExtractConfig } from "@/lib/field-registry";
import { BaseFormField } from "./BaseFormField";
import { Input } from "../ui/input";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormInputProps<T extends FieldValues>
    extends BaseFormControlProps<T>,
    OmitFormProps<React.ComponentPropsWithoutRef<"input">> {
    type?: React.HTMLInputTypeAttribute;
}

export function FormInput<T extends FieldValues>({
    type = "text",
    placeholder,
    className,
    disabled,
    ...rest
}: FormInputProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <Input
                    {...field}
                    id={field.field_id}           // login-form_email
                    name={field.input_name}       // login-form_email (input element)
                    autoComplete={field.autoComplete}
                    type={type}
                    placeholder={placeholder}
                    disabled={disabled}
                    value={field.value ?? ""}
                    className={cn("w-full", className)}
                />
            )}
        />
    );
}

declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "text": ExtractConfig<FormInputProps<any>>
    }
}
registerField({
    type: "text",
    component: FormInput
});
