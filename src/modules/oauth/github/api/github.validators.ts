import * as z from "zod";

export const GithubOAuthPayloadSchema = z.object({
  code: z.string().nonempty(),
  redirect_uri: z.url().nonempty(),
});

export type GithubOAuthPayload = z.infer<typeof GithubOAuthPayloadSchema>;
