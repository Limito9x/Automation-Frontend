import { StaticCombobox, type StaticComboboxProps } from '@/components/custom-ui/inputs/combobox/StaticCombobox'
import { registerField, type ExtractConfig, type BaseFieldRules } from "@/lib/field-registry";
import { BaseFormField } from './BaseFormField'
import type { BaseFormControlProps } from './type'
import type { FieldValues } from 'react-hook-form'
import { z } from 'zod'

export interface FormStaticComboboxProps<TFieldValues extends FieldValues, TValue = any>
    extends BaseFormControlProps<TFieldValues>,
    Omit<StaticComboboxProps<TValue>, 'value' | 'onValueChange' | 'useOptions'> {
    useOptions?: () => { data?: any[]; isLoading: boolean }
    options?: (any | string)[];
}

/**
 * FormStaticCombobox
 * Form Adapter cho StaticCombobox. Chỉ làm nhiệm vụ gắn kết StaticCombobox vào react-hook-form.
 */
export function FormStaticCombobox<TFieldValues extends FieldValues, TValue = any>({
    options,
    useOptions,
    ...rest
}: FormStaticComboboxProps<TFieldValues, TValue>) {
    
    // Nếu truyền options (từ Builder/JSON), biến nó thành useOptions giả.
    // Nếu truyền useOptions, ưu tiên dùng nó.
    const resolvedUseOptions = useOptions || (() => {
        const normalizedOptions = (options || []).map(opt => 
            typeof opt === "string" ? { label: opt, value: opt } : opt
        );
        return { data: normalizedOptions, isLoading: false };
    });

    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <StaticCombobox
                    {...rest}
                    id={field.field_id}
                    value={field.value}
                    onValueChange={field.onChange}
                    useOptions={resolvedUseOptions}
                />
            )}
        />
    )
}

declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "staticCombobox": {
            config: ExtractConfig<FormStaticComboboxProps<any, any>>,
            rules: BaseFieldRules,
            defaultValue: string
        }
    }
}
registerField({
    type: "staticCombobox",
    component: FormStaticCombobox,
    buildSchema: (rules: BaseFieldRules) => {
        let s = z.string({ message: rules.requiredMsg || "Required" });
        if (rules.required) s = s.min(1, rules.requiredMsg || "Required");
        if (!rules.required) return s.optional().nullable();
        return s;
    },
    builderFields: [
        {
            name: "placeholder",
            target: "config",
            fieldType: "text",
            label: "Placeholder"
        },
        {
            name: "options",
            target: "config",
            fieldType: "tags",
            label: "Options",
            fieldConfig: {
                placeholder: "Add options",
            },
            isRequired: true
        },
        {
            name: "required",
            target: "rules",
            fieldType: "switch",
            label: "Required?"
        }
    ]
});
