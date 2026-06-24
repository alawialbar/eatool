import { Router, Request, Response } from "express";

export const authRouter = Router();

authRouter.get("/me", (req: Request, res: Response) => {
  res.json({ user: req.user });
});
