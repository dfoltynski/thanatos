import { Response } from "express";
import { TypedRequest } from "../../../shared/middlewares/zod/validate-schema";
import { HistoryPayload } from "./history.validators";
import { getDeployHistory } from "../application/get-deploy-history";

export const getHistory = async (
  req: TypedRequest<HistoryPayload>,
  res: Response,
) => {
  const { environment } = req.body;
  const history = await getDeployHistory({ environment });

  res.json({ history });
};
