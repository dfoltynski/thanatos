import { Response } from "express";
import { getDeployHistory } from "../application/get-deploy-history";
import { HistoryPayload } from "./history.validators";
import { TypedQueryRequest } from "../../../shared/middlewares/zod/validate-query-schema";

export const getHistory = async (
  req: TypedQueryRequest<HistoryPayload>,
  res: Response,
) => {
  const { environment } = req.query;
  const history = await getDeployHistory({ environment });

  res.json({ history });
};
