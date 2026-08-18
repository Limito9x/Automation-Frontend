import { z } from "zod";

export const createTagGroupSchema = z.object({
    name: z.string().min(1, "Group name is required").max(100),
    scope: z.string().min(1, "Scope is required"),
    projectId: z.string().min(1, "Project ID is required"),
});

export type CreateTagGroupInput = z.input<typeof createTagGroupSchema>;
export type CreateTagGroupOutput = z.output<typeof createTagGroupSchema>;
