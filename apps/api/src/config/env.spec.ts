import { loadEnv } from "./env";

describe("loadEnv", () => {
  const base = {
    DATABASE_URL: "mysql://root:root@localhost:3306/sena_crm",
    JWT_SECRET: "segredo-de-teste-com-mais-de-32-caracteres",
    DOCUMENT_ENCRYPTION_KEY: "0".repeat(64),
    DOCUMENT_HASH_KEY: "1".repeat(64),
  };

  it("aplica defaults de desenvolvimento", () => {
    const env = loadEnv(base as NodeJS.ProcessEnv);

    expect(env.NODE_ENV).toBe("development");
    expect(env.API_PORT).toBe(3333);
    expect(env.SWAGGER_ENABLED).toBe(true);
  });

  it("converte API_PORT para número", () => {
    const env = loadEnv({ ...base, API_PORT: "4000" } as NodeJS.ProcessEnv);

    expect(env.API_PORT).toBe(4000);
  });

  it("falha sem DATABASE_URL", () => {
    expect(() => loadEnv({} as NodeJS.ProcessEnv)).toThrow(/DATABASE_URL/);
  });

  it("falha com JWT_SECRET curto demais", () => {
    expect(() => loadEnv({ ...base, JWT_SECRET: "curto" } as NodeJS.ProcessEnv)).toThrow(
      /JWT_SECRET/
    );
  });

  it("falha com NODE_ENV inválido", () => {
    expect(() => loadEnv({ ...base, NODE_ENV: "staging" } as NodeJS.ProcessEnv)).toThrow(
      /NODE_ENV/
    );
  });
});
