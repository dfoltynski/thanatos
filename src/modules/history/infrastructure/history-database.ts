import postgresClient from "../../../database";
import { Environment } from "../../../shared/types";

export interface HistoryData {
  environment: Environment;
  username: string;
  branchName: string;
  projectName: string;
}

export class History {
  async getHistoryData(environment: string) {
    const history = await postgresClient.query(
      `SELECT * FROM History WHERE Environment = $1`,
      [environment],
    );
    return history;
  }
  async addHistoryData(historyData: HistoryData) {
    const { branchName, environment, username, projectName } = historyData;
    const query = `
            INSERT INTO History (Environment, Name, Time, BranchName, ProjectName)
            VALUES ($1, $2, NOW(), $3, $4)
            `;
    await postgresClient.query(query, [
      environment,
      username,
      branchName,
      projectName,
    ]);
  }
}
