const config = require('../config');
const logger = require('../utils/logger');

/**
 * Consulta la API de Boostr (patentes Chile).
 * Doc: https://docs.boostr.cl/reference/car-plate
 *
 * GET https://api.boostr.cl/vehicle/{plate}.json?include=owner
 * Header: X-API-KEY: <api_key>
 *
 * Respuesta OK:
 *   { status: "success", data: { plate, dv, make, model, year, type, engine, color?, owner? } }
 * Respuesta error (¡también llega con HTTP 200!):
 *   { status: "error", data: "", code: "V-02", message: "No encontramos datos..." }
 *
 * Usa fetch nativo (Node 18+).
 */
async function fetchPlate(patente) {
  const key = config.boostr.apiKey;
  const sinKeyReal = !key || key === 'tu_api_key_de_boostr_aqui';
  if (sinKeyReal) {
    // Sin API key real (vacía o placeholder): datos simulados para no romper el flujo
    logger.warn('BOOSTR_API_KEY no configurada (o es el placeholder): devolviendo datos mock');
    return {
      patente,
      marca: 'Desconocida',
      modelo: 'Desconocido',
      color: 'Desconocido',
      detalle: { make: 'Desconocida', model: 'Desconocido', mock: true },
      mock: true,
    };
  }

  const url = `${config.boostr.baseUrl}/vehicle/${encodeURIComponent(patente)}.json` +
    `?include=${encodeURIComponent(config.boostr.include)}`;

  const res = await fetch(url, {
    headers: {
      'X-API-KEY': config.boostr.apiKey,
      'Accept': 'application/json',
    },
  });

  // Boostr puede devolver errores de negocio con HTTP 200, por eso revisamos el body
  let body;
  try {
    body = await res.json();
  } catch {
    throw httpError(502, `Respuesta no-JSON de Boostr (HTTP ${res.status})`);
  }

  if (!res.ok) {
    throw httpError(res.status, `Boostr respondió HTTP ${res.status}`);
  }

  if (body.status === 'error') {
    // V-02 = no encontrado, V-04 = patente inválida, V-01 = falta patente
    const status = body.code === 'V-02' ? 404 : 400;
    throw httpError(status, body.message || 'Error consultando la patente', body.code);
  }

  // status === 'success' → mapeamos a nuestro modelo interno
  const d = body.data || {};
  return {
    patente: d.plate || patente,
    dv: d.dv,
    marca: d.make,
    modelo: d.model,
    anio: d.year,
    tipo: d.type,
    motor: d.engine,
    color: d.color || null, // disponible en planes de pago
    dueno: d.owner
      ? { nombre: d.owner.fullname, rut: d.owner.documentNumber }
      : null,
    detalle: d, // objeto data COMPLETO de Boostr (todos los campos extendidos)
  };
}

function httpError(status, message, code) {
  const err = new Error(message);
  err.status = status;
  if (code) err.code = code;
  return err;
}

module.exports = { fetchPlate };
