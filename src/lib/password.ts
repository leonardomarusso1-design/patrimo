/** Regras da nova senha (redefinição e troca em Configurações). Mesmo mínimo do cadastro. */
export const MIN_PASSWORD = 8;
/** O Supabase usa bcrypt, que só considera os 72 primeiros caracteres. */
export const MAX_PASSWORD = 72;

/** Devolve a mensagem de erro para o usuário, ou null se a senha e a confirmação estão certas. */
export function validateNewPassword(password: unknown, confirm: unknown): string | null {
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    return `A senha precisa de ao menos ${MIN_PASSWORD} caracteres.`;
  }
  if (password.length > MAX_PASSWORD) return `A senha pode ter no máximo ${MAX_PASSWORD} caracteres.`;
  if (password !== confirm) return "As duas senhas não são iguais.";
  return null;
}
