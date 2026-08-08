import { z } from "zod";

export const createContentTypeSchema = z.object({
    name: z.string().min(1),
});

export type CreateContentTypeInput = z.input<typeof createContentTypeSchema>;
export type CreateContentTypeOutput = z.output<typeof createContentTypeSchema>;
