import { Pool } from "pg";
import {
  DATABASE,
  DATABASE_PASSWORD,
  DATABASE_USER,
  defineEnvironmentVariables,
} from "./environment-variables";
defineEnvironmentVariables();
const postgresClient = new Pool({
  user: DATABASE_USER,
  password: DATABASE_PASSWORD,
  database: DATABASE,
});

export default postgresClient;
