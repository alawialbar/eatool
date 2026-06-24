import { z } from "zod";

const entityTypeEnum = z.enum([
  "BusinessCapability",
  "Application",
  "TechnologyComponent",
  "DataObject",
  "Integration",
]);

export const createRelationshipSchema = z.object({
  sourceType: entityTypeEnum,
  targetType: entityTypeEnum,
  relationshipLabel: z.string().optional(),
  sourceBusinessCapabilityId: z.string().optional().nullable(),
  sourceApplicationId: z.string().optional().nullable(),
  sourceTechnologyComponentId: z.string().optional().nullable(),
  sourceDataObjectId: z.string().optional().nullable(),
  sourceIntegrationId: z.string().optional().nullable(),
  targetBusinessCapabilityId: z.string().optional().nullable(),
  targetApplicationId: z.string().optional().nullable(),
  targetTechnologyComponentId: z.string().optional().nullable(),
  targetDataObjectId: z.string().optional().nullable(),
  targetIntegrationId: z.string().optional().nullable(),
});

export type CreateRelationshipInput = z.infer<typeof createRelationshipSchema>;
