import dotenv from "dotenv";

dotenv.config();

export let SERVER_PORT: number;
export let GITHUB_CLIENT_ID: string;
export let GITHUB_CLIENT_SECRET: string;

export const defineEnvironmentVariables = () => {
  SERVER_PORT = process.env.SERVER_PORT;
  GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
};
