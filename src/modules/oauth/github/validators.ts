import { Request, Response, NextFunction } from "express";
import * as z from "zod";

const GithubOAuthPayload = z.object({
  code: z.string().min(0),
  redirect_uri: z.string().min(0),
});

export const validateGithubOAuthPayload = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = req.body;
    await GithubOAuthPayload.parseAsync(payload);

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json(error.issues);
    }
  }
};
