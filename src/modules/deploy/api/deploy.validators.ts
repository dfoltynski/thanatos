import * as z from "zod";

export const DeployPayloadSchema = z.object({
  branchName: z.string().nonempty(),
  projectName: z.string().nonempty(),
  environment: z.enum(["preview", "staging"]),
});

export type DeployPayload = z.infer<typeof DeployPayloadSchema>;
