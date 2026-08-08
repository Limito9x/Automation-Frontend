import { getFieldRegistry, type FieldDefinition } from "@/lib/field-registry";
import type { Control, FieldValues } from "react-hook-form";

export function DynamicField<T extends FieldValues>({
    control, field
}: { control: Control<T>; field: FieldDefinition<T> }) {
    const registry = getFieldRegistry()
    const Component = registry.get(field.type as string)

    if (!Component) {
        return <div className="text-destructive">Field type "{field.type as string}" is not registered.</div>
    }

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