import { existsSync } from "node:fs";
import { join } from "node:path";
import { config as loadDotenvFile } from "dotenv";

/**
 * Carrega `.env` do workspace da API e, em seguida, o `.env` da raiz do monorepo.
 * Valores já presentes no processo têm precedência (dotenv não sobrescreve).
 */
export function loadDotenv(): void {
  const candidates = [
    join(process.cwd(), ".env"),
    join(process.cwd(), "..", "..", ".env"),
    join(__dirname, "..", "..", ".env"),
    join(__dirname, "..", "..", "..", "..", ".env"),
  ];

  for (const path of candidates) {
    if (existsSync(path)) {
      loadDotenvFile({ path });
    }
  }
}
