import { registerField, type ExtractConfig, type BaseFieldRules } from "@/lib/field-registry";
import { z } from "zod";
import { Checkbox } from "../ui/checkbox";
import type { BaseFormControlProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { BaseFormField } from "./BaseFormField";
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
                <div>
                    <Checkbox
                        id={field.field_id}
                        name={field.input_name}
                        isSelected={field.value}
                        onChange={field.onChange}
                        isDisabled={disabled}
                        className={className}
                    />
                </div>
            )}
        />
    );
}


declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "checkbox": {
            config: ExtractConfig<FormCheckboxProps<any>>,
            rules: BaseFieldRules,
            defaultValue: boolean
        }
    }
}
registerField({
    type: "checkbox",
    component: FormCheckbox,
    buildSchema: (rules: BaseFieldRules) => {
        const reqMsg = rules.requiredMsg || "Required";
        let s = z.boolean({ message: reqMsg });
        if (rules.required) s = s.refine(val => val === true, reqMsg);
        if (!rules.required) return s.optional().nullable();
        return s;
    },
    builderFields: [
        {
            name: "required",
            target: "rules",
            fieldType: "switch",
            label: "Required?"
        }
    ]
});
