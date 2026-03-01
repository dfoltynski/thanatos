import { spawn } from "node:child_process";
import path from "node:path";
import { Environment } from "../../../shared/types";
import fs from "node:fs";

const JOBS_BIN = path.resolve(process.cwd(), "src/modules/jobs/jobs");

export function deploy(branch: string, repo: string, env: Environment) {
  return new Promise<string>((resolve, reject) => {
    console.log("path", JOBS_BIN);

    console.log("cwd:", process.cwd());
    console.log("JOBS_BIN:", JOBS_BIN);
    console.log("exists:", fs.existsSync(JOBS_BIN));

    try {
      fs.accessSync(JOBS_BIN, fs.constants.X_OK);
      console.log("executable: yes");
    } catch (e) {
      console.log("executable: NO", e);
    }
    const child = spawn(JOBS_BIN, ["-b", branch, "-r", repo, "-e", env], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));

    child.on("error", (err) => {
      console.error("spawn error:", err);
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) resolve(output);
      else reject(new Error(output || `jobs exited with code ${code}`));
    });

    resolve("ok");
  });
}
