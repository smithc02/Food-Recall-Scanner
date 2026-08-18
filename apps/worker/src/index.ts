import "dotenv/config";
import { loadWorkerEnvironment } from "@food-recall/config";

const environment = loadWorkerEnvironment();

console.info("Food Recall Scanner worker shell is ready", {
  environment: environment.NODE_ENV,
});
