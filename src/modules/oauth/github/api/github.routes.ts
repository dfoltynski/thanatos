import { Router } from "express";
import { validateSchema } from "../../../../shared/middlewares/zod/validate-schema";
import { authorizeGithubCode } from "./github.controller";
import { GithubOAuthPayloadSchema } from "./github.validators";

const githubOAuthRouter = Router();

githubOAuthRouter.post(
  "/",
  validateSchema(GithubOAuthPayloadSchema),
  authorizeGithubCode,
);

export default githubOAuthRouter;
