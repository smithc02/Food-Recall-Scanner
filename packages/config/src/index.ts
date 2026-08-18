import { z } from "zod";

const placeholderPattern = /REPLACE_WITH|CHANGE_ME|example/i;

function isLocalPlaceholder(value: string): boolean {
  return placeholderPattern.test(value);
}

const requiredSecret = (name: string) =>
  z
    .string()
    .min(16, `${name} must be at least 16 characters`)
    .refine((value) => !isLocalPlaceholder(value), {
      message: `${name} must be replaced with a local value`,
    });

const requiredUrl = (name: string) =>
  z
    .string()
    .url()
    .refine((value) => !isLocalPlaceholder(value), {
      message: `${name} must be replaced with a local value`,
    });

const baseSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://127.0.0.1:3000"),
});

const workerSchema = baseSchema.extend({
  DATABASE_URL: requiredUrl("DATABASE_URL"),
  REDIS_URL: requiredUrl("REDIS_URL"),
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z.coerce.number().int().min(1).max(65535).default(9000),
  MINIO_USE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  MINIO_ACCESS_KEY: requiredSecret("MINIO_ACCESS_KEY"),
  MINIO_SECRET_KEY: requiredSecret("MINIO_SECRET_KEY"),
});

export type WebEnvironment = z.output<typeof baseSchema>;
export type WorkerEnvironment = z.output<typeof workerSchema>;

export function loadWebEnvironment(environment: NodeJS.ProcessEnv = process.env): WebEnvironment {
  return baseSchema.parse(environment);
}

export function loadWorkerEnvironment(
  environment: NodeJS.ProcessEnv = process.env,
): WorkerEnvironment {
  return workerSchema.parse(environment);
}
