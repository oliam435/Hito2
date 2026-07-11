const repository = require('../repositories/plates.repository');
const externalApi = require('./externalApi.service');
const logger = require('../utils/logger');
const config = require('../config');

// --- Manejo de zona horaria (para que las horas sean las de Chile, no UTC) ---
const TZ = config.timezone; // ej: 'America/Santiago' (respeta horario de verano)

// Offset (ms) entre la hora local de la zona y UTC para un instante dado.
function offsetMs(ms) {
  const d = new Date(ms);
  const utc = new Date(d.toLocaleString('en-US', { timeZone: 'UTC' }));
  const loc = new Date(d.toLocaleString('en-US', { timeZone: TZ }));
  return loc.getTime() - utc.getTime();
}

// Devuelve un Date cuyos campos UTC (getUTCHours, getUTCDay, etc.) representan
// la hora LOCAL de la zona (Chile). Así agrupamos por hora/día correctamente
// tanto en local como en la Lambda (que corre en UTC).
function enChile(ms) {
  return new Date(ms + offsetMs(ms));
}

// Devuelve los eventos de un registro tolerando formatos viejos:
// - record.eventos: [{ tipo, ts }]
// - record.ingresos: [ts]  (se interpretan como entradas)
// - record.horaEntrada: ts (una entrada)
function eventosDe(record) {
  if (Array.isArray(record.eventos)) return record.eventos;
  if (Array.isArray(record.ingresos)) return record.ingresos.map((ts) => ({ tipo: 'entrada', ts }));
  if (record.horaEntrada) return [{ tipo: 'entrada', ts: record.horaEntrada }];
  return [];
}

function ultimaPorTipo(eventos, tipo) {
  const ts = eventos.filter((e) => e.tipo === tipo).map((e) => e.ts).sort();
  return ts.length ? ts[ts.length - 1] : null;
}

// Resumen calculado por vehículo (para el detalle y el historial)
function resumen(record) {
  const eventos = eventosDe(record);
  const hoy = enChile(Date.now());
  const mes = hoy.getUTCMonth();
  const anio = hoy.getUTCFullYear();
  const horas = new Set();
  let vecesEsteMes = 0;

  for (const e of eventos) {
    const t = Date.parse(e.ts);
    if (isNaN(t)) continue;
    const d = enChile(t);
    horas.add(d.getUTCHours());
    if (d.getUTCMonth() === mes && d.getUTCFullYear() === anio) vecesEsteMes++;
  }

  return {
    ultimaEntrada: ultimaPorTipo(eventos, 'entrada'),
    ultimaSalida: ultimaPorTipo(eventos, 'salida'),
    totalEventos: eventos.length,
    vecesEsteMes,
    horas: [...horas].sort((a, b) => a - b),
  };
}

/**
 * Registra un movimiento (entrada o salida) de una patente.
 * 1. Busca en DynamoDB. Si existe -> agrega el evento (source: 'db').
 * 2. Si no existe -> consulta Boostr, crea el registro con su primer evento
 *    y lo guarda (source: 'api').
 */
async function getPlateDetail(patente, tipo = 'entrada') {
  const ahora = new Date().toISOString();
  const evento = { tipo, ts: ahora };
  const existing = await repository.findByPlate(patente);

  if (existing) {
    const eventos = eventosDe(existing);
    eventos.push(evento);
    const updated = { ...existing, eventos, ultimoEvento: ahora };
    delete updated.ingresos; // migra el formato viejo
    await repository.save(updated);
    logger.info(`Patente ${patente} en DB. ${tipo} registrada (total: ${eventos.length})`);
    return { data: { ...updated, ...resumen(updated) }, source: 'db' };
  }

  logger.info(`Patente ${patente} no está en DB, consultando Boostr`);
  const apiData = await externalApi.fetchPlate(patente);

  const record = {
    patente,
    marca: apiData.marca,
    modelo: apiData.modelo,
    anio: apiData.anio,
    tipo: apiData.tipo,
    color: apiData.color,
    motor: apiData.motor,
    dv: apiData.dv,
    dueno: apiData.dueno,
    horaEntrada: ahora, // compatibilidad
    ultimoEvento: ahora,
    eventos: [evento],
    detalle: apiData.detalle, // datos completos de Boostr (para "Ver detalle")
  };

  await repository.save(record);
  return { data: { ...record, ...resumen(record) }, source: 'api' };
}

// Lee el registro guardado de una patente SIN registrar movimiento ni llamar
// a Boostr. Devuelve null si no está en la base.
async function getStored(patente) {
  const r = await repository.findByPlate(patente);
  if (!r) return null;
  return { ...r, ...resumen(r) };
}

// Historial de vehículos con su resumen, ordenado por último movimiento.
async function listPlates() {
  const items = await repository.listAll();
  return items
    .map((r) => ({
      patente: r.patente,
      marca: r.marca,
      modelo: r.modelo,
      anio: r.anio,
      color: r.color,
      tipoVehiculo: r.tipo,
      ...resumen(r),
    }))
    .sort((a, b) => {
      const ta = a.ultimaSalida || a.ultimaEntrada || 0;
      const tb = b.ultimaSalida || b.ultimaEntrada || 0;
      return new Date(tb) - new Date(ta);
    });
}

// Ventana actual y la anterior (misma duración) según el período, calculadas
// en hora de Chile. Devuelve timestamps UTC reales para comparar con los eventos.
function ventanas(periodo) {
  const now = Date.now();
  const off = offsetMs(now);
  const c = new Date(now + off); // campos UTC = hora de Chile "ahora"
  const Y = c.getUTCFullYear();
  const M = c.getUTCMonth();
  const D = c.getUTCDate();
  let startShift, prevShift;

  if (periodo === 'semana') {
    const dow = (c.getUTCDay() + 6) % 7; // lunes = inicio
    startShift = Date.UTC(Y, M, D - dow);
    prevShift = startShift - 7 * 86400000;
  } else if (periodo === 'mes') {
    startShift = Date.UTC(Y, M, 1);
    prevShift = Date.UTC(Y, M - 1, 1);
  } else if (periodo === 'anio') {
    startShift = Date.UTC(Y, 0, 1);
    prevShift = Date.UTC(Y - 1, 0, 1);
  } else {
    startShift = Date.UTC(Y, M, D);
    prevShift = startShift - 86400000;
  }

  // startShift/prevShift están en el "reloj de Chile"; los volvemos a UTC real.
  return { desde: startShift - off, prevDesde: prevShift - off };
}

// Un vehículo está "adentro" si su último movimiento fue una entrada.
function estaAdentro(record) {
  const ev = eventosDe(record)
    .filter((e) => e && e.ts)
    .sort((a, b) => new Date(a.ts) - new Date(b.ts));
  return ev.length > 0 && ev[ev.length - 1].tipo === 'entrada';
}

// Estadísticas agregadas dentro del período (dia | semana | mes | anio).
async function getStats(periodo = 'dia') {
  const items = await repository.listAll();
  const { desde, prevDesde } = ventanas(periodo);

  const porHoraEntradas = Array(24).fill(0);
  const porHoraSalidas = Array(24).fill(0);
  // heatmap[díaDeSemana 0=Lun..6=Dom][hora 0..23]
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
  const ahora = Date.now();
  const ultimas24h = Array(24).fill(0); // movimientos por hora en las últimas 24 h (móvil)

  let movimientos = 0;
  let movimientosPrevios = 0;
  let entradas = 0;
  let salidas = 0;
  let adentroAhora = 0;
  const activos = new Set();

  for (const r of items) {
    if (estaAdentro(r)) adentroAhora++;
    for (const e of eventosDe(r)) {
      const t = Date.parse(e.ts);
      if (isNaN(t)) continue;
      const haceMs = ahora - t;
      if (haceMs >= 0 && haceMs < 86400000) {
        ultimas24h[23 - Math.floor(haceMs / 3600000)]++;
      }
      if (t >= desde) {
        movimientos++;
        activos.add(r.patente);
        const cl = enChile(t); // hora/día en horario de Chile
        const h = cl.getUTCHours();
        const dow = (cl.getUTCDay() + 6) % 7;
        heatmap[dow][h]++;
        if (e.tipo === 'entrada') {
          porHoraEntradas[h]++;
          entradas++;
        } else {
          porHoraSalidas[h]++;
          salidas++;
        }
      } else if (t >= prevDesde) {
        movimientosPrevios++;
      }
    }
  }

  let horaPico = 0;
  for (let h = 1; h < 24; h++) {
    if (porHoraEntradas[h] > porHoraEntradas[horaPico]) horaPico = h;
  }
  const hayEntradas = porHoraEntradas.some((n) => n > 0);

  const deltaPct =
    movimientosPrevios > 0
      ? Math.round(((movimientos - movimientosPrevios) / movimientosPrevios) * 100)
      : null;

  const horaActual = enChile(Date.now()).getUTCHours();
  const ultimas24hLabels = Array.from({ length: 24 }, (_, i) =>
    String((horaActual - (23 - i) + 24) % 24).padStart(2, '0')
  );

  return {
    periodo,
    desde: new Date(desde).toISOString(),
    generadoEn: new Date().toISOString(),
    movimientos,
    movimientosPrevios,
    deltaPct,
    entradas,
    salidas,
    adentroAhora,
    vehiculosActivos: activos.size,
    vehiculosTotales: items.length,
    horaPico: hayEntradas ? horaPico : null,
    porHoraEntradas,
    porHoraSalidas,
    heatmap,
    ultimas24h,
    ultimas24hLabels,
  };
}

module.exports = { getPlateDetail, getStored, listPlates, getStats };
