import axios, { AxiosError } from "axios";
import { GITHUB_API_URL } from "../../../shared/constants";
import {
  GITHUB_ORGANIZATION_NAME,
  GITHUB_TOKEN,
} from "../../../environment-variables";
import { InfraError } from "../../../shared/errors/infra-error";

interface GetBranchDataParams {
  branch: string;
  repo: string;
}

export class GithubApi {
  async call(path: string) {
    const response = await axios(`${GITHUB_API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    return response;
  }

  async getRepositories() {
    try {
      const owner = GITHUB_ORGANIZATION_NAME;
      const repositories = await this.call(`/users/${owner}/repos`);

      return repositories;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new InfraError(error.response!.statusText, {
          status: error.response!.status,
        });
      }

      throw new InfraError("Unexpected infrastructure error", {
        status: 500,
      });
    }
  }

  async getBranchData({ branch, repo }: GetBranchDataParams) {
    try {
      const owner = GITHUB_ORGANIZATION_NAME;
      const branchData = await this.call(
        `/repos/${owner}/${repo}/branches/${branch}`,
      );

      return branchData;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new InfraError(error.response!.statusText, {
          status: error.response!.status,
        });
      }

      throw new InfraError("Unexpected infrastructure error", {
        status: 500,
      });
    }
  }
}
