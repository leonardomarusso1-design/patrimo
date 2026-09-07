/**
 * Logger estruturado compartilhado. UI e rotas nunca usam console direto.
 * Em produção emite JSON de uma linha (fácil de indexar); em dev, legível.
 */
type Level = "info" | "warn" | "error";
type Fields = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";

function emit(level: Level, msg: string, fields?: Fields) {
  const record = { ts: new Date().toISOString(), level, msg, ...fields };
  const line = isProd ? JSON.stringify(record) : `[${level}] ${msg}`;
  if (level === "error") console.error(line, isProd ? "" : (fields ?? ""));
  else if (level === "warn") console.warn(line, isProd ? "" : (fields ?? ""));
  else console.info(line, isProd ? "" : (fields ?? ""));
}

export const logger = {
  info: (msg: string, fields?: Fields) => emit("info", msg, fields),
  warn: (msg: string, fields?: Fields) => emit("warn", msg, fields),
  error: (msg: string, fields?: Fields) => emit("error", msg, fields),
};

/**
 * Registra o erro real no servidor e devolve uma mensagem genérica pro cliente.
 * Nunca vaza stack trace ou erro do Postgres pra fora.
 */
export function safeError(context: string, err: unknown): string {
  logger.error(context, {
    error: err instanceof Error ? err.message : String(err),
  });
  return "Não foi possível concluir a ação agora. Tente novamente em instantes.";
}
