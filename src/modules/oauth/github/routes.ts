import { Router } from "express";
import { validateGithubOAuthPayload } from "./validators";
import { authorizeGithubCode } from "./controller";

const router = Router();

router.post("/", validateGithubOAuthPayload, authorizeGithubCode);

export default router;
