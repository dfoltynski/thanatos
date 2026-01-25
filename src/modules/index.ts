import type { Router } from "express";
import { default as deployRouter } from "./users/deploy/routes";
import { default as githubOAuthRouter } from "./oauth/github/routes";

type AppRoute = {
  path: string;
  router: Router;
};
export const defineRoutes = (): AppRoute[] => {
  return [
    { path: "/users/deploy", router: deployRouter },
    { path: "/github/oauth/authorize", router: githubOAuthRouter },
  ];
};
