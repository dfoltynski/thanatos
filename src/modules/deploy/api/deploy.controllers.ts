import { Response } from "express";
import { TypedRequest } from "../../../shared/middlewares/zod/validate-body-schema";
import { getBranchData } from "../application/get-branch-data";
import { DeployPayload } from "./deploy.validators";
import { addDeployHistory } from "../../history/application/get-deploy-history";

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
    await addDeployHistory({
      commitSha,
      environment,
      projectName,
      username,
    });

    res.status(200).json({ asd: "asdds" }); // WORK IN PROGRESS DUMMY RESPONSE
  } catch (error: any) {
    console.log(error);
    res.status(error.status).json({ message: error!.message });
  }
};
