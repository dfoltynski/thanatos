import { Router } from "express";
import { authenticateUser } from "../../../shared/middlewares/auth/authenticate-user";
import { validateQuerySchema } from "../../../shared/middlewares/zod/validate-query-schema";
import { getHistory } from "./history.controller";
import { HistoryPayloadSchema } from "./history.validators";

const historyRouter = Router();

historyRouter.get(
  "/",
  authenticateUser,
  validateQuerySchema(HistoryPayloadSchema),
  getHistory,
);

export default historyRouter;
