import { getFieldRegistration, type FieldDefinition } from "@/lib/field-registry";
import type { Control, FieldValues } from "react-hook-form";

export function DynamicField<T extends FieldValues>({
    control, field
}: { control: Control<T>; field: FieldDefinition<T> }) {
    const registration = getFieldRegistration(field.type as string)
    const Component = registration?.component

    if (!Component) {
        return <div className="text-destructive">Field type "{field.type as string}" is not registered.</div>
    }

    const resolvedExecutableProps = registration.resolveProps
        ? registration.resolveProps(field.properties)
        : {};

    const finalProps = {
        ...field.properties,
        ...resolvedExecutableProps
    };

    return (
        <Component
            control={control}
            name={field.name}
            label={field.label}
            description={field.description}
            isRequired={field.properties?.required}
            {...finalProps}
        />
    )
}