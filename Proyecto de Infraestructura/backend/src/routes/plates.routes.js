const express = require('express');
const controller = require('../controllers/plates.controller');

const router = express.Router();

// IMPORTANTE: las rutas fijas van ANTES de /:patente,
// si no Express tomaría "stats" como si fuera una patente.

// GET /api/patentes -> historial de vehículos registrados
router.get('/', controller.listPlates);

// GET /api/patentes/stats -> estadísticas (ingresos semana, tráfico por hora)
router.get('/stats', controller.getStats);

// GET /api/patentes/:patente/info -> solo lectura (no registra movimiento)
router.get('/:patente/info', controller.getInfo);

// GET /api/patentes/:patente -> registra movimiento (DB primero, sino API externa)
router.get('/:patente', controller.getPlate);

module.exports = router;
