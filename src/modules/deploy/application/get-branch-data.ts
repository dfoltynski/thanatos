import axios from "axios";
import { GithubApi } from "../infrastructure/github-api";
import { InfraError } from "../../../shared/errors/infra-error";
import { GithubCommit } from "../../../shared/types";

interface GetBranchDataInput {
  branch: string;
  repo: string;
}

interface GetBranchDataDependencies {
  githubApi: GithubApi;
}

interface GetBranchDataParams {
  getBranchDataInput: GetBranchDataInput;
  deps?: GetBranchDataDependencies;
}

export const getBranchData = async ({
  getBranchDataInput,
  deps = { githubApi: new GithubApi() },
}: GetBranchDataParams) => {
  try {
    const response = await deps.githubApi.getBranchData(getBranchDataInput);

    return response?.data as GithubCommit;
  } catch (error: any) {
    throw new InfraError(error!.message, { status: error!.status });
  }
};
