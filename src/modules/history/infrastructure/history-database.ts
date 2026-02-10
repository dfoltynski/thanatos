import postgresClient from "../../../database";
import { Environment } from "../../../shared/types";

export interface HistoryData {
  environment: Environment;
  username: string;
  commitSha: string;
  projectName: string;
}

export class History {
  async getHistoryData(environment: string, page: number, limit: number) {
    const keyset = await postgresClient.query(
      `SELECT * FROM History ORDER BY id, time LIMIT $1`,
      [limit * page],
    );

    const lastItem = keyset.rows.at(-1);

    const history = await postgresClient.query(
      `SELECT * FROM History WHERE Environment = $1 AND (id, time) > ($2, $3) ORDER BY id, time LIMIT $4`,
      [environment, lastItem.id, lastItem.time, limit],
    );
    return history.rows;
  }

  async getHistoryLength(environment: string) {
    const length = await postgresClient.query(
      `SELECT COUNT(*) FROM History WHERE Environment = $1`,
      [environment],
    );
    return length.rows[0].count;
  }

  async addHistoryData(historyData: HistoryData) {
    const { commitSha, environment, username, projectName } = historyData;
    const query = `
            INSERT INTO History (Environment, Name, commitSha, ProjectName)
            VALUES ($1, $2, $3, $4)
            `;
    await postgresClient.query(query, [
      environment,
      username,
      commitSha,
      projectName,
    ]);
  }
}
