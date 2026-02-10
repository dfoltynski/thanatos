import { Environment } from "../../../shared/types";
import { History, HistoryData } from "../infrastructure/history-database";

interface GetDeployHistoryDependencies {
  historyDb: History;
}

interface GetDeployHistoryParams {
  environment: Environment;
  page: number;
  limit: number;
  deps?: GetDeployHistoryDependencies;
}

export const getDeployHistory = async ({
  environment,
  limit,
  page,
  deps = { historyDb: new History() },
}: GetDeployHistoryParams) => {
  const history = await deps.historyDb.getHistoryData(environment, page, limit);
  const count = await deps.historyDb.getHistoryLength(environment);

  return { history: history as HistoryData[], count };
};

interface AddDeployHistoryParams {
  environment: Environment;
  username: string;
  commitSha: string;
  projectName: string;
  deps?: GetDeployHistoryDependencies;
}

export const addDeployHistory = async ({
  commitSha,
  environment,
  projectName,
  username,
  deps = { historyDb: new History() },
}: AddDeployHistoryParams) => {
  await deps.historyDb.addHistoryData({
    commitSha,
    environment,
    projectName,
    username,
  });
};
