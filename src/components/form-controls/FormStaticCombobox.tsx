import { StaticCombobox, type StaticComboboxProps } from '@/components/custom-ui/inputs/combobox/StaticCombobox'
import { BaseFormField } from './BaseFormField'
import type { BaseFormControlProps } from './type'
import type { FieldValues } from 'react-hook-form'

export interface FormStaticComboboxProps<TFieldValues extends FieldValues, TValue = any>
    extends BaseFormControlProps<TFieldValues>,
    Omit<StaticComboboxProps<TValue>, 'value' | 'onValueChange'> {
}

/**
 * FormStaticCombobox
 * Form Adapter cho StaticCombobox. Chỉ làm nhiệm vụ gắn kết StaticCombobox vào react-hook-form.
 */
export function FormStaticCombobox<TFieldValues extends FieldValues, TValue = any>({
    ...rest
}: FormStaticComboboxProps<TFieldValues, TValue>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <StaticCombobox
                    {...rest}
                    id={field.field_id}
                    value={field.value}
                    onValueChange={field.onChange}
                />
            )}
        />
    )
}
