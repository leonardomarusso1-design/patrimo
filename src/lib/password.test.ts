import { describe, expect, it } from "vitest";
import { MAX_PASSWORD, validateNewPassword } from "./password";

describe("validateNewPassword", () => {
  it("aceita senha de 8 a 72 caracteres igual à confirmação", () => {
    expect(validateNewPassword("12345678", "12345678")).toBeNull();
    expect(validateNewPassword("a".repeat(MAX_PASSWORD), "a".repeat(MAX_PASSWORD))).toBeNull();
  });
  it("recusa senha curta, longa demais ou que não veio como texto", () => {
    expect(validateNewPassword("1234567", "1234567")).toBe("A senha precisa de ao menos 8 caracteres.");
    expect(validateNewPassword(null, null)).toBe("A senha precisa de ao menos 8 caracteres.");
    expect(validateNewPassword("a".repeat(MAX_PASSWORD + 1), "a".repeat(MAX_PASSWORD + 1))).toBe("A senha pode ter no máximo 72 caracteres.");
  });
  it("recusa quando a confirmação é diferente", () => {
    expect(validateNewPassword("12345678", "12345679")).toBe("As duas senhas não são iguais.");
    expect(validateNewPassword("12345678", undefined)).toBe("As duas senhas não são iguais.");
  });
});
