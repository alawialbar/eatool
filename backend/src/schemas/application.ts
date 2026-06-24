import { z } from "zod";

export const createApplicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  vendor: z.string().optional(),
  deploymentType: z.enum(["SaaS", "OnPrem", "CloudHosted"]).optional().nullable(),
  businessCriticality: z.enum(["missionCritical", "businessCritical", "standard", "low"]).optional(),
  lifecycleStatus: z.enum(["planned", "active", "phaseOut", "deprecated", "archived"]).optional(),
  hostingCountry: z.string().optional(),
  owner: z.string().optional(),
  contractRenewalDate: z.string().datetime().optional().nullable(),
  entityScope: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lastReviewedAt: z.string().datetime().optional().nullable(),
});

export const updateApplicationSchema = createApplicationSchema.partial();

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
