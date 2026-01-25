import { Router } from "express";
import { validateDeployPayload } from "./validators";
import { deployBranch } from "./controllers";

const router = Router();

router.post("/", validateDeployPayload, deployBranch);

export default router;
