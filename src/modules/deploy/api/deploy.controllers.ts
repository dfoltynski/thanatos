import { Request, Response } from "express";
import { TypedRequest } from "../../../shared/middlewares/zod/validate-body-schema";
import { addDeployHistory } from "../../history/application/get-deploy-history";
import { getBranchData } from "../application/get-branch-data";
import { getProjects } from "../application/get-projects";
import { DeployPayload } from "./deploy.validators";
import { deploy } from "../jobs/deploy";

export const deployBranch = async (
  req: TypedRequest<DeployPayload>,
  res: Response,
) => {
  const { branchName, environment, projectName } = req.body;

  try {
    const response = await getBranchData({
      getBranchDataInput: {
        branch: branchName,
        repo: projectName,
      },
    });

    const username = response.commit.committer.login;
    const commitSha = response.commit.sha.slice(0, 7);
    const splittedProject =
      `${response.commit.committer.html_url}/${projectName}`.split("/");
    const projectWithOwner = [splittedProject[3], splittedProject[4]].join("/");

    await deploy(branchName, projectWithOwner, environment);

    await addDeployHistory({
      commitSha,
      environment,
      projectName,
      username,
    });

    res.status(200).json({ message: "success" });
  } catch (error: any) {
    console.error(error);

    // Deploy failures carry build output, which stays in the server logs.
    if (typeof error.status !== "number") {
      res.status(500).json({ message: "Deploy failed" });
      return;
    }

    res.status(error.status).json({ message: error.message });
  }
};

export const listProjects = async (_req: Request, res: Response) => {
  try {
    res.status(200).json(await getProjects());
  } catch (error: any) {
    console.error(error);
    res.status(error.status ?? 500).json({ message: error.message });
  }
};
