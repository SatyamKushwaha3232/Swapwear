import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { prisma } from "../config/prisma.js";
import { appConfig, validateProductionConfig } from "../config/app.config.js";

dotenv.config();

const requiredModels = [
  "user",
  "profile",
  "listing",
  "swap",
  "notification",
  "chatConversation",
  "payment",
  "deliveryOrder",
  "report",
  "review",
];

export async function main() {
  validateProductionConfig();

  await prisma.$queryRaw`select 1`;

  const counts = {};
  for (const model of requiredModels) {
    counts[model] = await prisma[model].count();
  }

  console.log("SwapWear smoke check passed");
  console.log(`Mode: ${appConfig.env}`);
  console.log(`Client: ${appConfig.clientUrl}`);
  console.log(`Origins: ${appConfig.clientUrls.join(", ")}`);
  console.log("Counts:");
  for (const [model, count] of Object.entries(counts)) {
    console.log(`- ${model}: ${count}`);
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  main()
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
