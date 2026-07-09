const BASE = import.meta.env.VITE_API_URL || '/api';

// Registra un movimiento (entrada o salida) y devuelve el detalle.
export async function consultarPatente(patente, tipo = 'entrada') {
  const res = await fetch(
    `${BASE}/patentes/${encodeURIComponent(patente)}?tipo=${encodeURIComponent(tipo)}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json(); // { source, tipo, data }
}

// Historial de vehículos con su resumen
export async function listarPatentes() {
  const res = await fetch(`${BASE}/patentes`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); // { count, items: [...] }
}

// Detalle guardado de una patente (solo lectura, no registra movimiento)
export async function obtenerDetalle(patente) {
  const res = await fetch(`${BASE}/patentes/${encodeURIComponent(patente)}/info`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json(); // { data }
}

// Estadísticas por período (dia | semana | mes | anio)
export async function obtenerEstadisticas(periodo = 'dia') {
  const res = await fetch(`${BASE}/patentes/stats?periodo=${encodeURIComponent(periodo)}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}
