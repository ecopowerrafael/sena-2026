import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Algorithm, hash } from "@node-rs/argon2";
import { loadDotenv } from "../src/config/dotenv";
import { loadEnv } from "../src/config/env";
import { PrismaClient } from "../src/generated/prisma/client";

loadDotenv();

const env = loadEnv();
const prisma = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL) });

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

  // O admin só é criado quando as variáveis seguras existem; nunca com senha fixa no código.
  if (!env.SEED_ADMIN_EMAIL || !env.SEED_ADMIN_PASSWORD) {
    console.log("SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD ausentes: nenhum administrador criado.");
    return;
  }

  if (env.NODE_ENV === "production") {
    console.log("Ambiente de produção: seed de administrador ignorado.");
    return;
  }

  const email = env.SEED_ADMIN_EMAIL.trim().toLowerCase();
  const existing = await prisma.user.findFirst({ where: { tenantId: tenant.id, email } });

  if (existing) {
    console.log(`Administrador já existe: ${email}`);
    return;
  }

  const passwordHash = await hash(env.SEED_ADMIN_PASSWORD, {
    algorithm: Algorithm.Argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const admin = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: env.SEED_ADMIN_NAME ?? "Administrador SENA",
      email,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Administrador criado: ${admin.email} (${admin.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
