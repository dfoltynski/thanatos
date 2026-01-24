declare module "node:process" {
  global {
    namespace NodeJS {
      interface ProcessEnv extends Dict<string> {
        SERVER_PORT: number;
      }
    }
  }
}
