import { NextFunction, Request, RequestHandler, Response } from "express";
import z from "zod";

export interface TypedQueryRequest<T> extends Request<any, any, any, T> {
  query: T;
}

export const validateQuerySchema = <T extends z.ZodTypeAny>(
  schema: T,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req.query);
      if (!result.success) {
        return res.status(400).json(result.error.issues);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
