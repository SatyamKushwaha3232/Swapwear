import dotenv from "dotenv";
import { pathToFileURL } from "node:url";
import { prisma } from "../config/prisma.js";
import { assertStrongPassword, hashPassword } from "../utils/password.js";

dotenv.config();

const email = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = String(process.env.ADMIN_PASSWORD || "");
const fullName = String(process.env.ADMIN_NAME || "SwapWear Admin").trim();

export async function main() {
  if (!email) throw new Error("ADMIN_EMAIL is required");
  assertStrongPassword(password);

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      profile: {
        upsert: {
          create: { fullName, provider: "email" },
          update: { fullName },
        },
      },
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
      profile: {
        create: { fullName, provider: "email" },
      },
    },
    include: { profile: true },
  });

  console.log(`Admin ready: ${user.email}`);
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
