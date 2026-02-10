import { Response } from "express";
import { getDeployHistory } from "../application/get-deploy-history";
import { HistoryPayload } from "./history.validators";
import { TypedQueryRequest } from "../../../shared/middlewares/zod/validate-query-schema";

export const getHistory = async (
  req: TypedQueryRequest<HistoryPayload>,
  res: Response,
) => {
  const { environment, page, limit } = req.query;
  const { history, count } = await getDeployHistory({
    environment,
    page: Number(page),
    limit: Number(limit),
  });

  res.json({ history, count });
};
