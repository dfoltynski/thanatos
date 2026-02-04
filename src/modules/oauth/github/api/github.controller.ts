import axios from "axios";
import { Request, Response } from "express";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} from "../../../../environment-variables";
import { TypedRequest } from "../../../../shared/middlewares/zod/validate-body-schema";
import { GithubOAuthPayload } from "./github.validators";

export const authorizeGithubCode = async (
  req: TypedRequest<GithubOAuthPayload>,
  res: Response,
) => {
  const { code, redirect_uri } = req.body;
  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri,
      },
      {
        headers: { Accept: "application/json" },
      },
    );

    const tokenJson = tokenRes.data as {
      access_token?: string;
      token_type?: string;
      scope?: string;
      error?: string;
      error_description?: string;
    };

    if (!tokenJson.access_token) {
      return res
        .status(401)
        .json({ error: "github_exchange_failed", details: tokenJson });
    }

    return res.status(200).json({
      access_token: tokenJson.access_token,
      token_type: tokenJson.token_type,
    });
  } catch (e: any) {
    return res.status(500).json({
      error: "github_exchange_error",
      details: e?.response?.data ?? String(e),
    });
  }
};
