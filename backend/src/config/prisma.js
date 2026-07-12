// Prisma is introduced in the manual Postgres migration batch.
// Do not import this file from active routes until dependencies are installed
// and the first database migration has been generated.
//
// Planned activation:
// import { PrismaClient } from "@prisma/client";
// export const prisma = new PrismaClient();

export const prismaMigrationStatus = {
  enabled: false,
  note: "Manual PostgreSQL schema is ready in backend/prisma/schema.prisma.",
};
