import { DynamicField } from "./DynamicField";
import type { Control, FieldValues } from "react-hook-form";
import type { FieldDefinition, ScopedFieldRegistry } from "@/lib/field-registry";

export interface FormRendererProps<T extends FieldValues> {
    control: Control<T>;
    fields: FieldDefinition<T>[];
    context?: Record<string, any>;
    registry?: ScopedFieldRegistry;
}

export function FormRenderer<T extends FieldValues>({
    control,
    fields,
    context,
    registry,
}: FormRendererProps<T>) {
    return (
        <div className="space-y-4">
            {fields.map((field) => (
                <DynamicField
                    key={field.name}
                    control={control}
                    field={field}
                    context={context}
                    registry={registry}
                />
            ))}
        </div>
    );
}