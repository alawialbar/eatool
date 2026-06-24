import { z } from "zod";

export const createBusinessCapabilitySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  level: z.enum(["L1", "L2", "L3"]),
  owner: z.string().optional(),
  entityScope: z.array(z.string()).optional(),
  lifecycleStatus: z.enum(["planned", "active", "phaseOut", "deprecated", "archived"]).optional(),
  tags: z.array(z.string()).optional(),
  lastReviewedAt: z.string().datetime().optional().nullable(),
});

export const updateBusinessCapabilitySchema = createBusinessCapabilitySchema.partial();

export type CreateBusinessCapabilityInput = z.infer<typeof createBusinessCapabilitySchema>;
export type UpdateBusinessCapabilityInput = z.infer<typeof updateBusinessCapabilitySchema>;
