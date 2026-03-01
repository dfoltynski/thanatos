import { Environment } from "../../../shared/types";
import {
  History,
  HistoryCursor,
  HistoryData,
} from "../infrastructure/history-database";

interface GetDeployHistoryDependencies {
  historyDb: History;
}

interface GetDeployHistoryParams {
  environment: Environment;
  limit: number;
  cursor?: HistoryCursor | null;
  deps?: GetDeployHistoryDependencies;
}
export const getDeployHistory = async ({
  environment,
  limit,
  cursor,
  deps = { historyDb: new History() },
}: GetDeployHistoryParams) => {
  return deps.historyDb.getHistoryData(environment, limit, cursor);
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
