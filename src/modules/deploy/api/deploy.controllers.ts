import { Response } from "express";
import { TypedRequest } from "../../../shared/middlewares/zod/validate-body-schema";
import { addDeployHistory } from "../../history/application/get-deploy-history";
import { getBranchData } from "../application/get-branch-data";
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
    console.log(error);
    res.status(error.status).json({ message: error!.message });
  }
};
