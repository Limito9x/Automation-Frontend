import { ApiCombobox, type ApiComboboxProps } from '@/components/custom-ui/inputs/combobox/ApiCombobox'
import { registerField, type ExtractConfig } from "@/lib/field-registry";
import { BaseFormField } from './BaseFormField'
import type { BaseFormControlProps } from './type'
import type { FieldValues } from 'react-hook-form'

export interface FormApiComboboxProps<TFieldValues extends FieldValues, TValue = any>
    extends BaseFormControlProps<TFieldValues>,
    Omit<ApiComboboxProps<TValue>, 'value' | 'onValueChange'> {
}

/**
 * FormApiCombobox
 * Form Adapter cho ApiCombobox. Chỉ làm nhiệm vụ gắn kết ApiCombobox vào react-hook-form.
 */
export function FormApiCombobox<TFieldValues extends FieldValues, TValue = any>({
    ...rest
}: FormApiComboboxProps<TFieldValues, TValue>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <ApiCombobox
                    {...rest}
                    id={field.field_id}
                    value={field.value}
                    onValueChange={field.onChange}
                />
            )}
        />
    )
}



declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "combobox": ExtractConfig<FormApiComboboxProps<any, any>>
    }
}
registerField({
    type: "combobox",
    component: FormApiCombobox
});
