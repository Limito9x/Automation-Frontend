import { DynamicField } from "./DynamicField";
import type { Control, FieldValues } from "react-hook-form";
import type { FieldDefinition } from "@/lib/field-registry";

export interface FormRendererProps<T extends FieldValues> {
    control: Control<T>;
    fields: FieldDefinition<T>[];
}

export function FormRenderer<T extends FieldValues>({
    control,
    fields
}: FormRendererProps<T>) {
    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <DynamicField 
                    key={field.name} 
                    control={control} 
                    field={field}
                />
            ))}
        </div>
    )
}