import { defineConfig } from "prisma/config";
import { loadDotenv } from "./src/config/dotenv";

// Prisma 7 lê a URL de conexão aqui (não mais dentro de schema.prisma).
loadDotenv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
    // Usado por `prisma migrate diff --from-migrations` e pelo shadow DB do migrate dev.
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
});
