import postgresClient from "../../../database";
import { Environment } from "../../../shared/types";

export interface HistoryData {
  environment: Environment;
  username: string;
  commitSha: string;
  projectName: string;
}

export type HistoryRow = {
  id: string;
  environment: string;
  name: string | null;
  time: string;
  commitsha: string | null;
  projectname: string | null;
};

export type HistoryCursor = {
  time: string;
  id: string;
};

export type HistoryResponse = {
  history: HistoryRow[];
  nextCursor: HistoryCursor | null;
  hasMore: boolean;
};

const MAX_LIMIT = 50;

function clampLimit(limit: unknown) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n <= 0) return 10;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

export class History {
  async getHistoryData(
    environment: string,
    limit: unknown,
    cursor?: HistoryCursor | null,
  ): Promise<HistoryResponse> {
    const safeLimit = clampLimit(limit);

    const params: any[] = [environment, safeLimit];
    let cursorSql = "";

    if (cursor?.time && cursor?.id) {
      params.push(cursor.time, cursor.id);
      cursorSql = `AND (time, id) < ($3::timestamptz, $4::bigint)`;
    }

    const result = await postgresClient.query(
      `
      SELECT
        id::text          AS id,
        environment::text AS environment,
        name,
        time::text        AS time,
        commitsha,
        projectname
      FROM history
      WHERE environment = $1
        ${cursorSql}
      ORDER BY time DESC, id DESC
      LIMIT $2
      `,
      params,
    );

    const rows = result.rows as HistoryRow[];
    const last = rows.at(-1);

    const nextCursor =
      last?.time && last?.id
        ? ({ time: String(last.time), id: String(last.id) } as HistoryCursor)
        : null;

    return {
      history: rows,
      nextCursor,
      hasMore: rows.length === safeLimit,
    };
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
