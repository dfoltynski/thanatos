import * as z from "zod";

export const HistoryPayloadSchema = z.object({
  environment: z.enum(["preview", "staging"]),
});

export type HistoryPayload = z.infer<typeof HistoryPayloadSchema>;
