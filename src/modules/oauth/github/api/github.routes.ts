import { Router } from "express";
import { validateBodySchema } from "../../../../shared/middlewares/zod/validate-body-schema";
import { authorizeGithubCode } from "./github.controller";
import { GithubOAuthPayloadSchema } from "./github.validators";

const githubOAuthRouter = Router();

githubOAuthRouter.post(
  "/",
  validateBodySchema(GithubOAuthPayloadSchema),
  authorizeGithubCode,
);

export default githubOAuthRouter;
