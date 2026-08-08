import { BaseFormField } from "./BaseFormField";
import { Checkbox } from "../ui/checkbox";
import type { BaseFormControlProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormCheckboxProps<T extends FieldValues>
    extends BaseFormControlProps<T> {
    className?: string;
    disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
    className,
    disabled,
    ...rest
}: FormCheckboxProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <Checkbox
                    id={field.field_id}
                    name={field.input_name}
                    isSelected={field.value}
                    onChange={field.onChange}
                    isDisabled={disabled}
                    className={className}
                />
            )}
        />
    );
}
