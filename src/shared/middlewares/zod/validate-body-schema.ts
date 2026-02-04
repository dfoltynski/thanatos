import z from "zod";
import { NextFunction, Request, RequestHandler, Response } from "express";

export interface TypedRequest<T> extends Request {
  body: T;
}
export const validateBodySchema = <T extends z.ZodTypeAny>(
  schema: T,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json(result.error.issues);
      }
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(error.issues);
      }
    }
  };
};
