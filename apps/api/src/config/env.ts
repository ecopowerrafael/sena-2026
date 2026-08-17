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

  // Sessão (ARCHITECTURE.md §8.3)
  JWT_SECRET: z.string().min(32, "JWT_SECRET precisa de pelo menos 32 caracteres."),
  ACCESS_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  LOGIN_RATE_LIMIT: z.coerce.number().int().positive().default(5),
  LOGIN_RATE_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),

  // Proteção de documentos (ARCHITECTURE.md §10.1): chaves em hexadecimal de 32 bytes.
  DOCUMENT_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "DOCUMENT_ENCRYPTION_KEY deve ter 64 caracteres hexadecimais."),
  DOCUMENT_HASH_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, "DOCUMENT_HASH_KEY deve ter 64 caracteres hexadecimais."),

  // Seed de administrador — apenas dev/uso controlado.
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().min(10).optional(),
  SEED_ADMIN_NAME: z.string().optional(),

  // IA (ARCHITECTURE.md §23)
  AI_CLAUDE_API_KEY: z.string().optional(),
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
