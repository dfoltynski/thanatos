import { Response } from "express";
import { getDeployHistory } from "../application/get-deploy-history";
import { HistoryPayload } from "./history.validators";
import { TypedQueryRequest } from "../../../shared/middlewares/zod/validate-query-schema";
import { HistoryCursor } from "../infrastructure/history-database";

function decodeCursor(raw: unknown): HistoryCursor | null {
  if (!raw || typeof raw !== "string") return null;

  try {
    const json = Buffer.from(raw, "base64").toString("utf8");
    const obj = JSON.parse(json);

    if (typeof obj?.time !== "string") return null;
    if (typeof obj?.id !== "string" && typeof obj?.id !== "number") return null;

    return { time: obj.time, id: String(obj.id) };
  } catch {
    return null;
  }
}

function encodeCursor(cursor: HistoryCursor | null): string | null {
  if (!cursor) return null;
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64");
}

export const getHistory = async (
  req: TypedQueryRequest<HistoryPayload>,
  res: Response,
) => {
  const { environment, limit, cursor } = req.query;

  const decodedCursor = decodeCursor(cursor);

  const result = await getDeployHistory({
    environment,
    limit: Number(limit),
    cursor: decodedCursor,
  });

  res.json({
    history: result.history,
    nextCursor: encodeCursor(result.nextCursor),
    hasMore: result.hasMore,
  });
};
