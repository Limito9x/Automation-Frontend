import { BaseFormField } from "./BaseFormField";
import { DateRangePicker, type DateRangePickerProps } from "../ui/date-range-picker";
import type { BaseFormControlProps, OmitFormProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormDateRangeProps<T extends FieldValues>
    extends BaseFormControlProps<T>,
    OmitFormProps<DateRangePickerProps> {}

export function FormDateRange<T extends FieldValues>({
    placeholder,
    className,
    disabled,
    ...rest
}: FormDateRangeProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <DateRangePicker
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
