import type { Router } from "express";
import deployRouter from "./deploy/api/deploy.routes";
import githubOAuthRouter from "./oauth/github/api/github.routes";
import historyRouter from "./history/api/history.routes";

type AppRoute = {
  path: string;
  router: Router;
};

export const defineRoutes = (): AppRoute[] => {
  return [
    { path: "/deploy", router: deployRouter },
    { path: "/github/oauth/authorize", router: githubOAuthRouter },
    { path: "/history", router: historyRouter },
  ];
};
