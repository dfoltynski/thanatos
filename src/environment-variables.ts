require("dotenv").config();

export let SERVER_PORT: number;

export const defineEnvironmentVariables = () => {
  SERVER_PORT = process.env.SERVER_PORT;
};
