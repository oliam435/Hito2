/**
 * Forma del registro de una patente en DynamoDB.
 * (Documentación de referencia; DynamoDB no exige esquema fijo.)
 *
 * @typedef {Object} Plate
 * @property {string} patente      Clave primaria (normalizada, mayúsculas)
 * @property {string} marca        Marca del auto (Boostr: make)
 * @property {string} modelo       Modelo del auto (Boostr: model)
 * @property {number} [anio]       Año (Boostr: year)
 * @property {string} [tipo]       Tipo de vehículo (Boostr: type)
 * @property {string} [color]      Color (Boostr: color, solo planes de pago)
 * @property {string} [motor]      Nº de motor (Boostr: engine)
 * @property {string} [dv]         Dígito verificador
 * @property {{nombre:string, rut:string}} [dueno] Dueño (include=owner)
 * @property {string} horaEntrada  ISO timestamp de la primera entrada
 * @property {object} [raw]        Respuesta cruda de Boostr
 */

module.exports = {};
