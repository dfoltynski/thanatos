import { Router } from "express";
import { validateBodySchema } from "../../../shared/middlewares/zod/validate-body-schema";
import { deployBranch, listProjects } from "./deploy.controllers";
import { DeployPayloadSchema } from "./deploy.validators";
import { authenticateUser } from "../../../shared/middlewares/auth/authenticate-user";

const deployRouter = Router();

deployRouter.get("/projects", authenticateUser, listProjects);

deployRouter.post(
  "/",
  authenticateUser,
  validateBodySchema(DeployPayloadSchema),
  deployBranch,
);

export default deployRouter;
