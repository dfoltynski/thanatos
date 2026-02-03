import z from "zod";
import { NextFunction, Request, RequestHandler, Response } from "express";

export interface TypedRequest<T> extends Request {
  body: T;
}
export const validateSchema = <T extends z.ZodType>(
  schema: T,
): RequestHandler => {
  return (req: TypedRequest<T>, res: Response, next: NextFunction) => {
    try {
      const payload = req.body;
      schema.parse(payload);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json(error.issues);
      }
    }
  };
};
