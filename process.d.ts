declare module "node:process" {
  global {
    namespace NodeJS {
      interface ProcessEnv extends Dict<string> {
        SERVER_PORT: number;
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
      }
    }
  }
}
