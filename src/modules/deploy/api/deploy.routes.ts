import { Router } from "express";
import { validateBodySchema } from "../../../shared/middlewares/zod/validate-body-schema";
import { deployBranch } from "./deploy.controllers";
import { DeployPayloadSchema } from "./deploy.validators";
import { authenticateUser } from "../../../shared/middlewares/auth/authenticate-user";

const deployRouter = Router();

deployRouter.post(
  "/",
  authenticateUser,
  validateBodySchema(DeployPayloadSchema),
  deployBranch,
);

export default deployRouter;
