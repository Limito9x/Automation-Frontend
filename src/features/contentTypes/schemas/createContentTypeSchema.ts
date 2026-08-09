import { z } from "zod";

export const fieldDefinitionSchema = z.object({
    name: z.string().min(1, "Key is required"),
    label: z.string().min(1, "Label is required"),
    type: z.string(),
    description: z.string().optional().nullable(),
    properties: z.any().optional(),
    defaultValue: z.any().optional(),
    config: z.any().optional(),
    rules: z.any().optional(),
});

export const createContentTypeSchema = z.object({
    projectId: z.string().min(1, "Project ID is required"),
    name: z.string().min(1, "Name is required").max(255),
    displayName: z.string().max(255).optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    color: z.string().max(50).optional().nullable(),
    sortOrder: z.number().int().default(0),
    displayConfig: z.any().default({}),
}).transform(data => ({
    ...data,
    displayName: data.displayName || data.name
}));

export type CreateContentTypeInput = z.input<typeof createContentTypeSchema>;
export type CreateContentTypeOutput = z.output<typeof createContentTypeSchema>;
export type FieldDefinitionInput = z.input<typeof fieldDefinitionSchema>;
