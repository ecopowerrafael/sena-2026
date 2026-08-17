export type DocumentKind = "CPF" | "CNPJ";

export interface NormalizedDocument {
  digits: string;
  type: DocumentKind;
  last4: string;
}

/** Remove máscara e espaços, deixando apenas dígitos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function isCpfValid(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const check = (length: number): number => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return check(9) === Number(digits[9]) && check(10) === Number(digits[10]);
}

function isCnpjValid(digits: string): boolean {
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) {
    return false;
  }

  const check = (length: number): number => {
    const weights =
      length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return check(12) === Number(digits[12]) && check(13) === Number(digits[13]);
}

/**
 * Normaliza e valida CPF/CNPJ. Devolve null quando o documento não é válido —
 * quem chama decide se isso vira erro de validação.
 */
export function normalizeDocument(value: string): NormalizedDocument | null {
  const digits = onlyDigits(value);

  if (digits.length === 11 && isCpfValid(digits)) {
    return { digits, type: "CPF", last4: digits.slice(-4) };
  }

  if (digits.length === 14 && isCnpjValid(digits)) {
    return { digits, type: "CNPJ", last4: digits.slice(-4) };
  }

  return null;
}

/** Exibição auxiliar: só os últimos dígitos aparecem. */
export function maskDocument(type: DocumentKind | null, last4: string | null): string | null {
  if (!type || !last4) {
    return null;
  }

  return type === "CPF"
    ? `***.***.**${last4.slice(0, 1)}-${last4.slice(1)}`
    : `**.***.***/****-${last4}`;
}
