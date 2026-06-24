import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const searchRouter = Router();

// GET / — Global search across all Fact Sheet types by name
searchRouter.get("/", async (req: Request, res: Response) => {
  try {
    const q = req.query.q as string | undefined;

    if (!q || q.trim().length === 0) {
      res.status(400).json({ error: "Query parameter 'q' is required" });
      return;
    }

    const searchFilter = { contains: q, mode: "insensitive" as const };

    const [
      businessCapabilities,
      applications,
      technologyComponents,
      dataObjects,
      integrations,
    ] = await Promise.all([
      prisma.businessCapability.findMany({
        where: { name: searchFilter },
        select: { id: true, name: true, lifecycleStatus: true },
      }),
      prisma.application.findMany({
        where: { name: searchFilter },
        select: { id: true, name: true, lifecycleStatus: true },
      }),
      prisma.technologyComponent.findMany({
        where: { name: searchFilter },
        select: { id: true, name: true, lifecycleStatus: true },
      }),
      prisma.dataObject.findMany({
        where: { name: searchFilter },
        select: { id: true, name: true, lifecycleStatus: true },
      }),
      prisma.integration.findMany({
        where: { name: searchFilter },
        select: { id: true, name: true, lifecycleStatus: true },
      }),
    ]);

    const results = {
      BusinessCapability: businessCapabilities.map((item) => ({
        ...item,
        entityType: "BusinessCapability",
      })),
      Application: applications.map((item) => ({
        ...item,
        entityType: "Application",
      })),
      TechnologyComponent: technologyComponents.map((item) => ({
        ...item,
        entityType: "TechnologyComponent",
      })),
      DataObject: dataObjects.map((item) => ({
        ...item,
        entityType: "DataObject",
      })),
      Integration: integrations.map((item) => ({
        ...item,
        entityType: "Integration",
      })),
    };

    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});
