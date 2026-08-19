import { loadWorkerEnvironment } from "@food-recall/config";
import { loadWorkerDotenv } from "./load-env.js";

loadWorkerDotenv();

const environment = loadWorkerEnvironment();

console.info("Food Recall Scanner worker shell is ready", {
  environment: environment.NODE_ENV,
});
