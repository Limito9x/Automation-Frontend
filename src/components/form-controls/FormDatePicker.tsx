import { BaseFormField } from "./BaseFormField";
import { DatePicker, type DatePickerProps } from "../ui/date-picker";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormDatePickerProps<T extends FieldValues>
    extends BaseFormControlProps<T>,
    OmitFormProps<DatePickerProps> {}

export function FormDatePicker<T extends FieldValues>({
    placeholder,
    className,
    disabled,
    ...rest
}: FormDatePickerProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={cn("w-full", className)}
                />
            )}
        />
    );
}
