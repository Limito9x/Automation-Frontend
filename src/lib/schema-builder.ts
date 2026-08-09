import { z } from "zod";
import type { FieldDefinition } from "./field-registry";
import { getFieldRegistration } from "./field-registry";

/**
 * Quét qua mảng FieldDefinition JSON và tự động gọi các hàm buildSchema
 * do từng Component định nghĩa để sinh ra Zod Schema hoàn chỉnh.
 */
export function buildDynamicSchema(fields: FieldDefinition<any, any>[]): z.ZodObject<any> {
    const shape: Record<string, z.ZodTypeAny> = {};

    for (const field of fields) {
        const registration = getFieldRegistration(field.type);
        
        let fieldSchema: z.ZodTypeAny;

        if (registration?.buildSchema) {
            const props = field.properties;
            fieldSchema = registration.buildSchema(props as any, field);
        } else {
            // Fallback an toàn nếu Component quên không khai báo buildSchema
            fieldSchema = z.any();
        }

        shape[field.name as string] = fieldSchema;
    }

    return z.object(shape);
}
