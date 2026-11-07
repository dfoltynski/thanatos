import { spawn } from "node:child_process";
import path from "node:path";
import { Environment } from "../../../shared/types";

const JOBS_BIN = path.resolve(process.cwd(), "src/modules/jobs/jobs");

export function deploy(branch: string, repo: string, env: Environment) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(JOBS_BIN, ["-b", branch, "-r", repo, "-e", env], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));

    child.on("error", reject);

    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output || `jobs exited with code ${code}`));
    });
  });
}
