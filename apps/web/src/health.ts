import { loadWebEnvironment } from "@food-recall/config";

export type HealthResponse = {
  status: "ok";
  service: "web";
  environment: string;
};

export function createHealthResponse(environment: NodeJS.ProcessEnv = process.env): HealthResponse {
  const config = loadWebEnvironment(environment);
  return { status: "ok", service: "web", environment: config.NODE_ENV };
}
