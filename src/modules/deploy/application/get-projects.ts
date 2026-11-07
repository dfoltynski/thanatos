import { GithubApi } from "../infrastructure/github-api";
import { InfraError } from "../../../shared/errors/infra-error";

interface GithubRepository {
  name: string;
  full_name: string;
  url: string;
}

interface GetProjectsDependencies {
  githubApi: GithubApi;
}

export const getProjects = async (
  deps: GetProjectsDependencies = { githubApi: new GithubApi() },
) => {
  try {
    const response = await deps.githubApi.getRepositories();
    const repositories = response.data as GithubRepository[];

    return repositories.map(({ name, full_name, url }) => ({
      name,
      full_name,
      url,
    }));
  } catch (error: any) {
    throw new InfraError(error!.message, { status: error!.status });
  }
};
