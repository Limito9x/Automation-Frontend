import { ApiCombobox, type ApiComboboxProps } from '@/components/custom-ui/inputs/combobox/ApiCombobox'
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
                    useOptions={rest.useOptions}
                />
            )}
        />
    )
}

export interface FormApiComboboxProperties {
    endpoint?: string;
    labelKey?: string;
    valueKey?: string;
    required?: boolean;
    requiredMsg?: string;
    placeholder?: string;
    disabled?: boolean;
    multiple?: boolean;
}

declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "relation": {
            properties: FormApiComboboxProperties,
            defaultValue: string
        }
    }
}

import { registerField } from '@/lib/field-registry';
import { z } from 'zod';
import { useContentTypes } from '@/features/contentTypes/hooks/useContentTypes';

registerField({
    type: "relation",
    component: FormApiCombobox,
    buildSchema: (p: FormApiComboboxProperties, field?: any) => {
        const reqMsg = p.requiredMsg || `${field?.label || field?.name || 'This field'} is required`;
        let s = p.multiple ? z.array(z.string()) : z.string({ message: reqMsg });
        if (p.required) s = s.min(1, reqMsg);
        if (!p.required) return s.optional().nullable();
        return s;
    },
    builderFields: [
        {
            name: "targetContentType",
            fieldType: "text",
            label: "Target Content Type",
            description: "Nhập ID hoặc mã của Content Type muốn liên kết"
        }
    ],
    resolveProps: (properties: FormApiComboboxProperties & { targetContentType?: string }) => {
        return {
            // Tạm thời fetch list content types để giả lập (mock) theo ý user
            useOptions: (search: string) => {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                const { data, isLoading } = useContentTypes({ globalKeyword: search, page: 1, pageSize: 10, projectId: "513305c8-4315-43a0-b292-73965017df26" });
                return {
                    data: data?.items?.map(ct => ({ label: ct.name || 'No Name', value: ct.id || '' })) || [],
                    isLoading
                };
            }
        };
    }
});
