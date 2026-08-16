import { Inject, Injectable } from "@nestjs/common";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "node:crypto";
import { ENV } from "../config/config.module";
import type { Env } from "../config/env";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;

/**
 * Campos sensíveis (hoje CPF/CNPJ) guardam três coisas (ARCHITECTURE.md §10.1):
 * o valor cifrado em AES-256-GCM, um HMAC determinístico para busca/duplicidade
 * e os últimos dígitos para exibição. O valor em claro nunca vai ao banco.
 */
@Injectable()
export class CryptoService {
  private readonly encryptionKey: Buffer;
  private readonly hashKey: Buffer;

  constructor(@Inject(ENV) env: Env) {
    this.encryptionKey = Buffer.from(env.DOCUMENT_ENCRYPTION_KEY, "hex");
    this.hashKey = Buffer.from(env.DOCUMENT_HASH_KEY, "hex");
  }

  encrypt(plain: string): string {
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, this.encryptionKey, iv);
    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);

    return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), encrypted.toString("base64")].join(
      "."
    );
  }

  decrypt(payload: string): string {
    const [iv, tag, data] = payload.split(".");

    if (!iv || !tag || !data) {
      throw new Error("Payload cifrado em formato inválido.");
    }

    const decipher = createDecipheriv(ALGORITHM, this.encryptionKey, Buffer.from(iv, "base64"));
    decipher.setAuthTag(Buffer.from(tag, "base64"));

    return Buffer.concat([decipher.update(Buffer.from(data, "base64")), decipher.final()]).toString("utf8");
  }

  /** Determinístico de propósito: é o que permite comparar documentos sem decifrar. */
  hash(value: string): string {
    return createHmac("sha256", this.hashKey).update(value).digest("hex");
  }
}
