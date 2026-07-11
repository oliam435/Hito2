const logger = require('../utils/logger');

// Middleware central de errores de Express
module.exports = function errorHandler(err, req, res, next) {
  logger.error(err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
  });
};
