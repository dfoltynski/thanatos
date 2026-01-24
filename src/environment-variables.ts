require("dotenv").config();

export let SERVER_PORT: number;

export function defineEnvironmentVariables() {
  SERVER_PORT = process.env.SERVER_PORT;
}
