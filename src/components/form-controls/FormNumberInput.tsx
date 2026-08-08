import { registerField, type ExtractConfig } from "@/lib/field-registry";
import { BaseFormField } from "./BaseFormField";
import { BaseNumberInput, type BaseNumberInputProps } from "@/components/custom-ui/inputs/number-input/BaseNumberInput";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import type { BaseFieldRules } from "@/lib/field-registry";
import { z } from "zod";
import { cn } from "@/lib/utils";

export interface FormNumberRules extends BaseFieldRules {
    min?: number;
    max?: number;
}

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
        "number": {
            config: ExtractConfig<FormNumberInputProps<any>>,
            rules: FormNumberRules
        }
    }
}
registerField({
    type: "number",
    component: FormNumberInput,
    buildSchema: (rules: FormNumberRules) => {
        const reqMsg = rules.requiredMsg || "Required";
        let s = z.number({ message: reqMsg });
        if (rules.min !== undefined) s = s.min(rules.min, `Min is ${rules.min}`);
        if (rules.max !== undefined) s = s.max(rules.max, `Max is ${rules.max}`);

        if (!rules.required) {
            return s.optional().nullable();
        }
        return s;
    },
    builderFields: [
        {
            name: "required",
            type: "switch",
            label: "Required?",
            config: {}
        },
        {
            name: "min",
            type: "number",
            label: "Minimum Value",
            config: {}
        },
        {
            name: "max",
            type: "number",
            label: "Maximum Value",
            config: {}
        },
        {
            name: "allowNegative",
            type: "switch",
            label: "Allow Negative?",
            config: {},
            defaultValue: false
        },
        {
            name: "decimalScale",
            type: "number",
            label: "Decimal Scale",
            config: {}
        },
        {
            name: "thousandSeparator",
            type: "switch",
            label: "Thousand Separator?",
            config: {}
        },
    ]
});
