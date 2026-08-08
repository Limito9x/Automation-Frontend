import { registerField, type ExtractConfig } from "@/lib/field-registry";
import { BaseFormField } from "./BaseFormField";
import { BaseNumberInput, type BaseNumberInputProps } from "@/components/custom-ui/inputs/number-input/BaseNumberInput";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export type FormNumberInputProps<T extends FieldValues> = BaseFormControlProps<T> & OmitFormProps<BaseNumberInputProps>;

export function FormNumberInput<T extends FieldValues>({
    placeholder,
    className,
    disabled,
    min,
    max,
    allowNegative,
    decimalScale,
    thousandSeparator,
    ...rest
}: FormNumberInputProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <BaseNumberInput
                    {...field}
                    id={field.field_id}
                    name={field.input_name}
                    autoComplete={field.autoComplete}
                    placeholder={placeholder}
                    disabled={disabled}
                    min={min}
                    max={max}
                    allowNegative={allowNegative}
                    decimalScale={decimalScale}
                    thousandSeparator={thousandSeparator}
                    value={field.value ?? ""}
                    className={cn("w-full", className)}
                />
            )}
        />
    );
}

declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "number": ExtractConfig<FormNumberInputProps<any>>
    }
}
registerField({
    type: "number",
    component: FormNumberInput
});
