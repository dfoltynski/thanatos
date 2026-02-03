import { Environment } from "../../../shared/types";
import { History, HistoryData } from "../infrastructure/history-database";

interface GetDeployHistoryDependencies {
  historyDb: History;
}

interface GetDeployHistoryParams {
  environment: Environment;
  deps?: GetDeployHistoryDependencies;
}

export const getDeployHistory = async ({
  environment,
  deps = { historyDb: new History() },
}: GetDeployHistoryParams) => {
  const { historyDb } = deps;
  const history = await historyDb.getHistoryData(environment);
  return history.rows as HistoryData[];
};

interface AddDeployHistoryParams {
  environment: Environment;
  username: string;
  branchName: string;
  projectName: string;
  deps?: GetDeployHistoryDependencies;
}

export const addDeployHistory = async ({
  branchName,
  environment,
  projectName,
  username,
  deps = { historyDb: new History() },
}: AddDeployHistoryParams) => {
  const { historyDb } = deps;
  await historyDb.addHistoryData({
    branchName,
    environment,
    projectName,
    username,
  });
};
