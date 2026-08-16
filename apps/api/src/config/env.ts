import { z } from "zod";

/**
 * Validação de ambiente (ARCHITECTURE.md §28).
 * A API não sobe com env inválido: falha explícita no boot.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3333),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SWAGGER_ENABLED: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório (MySQL 8)."),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = envSchema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(raiz)"}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas:\n${details}`);
  }

  return parsed.data;
}

export function env(): Env {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
}

/** Somente para testes. */
export function resetEnvCache(): void {
  cached = null;
}
