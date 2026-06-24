import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import {
  createDataObjectSchema,
  updateDataObjectSchema,
} from "../schemas/data-object";

export const dataObjectsRouter = Router();

// GET / — List all with filtering, sorting, pagination
dataObjectsRouter.get("/", async (req: Request, res: Response) => {
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
      prisma.dataObject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.dataObject.count({ where }),
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
    res.status(500).json({ error: "Failed to fetch data objects" });
  }
});

// GET /:id — Get by ID with relationships
dataObjectsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entity = await prisma.dataObject.findUnique({
      where: { id },
      include: {
        relationsAsSource: true,
        relationsAsTarget: true,
      },
    });

    if (!entity) {
      res.status(404).json({ error: "Data object not found" });
      return;
    }

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data object" });
  }
});

// POST / — Create
dataObjectsRouter.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = createDataObjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const entity = await prisma.dataObject.create({
      data: {
        name: data.name,
        description: data.description,
        classification: data.classification ?? "internal",
        owningApplication: data.owningApplication,
        owningCapability: data.owningCapability,
        residencyCountry: data.residencyCountry,
        regulatoryFlag: data.regulatoryFlag ?? undefined,
        lifecycleStatus: data.lifecycleStatus ?? "active",
        owner: data.owner,
        entityScope: data.entityScope ?? [],
        tags: data.tags ?? [],
        lastReviewedAt: data.lastReviewedAt ? new Date(data.lastReviewedAt) : undefined,
      },
    });

    res.status(201).json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to create data object" });
  }
});

// PUT /:id — Update
dataObjectsRouter.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.dataObject.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Data object not found" });
      return;
    }

    const parsed = updateDataObjectSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const updateData: any = { ...data };
    if (data.lastReviewedAt) {
      updateData.lastReviewedAt = new Date(data.lastReviewedAt);
    }

    const entity = await prisma.dataObject.update({
      where: { id },
      data: updateData,
    });

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to update data object" });
  }
});

// PATCH /:id/archive — Archive
dataObjectsRouter.patch("/:id/archive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.dataObject.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: "Data object not found" });
      return;
    }

    const entity = await prisma.dataObject.update({
      where: { id },
      data: { lifecycleStatus: "archived" },
    });

    res.json(entity);
  } catch (error) {
    res.status(500).json({ error: "Failed to archive data object" });
  }
});
