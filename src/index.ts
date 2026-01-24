import express from "express";
import {
  defineEnvironmentVariables,
  SERVER_PORT,
} from "./environment-variables";

const app = express();

defineEnvironmentVariables();

app.listen(SERVER_PORT, () => {
  console.log(`Server is running at ${SERVER_PORT}`);
});
