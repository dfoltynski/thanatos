import type { Router } from "express";
import { router as deployRouter } from "./users/deploy";

type AppRoute = {
  path: string;
  router: Router;
};

export const defineRoutes = (): AppRoute[] => {
  return [{ path: "/users/deploy", router: deployRouter }];
};
