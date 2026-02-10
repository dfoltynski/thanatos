import * as z from "zod";

export const validParsedQsNumber = z.string().refine((value) => {
  if (isNaN(Number(value))) {
    return false;
  }

  if (Number(value) < 1) {
    return false;
  }

  return true;
});

export const HistoryPayloadSchema = z.object({
  environment: z.enum(["preview", "staging"]),
  page: validParsedQsNumber,
  limit: validParsedQsNumber,
});

export type HistoryPayload = z.infer<typeof HistoryPayloadSchema>;
