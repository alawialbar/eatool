import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { authRouter } from "./auth";
import { businessCapabilitiesRouter } from "./business-capabilities";
import { applicationsRouter } from "./applications";
import { technologyComponentsRouter } from "./technology-components";
import { dataObjectsRouter } from "./data-objects";
import { integrationsRouter } from "./integrations";
import { relationshipsRouter } from "./relationships";
import { searchRouter } from "./search";

export const router = Router();

// Apply authentication to all routes under /api
router.use(requireAuth);

router.use("/auth", authRouter);
router.use("/business-capabilities", businessCapabilitiesRouter);
router.use("/applications", applicationsRouter);
router.use("/technology-components", technologyComponentsRouter);
router.use("/data-objects", dataObjectsRouter);
router.use("/integrations", integrationsRouter);
router.use("/relationships", relationshipsRouter);
router.use("/search", searchRouter);
