import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerField, type ExtractConfig } from "@/lib/field-registry";
import { BaseFormField } from "./BaseFormField";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";

// Derive Select props directly from the component — no phantom types
type SelectRootProps = React.ComponentProps<typeof Select>;

// ─── Shared option shape ──────────────────────────────────────────────────────
// Mirrors backend OptionItem { value: string, label: string }
export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

// ─── FormSelect (static options) ─────────────────────────────────────────────
export interface FormSelectProps<T extends FieldValues>
    extends BaseFormControlProps<T>,
    OmitFormProps<Omit<SelectRootProps, "autoComplete" | "className">> {
    options: SelectOption[];
}

export function FormSelect<T extends FieldValues>({ options, ...rest }: FormSelectProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <Select
                    selectedKey={field.value?.toString() || null}
                    onSelectionChange={field.onChange}
                    isDisabled={field.disabled}
                >
                    <SelectTrigger id={field.field_id}>
                        <SelectValue>
                            {({ selectedText }) => selectedText || rest.placeholder}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem
                                key={option.value}
                                id={option.value}
                                isDisabled={option.disabled}
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}
        />
    );
}


declare module "@/lib/field-registry" {
    interface GlobalFieldRegistry {
        "select": ExtractConfig<FormSelectProps<any>>
    }
}
registerField({
    type: "select",
    component: FormSelect
});
