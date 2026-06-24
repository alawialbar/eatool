import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { createRelationshipSchema } from "../schemas/relationship";

export const relationshipsRouter = Router();

// GET / — List relationships with filtering
relationshipsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const sourceType = req.query.sourceType as string | undefined;
    const targetType = req.query.targetType as string | undefined;
    const sourceId = req.query.sourceId as string | undefined;
    const targetId = req.query.targetId as string | undefined;

    const where: any = {};
    if (sourceType) {
      where.sourceType = sourceType;
    }
    if (targetType) {
      where.targetType = targetType;
    }
    if (sourceId) {
      where.OR = [
        { sourceBusinessCapabilityId: sourceId },
        { sourceApplicationId: sourceId },
        { sourceTechnologyComponentId: sourceId },
        { sourceDataObjectId: sourceId },
        { sourceIntegrationId: sourceId },
      ];
    }
    if (targetId) {
      const targetConditions = [
        { targetBusinessCapabilityId: targetId },
        { targetApplicationId: targetId },
        { targetTechnologyComponentId: targetId },
        { targetDataObjectId: targetId },
        { targetIntegrationId: targetId },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: targetConditions }];
        delete where.OR;
      } else {
        where.OR = targetConditions;
      }
    }

    const data = await prisma.relationship.findMany({ where });
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch relationships" });
  }
});

// POST / — Create relationship
relationshipsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createRelationshipSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const entity = await prisma.relationship.create({
      data: parsed.data,
    });

    res.status(201).json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create relationship" });
  }
});

// DELETE /:id — Delete relationship
relationshipsRouter.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.relationship.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Relationship not found" });
      return;
    }

    await prisma.relationship.delete({ where: { id } });
    res.status(200).json({ message: "Relationship deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete relationship" });
  }
});
