import * as z from "zod";

export const DeployPayloadSchema = z.object({
  branchName: z.string().min(0),
  projectName: z.string().min(0),
  environment: z.enum(["preview", "staging"]),
});

export type DeployPayload = z.infer<typeof DeployPayloadSchema>;
