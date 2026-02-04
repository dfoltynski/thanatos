import { ErrorRequestHandler } from "express";
import z from "zod";
import { AppError } from "../errors/app-error";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof z.ZodError) {
    return res
      .status(400)
      .json({ error: "validation_error", details: err.issues });
  }
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ error: err.code ?? "app_error", message: err.message });
  }
  return res.status(500).json({ error: "internal_error" });
};
