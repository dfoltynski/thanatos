import express from "express";
import {
  defineEnvironmentVariables,
  SERVER_PORT,
} from "./environment-variables";
import { defineRoutes } from "./modules/index";
import cors from "cors";
import postgresClient from "./database";
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

app.listen(SERVER_PORT, () => {
  console.log(`Server is listening on ${SERVER_PORT}`);
});

process.on("beforeExit", (code) => {
  setTimeout(() => {
    console.log(`Process will exit with code: ${code}`);
    process.exit(code);
  }, 100);
});

process.on("exit", (code) => {
  console.log(`Process exited with code: ${code}`);
  postgresClient.end();
});

export default app;
