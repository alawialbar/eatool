import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createIntegrationSchema,
  updateIntegrationSchema,
} from "../schemas/integration";

export const integrationsRouter = Router();

// GET / — List all with filtering, sorting, pagination
integrationsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const search = req.query.search as string | undefined;
    const lifecycleStatus = req.query.lifecycleStatus as string | undefined;
    const owner = req.query.owner as string | undefined;
    const entityScope = req.query.entityScope as string | undefined;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) === "asc" ? "asc" : "desc";

    const where: any = {};
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }
    if (lifecycleStatus) {
      where.lifecycleStatus = lifecycleStatus;
    }
    if (owner) {
      where.owner = { contains: owner, mode: "insensitive" };
    }
    if (entityScope) {
      where.entityScope = { has: entityScope };
    }

    const [data, total] = await Promise.all([
      prisma.integration.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.integration.count({ where }),
    ]);

    res.json({
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch integrations" });
  }
});

// GET /:id — Get by ID with relationships
integrationsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entity = await prisma.integration.findUnique({
      where: { id },
      include: {
        sourceApplication: true,
        targetApplication: true,
        relationsAsSource: true,
        relationsAsTarget: true,
      },
    });

    if (!entity) {
      res.status(404).json({ error: "Integration not found" });
      return;
    }

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch integration" });
  }
});

// POST / — Create
integrationsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createIntegrationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const entity = await prisma.integration.create({
      data: {
        name: data.name,
        sourceApplicationId: data.sourceApplicationId ?? undefined,
        targetApplicationId: data.targetApplicationId ?? undefined,
        pattern: data.pattern ?? undefined,
        protocol: data.protocol ?? undefined,
        dataClassification: data.dataClassification ?? undefined,
        owner: data.owner,
        lifecycleStatus: data.lifecycleStatus ?? "active",
        sla: data.sla,
        entityScope: data.entityScope ?? [],
        tags: data.tags ?? [],
        lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : undefined,
      },
    });

    res.status(201).json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create integration" });
  }
});

// PUT /:id — Update
integrationsRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.integration.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Integration not found" });
      return;
    }

    const parsed = updateIntegrationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const updateData: any = { ...data };
    if (data.lastReviewedAt) {
      updateData.lastReviewedAt = new Date(data.lastReviewedAt);
    }

    const entity = await prisma.integration.update({
      where: { id },
      data: updateData,
    });

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to update integration" });
  }
});

// PATCH /:id/archive — Archive
integrationsRouter.patch("/:id/archive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.integration.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Integration not found" });
      return;
    }

    const entity = await prisma.integration.update({
      where: { id },
      data: { lifecycleStatus: "archived" },
    });

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to archive integration" });
  }
});
