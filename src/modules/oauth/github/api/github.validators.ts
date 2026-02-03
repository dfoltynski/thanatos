import * as z from "zod";

export const GithubOAuthPayloadSchema = z.object({
  code: z.string().min(0),
  redirect_uri: z.string().min(0),
});

export type GithubOAuthPayload = z.infer<typeof GithubOAuthPayloadSchema>;
