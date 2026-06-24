import { z } from "zod";

export const createIntegrationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sourceApplicationId: z.string().optional().nullable(),
  targetApplicationId: z.string().optional().nullable(),
  pattern: z.enum(["API", "ETL", "event", "file"]).optional().nullable(),
  protocol: z.enum(["REST", "SOAP", "Kafka", "SFTP", "other"]).optional().nullable(),
  dataClassification: z.enum(["public", "internal", "confidential", "restricted"]).optional().nullable(),
  owner: z.string().optional(),
  lifecycleStatus: z.enum(["planned", "active", "phaseOut", "deprecated", "archived"]).optional(),
  sla: z.string().optional(),
  entityScope: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  lastReviewedAt: z.string().datetime().optional().nullable(),
});

export const updateIntegrationSchema = createIntegrationSchema.partial();

export type CreateIntegrationInput = z.infer<typeof createIntegrationSchema>;
export type UpdateIntegrationInput = z.infer<typeof updateIntegrationSchema>;
