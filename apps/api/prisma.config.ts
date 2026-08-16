import { defineConfig } from "prisma/config";
import { loadDotenv } from "./src/config/dotenv";

// Prisma 7 lê a URL de conexão aqui (não mais dentro de schema.prisma).
loadDotenv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
});
