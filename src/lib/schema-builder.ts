import { z } from "zod";
import type { FieldDefinition, ScopedFieldRegistry } from "./field-registry";
import { getFieldRegistration } from "./field-registry";

/**
 * Quét qua mảng FieldDefinition JSON và tự động gọi các hàm buildSchema
 * do từng Component định nghĩa để sinh ra Zod Schema hoàn chỉnh.
 * Hỗ trợ ScopedFieldRegistry để lookup chính xác các control theo scope.
 */
export function buildDynamicSchema(
    fields: FieldDefinition<any, any>[],
    registry?: ScopedFieldRegistry
): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
        const registration = registry
            ? registry.get(field.type as string)
            : getFieldRegistration(field.type as string);

        let fieldSchema: z.ZodTypeAny;

        if (registration?.buildSchema) {
            const props = field.properties;
            fieldSchema = registration.buildSchema(props as any, field);
        } else {
            // Fallback an toàn nếu Component quên không khai báo buildSchema
            const isReq =
                field.properties?.required === true ||
                field.rules?.required === true;

            const reqMsg = `${field.label || field.name} is required`;

            if (isReq) {
                fieldSchema = z.any().refine(
                    (val) =>
                        val !== undefined &&
                        val !== null &&
                        val !== "" &&
                        (!Array.isArray(val) || val.length > 0),
                    { message: reqMsg }
                );
            } else {
                fieldSchema = z.any().optional().nullable();
            }
        }

        shape[field.name as string] = fieldSchema;
    }

    return z.object(shape);
}

