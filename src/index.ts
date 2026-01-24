import express, { Router } from "express";
import {
  defineEnvironmentVariables,
  SERVER_PORT,
} from "./environment-variables";
import { defineRoutes } from "./routes/index";

const app = express();

const routes = defineRoutes();

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

defineEnvironmentVariables();

app.listen(SERVER_PORT, () => {
  console.log(`Server is running at ${SERVER_PORT}`);
});
