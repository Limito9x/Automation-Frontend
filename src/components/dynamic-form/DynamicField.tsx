import { fieldRegistry, type FieldDefinition } from "@/lib/field-registry";
import type { Control, FieldValues } from "react-hook-form";

export function DynamicField<T extends FieldValues>({
    control, field
}: { control: Control<T>; field: FieldDefinition<T> }) {
    const Component = fieldRegistry[field.type]

    return (
        <Component
            control={control}
            name={field.name}
            label={field.label}
            description={field.description}
            {...field.config}
        />
    )
}