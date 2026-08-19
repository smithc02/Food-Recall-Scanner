import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadWorkerDotenv } from "../src/load-env.js";

describe("worker dotenv loading", () => {
  const temporaryDirectories: string[] = [];

  afterEach(() => {
    for (const directory of temporaryDirectories.splice(0)) {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("loads values from the configured repository-level env file", () => {
    const directory = mkdtempSync(join(tmpdir(), "food-recall-worker-"));
    temporaryDirectories.push(directory);
    const envPath = join(directory, ".env");
    writeFileSync(envPath, "FROM_ROOT_FILE=loaded\n");
    const processEnv: NodeJS.ProcessEnv = {};

    loadWorkerDotenv(envPath, processEnv);

    expect(processEnv.FROM_ROOT_FILE).toBe("loaded");
  });

  it("preserves explicitly supplied environment values", () => {
    const directory = mkdtempSync(join(tmpdir(), "food-recall-worker-"));
    temporaryDirectories.push(directory);
    const envPath = join(directory, ".env");
    writeFileSync(envPath, "DATABASE_URL=from-file\n");
    const processEnv: NodeJS.ProcessEnv = { DATABASE_URL: "from-process" };

    loadWorkerDotenv(envPath, processEnv);

    expect(processEnv.DATABASE_URL).toBe("from-process");
  });
});
