import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { loadDotenv } from "../src/config/dotenv";
import { loadEnv } from "../src/config/env";
import { PrismaClient } from "../src/generated/prisma/client";

loadDotenv();

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(loadEnv().DATABASE_URL) });

async function main(): Promise<void> {
  const tenant = await prisma.tenant.upsert({
    where: { slug: "sena" },
    update: {},
    create: {
      slug: "sena",
      name: "SENA Imóveis",
      legalName: "SENA Negócios Imobiliários LTDA",
    },
  });

  console.log(`Tenant garantido: ${tenant.slug} (${tenant.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
