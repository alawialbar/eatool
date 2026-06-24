import { z } from "zod";

export const createDataObjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  classification: z.enum(["public", "internal", "confidential", "restricted"]).optional(),
  owningApplication: z.string().optional(),
  owningCapability: z.string().optional(),
  residencyCountry: z.string().optional(),
  regulatoryFlag: z.enum(["GDPR", "SAMA", "PDPL", "FRA", "other"]).optional().nullable(),
  lifecycleStatus: z.enum(["planned", "active", "phaseOut", "deprecated", "archived"]).optional(),
  owner: z.string().optional(),
  entityScope: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lastReviewedAt: z.string().datetime().optional().nullable(),
});

export const updateDataObjectSchema = createDataObjectSchema.partial();

export type CreateDataObjectInput = z.infer<typeof createDataObjectSchema>;
export type UpdateDataObjectInput = z.infer<typeof updateDataObjectSchema>;
