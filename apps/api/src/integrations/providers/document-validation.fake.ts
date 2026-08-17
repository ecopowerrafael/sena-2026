import { IntegrationAdapter } from "../integration-adapter";
import type { DocumentValidationRequest, DocumentValidationResult } from "@sena/shared";

export class DocumentValidationFakeProvider extends IntegrationAdapter {
  async validateCredentials() {
    return { isValid: true };
  }

  async validateDocument(req: DocumentValidationRequest): Promise<DocumentValidationResult> {
    // Remove non-numeric
    const cleanDoc = req.documentNumber.replace(/\D/g, "");

    // Fake CPF validation (mod 11)
    if (req.documentType === "CPF" && cleanDoc.length === 11) {
      if (this.isValidCpfChecksum(cleanDoc)) {
        return {
          isValid: true,
          name: "Pessoa Física Simulada",
          documentNumber: req.documentNumber,
          documentType: "CPF",
          status: "ACTIVE",
          validationDate: new Date().toISOString(),
        };
      }
    }

    // Fake CNPJ validation (mod 11)
    if (req.documentType === "CNPJ" && cleanDoc.length === 14) {
      if (this.isValidCnpjChecksum(cleanDoc)) {
        return {
          isValid: true,
          name: "Empresa Simulada LTDA",
          documentNumber: req.documentNumber,
          documentType: "CNPJ",
          status: "ACTIVE",
          validationDate: new Date().toISOString(),
        };
      }
    }

    return {
      isValid: false,
      name: "",
      documentNumber: req.documentNumber,
      documentType: req.documentType,
      status: "INVALID",
      validationDate: new Date().toISOString(),
    };
  }

  private isValidCpfChecksum(cpf: string): boolean {
    if (!cpf || cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    if (parseInt(cpf[9]) !== remainder) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    if (remainder < 2) remainder = 0;
    else remainder = 11 - remainder;

    return parseInt(cpf[10]) === remainder;
  }

  private isValidCnpjChecksum(cnpj: string): boolean {
    if (!cnpj || cnpj.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    let sum = 0;
    let multiplier = 5;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * multiplier;
      multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }
    let remainder = sum % 11;
    let digit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cnpj[12]) !== digit) return false;

    sum = 0;
    multiplier = 6;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * multiplier;
      multiplier = multiplier === 2 ? 9 : multiplier - 1;
    }
    remainder = sum % 11;
    digit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cnpj[13]) === digit;
  }
}
