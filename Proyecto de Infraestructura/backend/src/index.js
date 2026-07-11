// Punto de entrada para desarrollo local (levanta un servidor HTTP).
const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');

app.listen(config.port, () => {
  logger.info(`Servidor escuchando en http://localhost:${config.port}`);
});
