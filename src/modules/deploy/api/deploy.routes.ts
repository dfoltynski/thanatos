import { Router } from "express";
import { validateSchema } from "../../../shared/middlewares/zod/validate-schema";
import { deployBranch } from "./deploy.controllers";
import { DeployPayloadSchema } from "./deploy.validators";
import { authenticateUser } from "../../../shared/middlewares/auth/authenticate-user";

const deployRouter = Router();

deployRouter.post(
  "/",
  authenticateUser,
  validateSchema(DeployPayloadSchema),
  deployBranch,
);

export default deployRouter;
