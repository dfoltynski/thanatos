import { Request, Response, NextFunction } from "express";
import * as z from "zod";

const DeployPayload = z.object({
  branchName: z.string().min(0),
  projectName: z.string().min(0),
  environment: z.enum(["preview", "staging"]),
});

export const validateDeployPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;
    await DeployPayload.parseAsync(payload);

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(error.issues);
    }
  }
};
