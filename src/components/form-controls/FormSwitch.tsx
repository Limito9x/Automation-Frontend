import { BaseFormField } from "./BaseFormField";
import { Switch } from "../ui/switch";
import type { BaseFormControlProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormSwitchProps<T extends FieldValues>
    extends BaseFormControlProps<T> {
    className?: string;
    disabled?: boolean;
}

export function FormSwitch<T extends FieldValues>({
    className,
    disabled,
    ...rest
}: FormSwitchProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <Switch
                    id={field.field_id}
                    name={field.input_name}
                    isSelected={!!field.value}
                    onChange={field.onChange}
                    isDisabled={disabled}
                    className={className}
                />
            )}
        />
    );
}
