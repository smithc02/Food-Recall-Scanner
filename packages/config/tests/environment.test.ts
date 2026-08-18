import { describe, expect, it } from "vitest";
import { loadWebEnvironment, loadWorkerEnvironment } from "../src/index.js";

describe("environment validation", () => {
  it("uses only the safe web development default", () => {
    expect(loadWebEnvironment({})).toEqual({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    });
  });

  it("rejects placeholder worker credentials", () => {
    expect(() =>
      loadWorkerEnvironment({
        DATABASE_URL: "postgresql://user:password@127.0.0.1:5432/food_recall",
        REDIS_URL: "redis://:password@127.0.0.1:6379",
        MINIO_ENDPOINT: "127.0.0.1",
        MINIO_ACCESS_KEY: "REPLACE_WITH_LOCAL_ACCESS_KEY",
        MINIO_SECRET_KEY: "REPLACE_WITH_LOCAL_SECRET_KEY",
      }),
    ).toThrow(/MINIO_ACCESS_KEY/);
  });
});
