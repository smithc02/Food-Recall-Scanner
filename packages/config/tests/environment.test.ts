import { describe, expect, it } from "vitest";
import { loadWebEnvironment, loadWorkerEnvironment } from "../src/index.js";

describe("environment validation", () => {
  const validWorkerEnvironment = {
    DATABASE_URL: "postgresql://localuser:localpasswordvalue@127.0.0.1:5432/food_recall",
    REDIS_URL: "redis://:localredispassword@127.0.0.1:6379",
    MINIO_ENDPOINT: "127.0.0.1",
    MINIO_ACCESS_KEY: "local-access-key-12345",
    MINIO_SECRET_KEY: "local-secret-key-12345",
  };

  it("uses only the safe web development default", () => {
    expect(loadWebEnvironment({})).toEqual({
      NODE_ENV: "development",
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3000",
    });
  });

  it("accepts valid local database and Redis URLs", () => {
    expect(loadWorkerEnvironment(validWorkerEnvironment)).toMatchObject({
      DATABASE_URL: validWorkerEnvironment.DATABASE_URL,
      REDIS_URL: validWorkerEnvironment.REDIS_URL,
    });
  });

  it("rejects a placeholder database URL", () => {
    expect(() =>
      loadWorkerEnvironment({
        ...validWorkerEnvironment,
        DATABASE_URL:
          "postgresql://REPLACE_WITH_LOCAL_USER:localpasswordvalue@127.0.0.1:5432/food_recall",
      }),
    ).toThrow(/DATABASE_URL/);
  });

  it("rejects a placeholder Redis URL", () => {
    expect(() =>
      loadWorkerEnvironment({
        ...validWorkerEnvironment,
        REDIS_URL: "redis://:CHANGE_ME_LOCAL_PASSWORD@127.0.0.1:6379",
      }),
    ).toThrow(/REDIS_URL/);
  });

  it("continues to reject placeholder MinIO credentials", () => {
    expect(() =>
      loadWorkerEnvironment({
        ...validWorkerEnvironment,
        MINIO_ACCESS_KEY: "REPLACE_WITH_LOCAL_ACCESS_KEY",
        MINIO_SECRET_KEY: "REPLACE_WITH_LOCAL_SECRET_KEY",
      }),
    ).toThrow(/MINIO_ACCESS_KEY/);
  });
});
