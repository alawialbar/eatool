import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createTechnologyComponentSchema,
  updateTechnologyComponentSchema,
} from "../schemas/technology-component";

export const technologyComponentsRouter = Router();

// GET / — List all with filtering, sorting, pagination
technologyComponentsRouter.get("/", async (req: Request, res: Response) => {
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
      prisma.technologyComponent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.technologyComponent.count({ where }),
    ]);

    res.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch technology components" });
  }
});

// GET /:id — Get by ID with relationships
technologyComponentsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entity = await prisma.technologyComponent.findUnique({
      where: { id },
      include: {
        relationsAsSource: true,
        relationsAsTarget: true,
      },
    });

    if (!entity) {
      res.status(404).json({ error: "Technology component not found" });
      return;
    }

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch technology component" });
  }
});

// POST / — Create
technologyComponentsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createTechnologyComponentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const entity = await prisma.technologyComponent.create({
      data: {
        name: data.name,
        type: data.type ?? undefined,
        version: data.version,
        vendor: data.vendor,
        endOfLifeDate: data.endOfLifeDate ? new Date(data.endOfLifeDate) : undefined,
        lifecycleStatus: data.lifecycleStatus ?? "active",
        owner: data.owner,
        entityScope: data.entityScope ?? [],
        tags: data.tags ?? [],
        lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : undefined,
      },
    });

    res.status(201).json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create technology component" });
  }
});

// PUT /:id — Update
technologyComponentsRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.technologyComponent.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Technology component not found" });
      return;
    }

    const parsed = updateTechnologyComponentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const updateData: any = { ...data };
    if (data.endOfLifeDate) {
      updateData.endOfLifeDate = new Date(data.endOfLifeDate);
    }
    if (data.lastReviewedAt) {
      updateData.lastReviewedAt = new Date(data.lastReviewedAt);
    }

    const entity = await prisma.technologyComponent.update({
      where: { id },
      data: updateData,
    });

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to update technology component" });
  }
});

// PATCH /:id/archive — Archive
technologyComponentsRouter.patch("/:id/archive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.technologyComponent.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Technology component not found" });
      return;
    }

    const entity = await prisma.technologyComponent.update({
      where: { id },
      data: { lifecycleStatus: "archived" },
    });

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to archive technology component" });
  }
});
