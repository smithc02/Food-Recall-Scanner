import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

const repositoryEnvPath = fileURLToPath(new URL("../../../.env", import.meta.url));

export function loadWorkerDotenv(
  envPath: string = repositoryEnvPath,
  processEnv: NodeJS.ProcessEnv = process.env,
): void {
  dotenv.config({
    path: envPath,
    processEnv: processEnv as Record<string, string>,
    override: false,
  });
}
