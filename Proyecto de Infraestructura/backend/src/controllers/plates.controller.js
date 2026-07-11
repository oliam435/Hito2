const platesService = require('../services/plates.service');

// Normaliza la patente: mayúsculas y sin espacios/guiones
function normalize(patente) {
  return String(patente || '').toUpperCase().replace(/[\s-]/g, '');
}

async function getPlate(req, res, next) {
  try {
    const patente = normalize(req.params.patente);
    if (!patente) return res.status(400).json({ error: 'Patente inválida' });

    // tipo de movimiento: entrada (por defecto) o salida
    const tipo = req.query.tipo === 'salida' ? 'salida' : 'entrada';

    const { data, source } = await platesService.getPlateDetail(patente, tipo);
    // source: 'db' si ya estaba registrada, 'api' si se consultó la API externa
    res.json({ source, tipo, data });
  } catch (err) {
    next(err);
  }
}

async function getInfo(req, res, next) {
  try {
    const patente = normalize(req.params.patente);
    const data = await platesService.getStored(patente);
    if (!data) return res.status(404).json({ error: 'Patente no registrada' });
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

async function listPlates(req, res, next) {
  try {
    const items = await platesService.listPlates();
    res.json({ count: items.length, items });
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const validos = ['dia', 'semana', 'mes', 'anio'];
    const periodo = validos.includes(req.query.periodo) ? req.query.periodo : 'dia';
    const stats = await platesService.getStats(periodo);
    res.json(stats);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPlate, getInfo, listPlates, getStats };
