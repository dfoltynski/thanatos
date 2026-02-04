import express from "express";
import {
  defineEnvironmentVariables,
  SERVER_PORT,
} from "./environment-variables";
import { defineRoutes } from "./modules/index";
import cors from "cors";
import postgresClient from "./database";
import { errorHandler } from "./shared/middlewares/error-handler";

defineEnvironmentVariables();

const app = express();

const routes = defineRoutes();

app.use(
  cors({
    origin: "https://app.charon.com",
    credentials: true,
  }),
);

app.use(express.json());

routes.forEach(({ path, router }) => {
  app.use(path, router);
});

app.set("trust proxy", 1);

app.get("/health", (_req, res) => res.status(200).send("ok"));

app.use(errorHandler);

const server = app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on ${SERVER_PORT}`);
});

const shutdown = async () => {
  server.close(() => console.log("HTTP server closed"));
  await postgresClient.end();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default app;
