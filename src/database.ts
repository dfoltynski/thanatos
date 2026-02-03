import { Pool } from "pg";

const postgresClient = new Pool({
  user: "postgres",
  password: "mysecretpassword",
  database: "charon",
});

export default postgresClient;
