import { describe, expect, it } from "vitest";
import { createHealthResponse } from "../src/health";

describe("web health", () => {
  it("returns an explicit successful web response", () => {
    expect(createHealthResponse({ NODE_ENV: "test" })).toEqual({
      status: "ok",
      service: "web",
      environment: "test",
    });
  });
});
