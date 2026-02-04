declare module "node:process" {
  global {
    namespace NodeJS {
      interface ProcessEnv extends Dict<string> {
        SERVER_PORT: number;
        GITHUB_CLIENT_ID: string;
        GITHUB_CLIENT_SECRET: string;
        GITHUB_TOKEN: string;
        GITHUB_ORGANIZATION_NAME: string;
        DATABASE_USER: string;
        DATABASE_PASSWORD: string;
        DATABASE: string;
      }
    }
  }
}
