import { BaseFormField } from "./BaseFormField";
import { Input } from "../ui/input";
import type { BaseFormControlProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface FormColorPickerProps<T extends FieldValues>
    extends BaseFormControlProps<T> {
    className?: string;
    disabled?: boolean;
}

export function FormColorPicker<T extends FieldValues>({
    className,
    disabled,
    ...rest
}: FormColorPickerProps<T>) {
    return (
        <BaseFormField
            {...rest}
            render={(field) => (
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 overflow-hidden rounded-md border shadow-sm shrink-0">
                        <input
                            type="color"
                            id={field.field_id}
                            name={field.input_name}
                            value={field.value || "#000000"}
                            onChange={field.onChange}
                            disabled={disabled}
                            className={cn("absolute -top-2 -left-2 w-14 h-14 cursor-pointer", className)}
                        />
                    </div>
                    <Input
                        type="text"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="#000000"
                        disabled={disabled}
                        className="font-mono"
                    />
                </div>
            )}
        />
    );
}
