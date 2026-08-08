import { z } from "zod";

export const updateContentTypeSchema = z.object({
    name: z.string().min(1),
});

export type UpdateContentTypeInput = z.input<typeof updateContentTypeSchema>;
export type UpdateContentTypeOutput = z.output<typeof updateContentTypeSchema>;
