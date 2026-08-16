import { Injectable } from "@nestjs/common";
import { Algorithm, hash, verify } from "@node-rs/argon2";
import { PASSWORD_MIN_LENGTH } from "@sena/shared";

const ARGON2ID_OPTIONS = {
  algorithm: Algorithm.Argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class PasswordService {
  hash(plain: string): Promise<string> {
    return hash(plain, ARGON2ID_OPTIONS);
  }

  async verify(passwordHash: string, plain: string): Promise<boolean> {
    try {
      return await verify(passwordHash, plain, ARGON2ID_OPTIONS);
    } catch {
      return false;
    }
  }

  /** Política mínima de senha (ARCHITECTURE.md §8.2). */
  validatePolicy(plain: string): string[] {
    const problems: string[] = [];

    if (plain.length < PASSWORD_MIN_LENGTH) {
      problems.push(`A senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
    }
    if (!/[a-zA-Z]/.test(plain)) {
      problems.push("A senha deve conter ao menos uma letra.");
    }
    if (!/[0-9]/.test(plain)) {
      problems.push("A senha deve conter ao menos um número.");
    }

    return problems;
  }
}
