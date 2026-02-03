import { Router } from "express";
import { authenticateUser } from "../../../shared/middlewares/auth/authenticate-user";
import { getHistory } from "./history.controller";
import { validateSchema } from "../../../shared/middlewares/zod/validate-schema";
import { HistoryPayloadSchema } from "./history.validators";

const historyRouter = Router();

historyRouter.get(
  "/",
  authenticateUser,
  validateSchema(HistoryPayloadSchema),
  getHistory,
);

export default historyRouter;
