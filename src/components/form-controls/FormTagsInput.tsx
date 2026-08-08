import { BaseFormField } from "./BaseFormField";
import { registerField, type ExtractConfig, type BaseFieldRules } from "@/lib/field-registry";
import { z } from "zod";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { TagsInput, type TagsInputProps } from "@/components/custom-ui/inputs/tags-input/TagsInput";

export interface FormTagsInputProps<T extends FieldValues>
    extends BaseFormControlProps<T>,
    OmitFormProps<Omit<TagsInputProps, "value" | "onChange">> {
}

export function FormTagsInput<T extends FieldValues>({
    disabled,
    ...rest
}: FormTagsInputProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={({ value, onChange, ref, ...fieldProps }) => (
                <TagsInput
                    {...fieldProps}
                    ref={ref}
                    value={value || []}
                    onChange={onChange}
                    disabled={disabled}
                    id={rest.id}
                />
            )}
        />
    );
}

declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "tags": {
            config: ExtractConfig<FormTagsInputProps<any>>,
            rules: BaseFieldRules,
            defaultValue: string[]
        }
    }
}
registerField({
    type: "tags",
    component: FormTagsInput,
    buildSchema: (rules: BaseFieldRules) => {
        const reqMsg = rules.requiredMsg || "Required";
        let s = z.array(z.string(), { message: reqMsg });
        if (rules.required) s = s.min(1, reqMsg);
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
