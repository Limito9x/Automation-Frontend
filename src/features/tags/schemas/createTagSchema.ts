import { z } from "zod";

export const createTagSchema = z.object({
    name: z.string().min(1, "Tag name is required").max(100),
    color: z.string().optional().default("#3b82f6"),
    tagGroupId: z.string().min(1, "Tag group ID is required"),
});

export type CreateTagInput = z.input<typeof createTagSchema>;
export type CreateTagOutput = z.output<typeof createTagSchema>;
