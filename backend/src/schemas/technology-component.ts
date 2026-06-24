import { z } from "zod";

export const createTechnologyComponentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["database", "middleware", "runtime", "network", "cloudService"]).optional().nullable(),
  version: z.string().optional(),
  vendor: z.string().optional(),
  endOfLifeDate: z.string().datetime().optional().nullable(),
  lifecycleStatus: z.enum(["planned", "active", "phaseOut", "deprecated", "archived"]).optional(),
  owner: z.string().optional(),
  entityScope: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lastReviewedAt: z.string().datetime().optional().nullable(),
});

export const updateTechnologyComponentSchema = createTechnologyComponentSchema.partial();

export type CreateTechnologyComponentInput = z.infer<typeof createTechnologyComponentSchema>;
export type UpdateTechnologyComponentInput = z.infer<typeof updateTechnologyComponentSchema>;
