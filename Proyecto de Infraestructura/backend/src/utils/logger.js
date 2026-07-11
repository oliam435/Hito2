// Logger mínimo. Reemplazable por pino/winston más adelante.
const ts = () => new Date().toISOString();

module.exports = {
  info: (msg) => console.log(`[INFO] ${ts()} ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${ts()} ${msg}`),
  error: (msg) => console.error(`[ERROR] ${ts()} ${msg}`),
};
