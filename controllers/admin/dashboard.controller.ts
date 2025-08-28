import { Request, Response } from "express";

export const index = (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Dashboard API",
  });
};
