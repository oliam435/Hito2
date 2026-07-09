import { useState } from 'react';

// Etiquetas en español para los campos conocidos de Boostr.
// Cualquier campo no listado se muestra con su nombre "humanizado".
const ETIQUETAS = {
  plate: 'Patente', dv: 'Dígito verificador', make: 'Marca', model: 'Modelo', year: 'Año',
  type: 'Tipo de vehículo', engine: 'Número de motor', vin: 'VIN / Chasis', chassis: 'Chasis',
  color: 'Color', fuel: 'Tipo de bencina', fuelType: 'Tipo de bencina', fuel_type: 'Tipo de bencina',
  mileage: 'Kilometraje', km: 'Kilometraje', manufacturer: 'Fabricante', maker: 'Fabricante',
  country: 'País de procedencia', originCountry: 'País de procedencia', origin_country: 'País de procedencia',
  region: 'Región de procedencia', doors: 'Cantidad de puertas', version: 'Versión',
  engineSize: 'Tamaño del motor', engine_size: 'Tamaño del motor', displacement: 'Tamaño del motor',
  transmission: 'Tipo de transmisión', owner: 'Dueño',
};

function humanizar(k) {
  return k.replace(/[_-]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
}
const etiqueta = (k) => ETIQUETAS[k] || humanizar(k);

function valor(v) {
  if (v == null || v === '') return '—';
  if (typeof v === 'object') {
    if (v.fullname || v.documentNumber) {
      return `${v.fullname || ''}${v.documentNumber ? ` (${v.documentNumber})` : ''}`.trim();
    }
    return JSON.stringify(v);
  }
  return String(v);
}

const fmt = (ts) => (ts ? new Date(ts).toLocaleString('es-CL') : '—');

function Item({ k, v }) {
  return (
    <div className="item">
      <div className="k">{k}</div>
      <div className="v">{v || v === 0 ? v : '—'}</div>
    </div>
  );
}

export default function DetalleVehiculo({ data }) {
  const [abierto, setAbierto] = useState(false);
  const detalle = data.detalle || {};
  const claves = Object.keys(detalle).filter((k) => k !== 'mock');

  return (
    <div>
      <div className="detail-grid">
        <Item k="Marca" v={data.marca} />
        <Item k="Modelo" v={data.modelo} />
        <Item k="Año" v={data.anio} />
        <Item k="Color" v={data.color} />
        {data.dueno && <Item k="Dueño" v={`${data.dueno.nombre} (${data.dueno.rut})`} />}
        <Item k="Última entrada" v={fmt(data.ultimaEntrada)} />
        <Item k="Última salida" v={fmt(data.ultimaSalida)} />
        <Item k="Veces este mes" v={data.vecesEsteMes} />
        <Item k="Movimientos totales" v={data.totalEventos} />
      </div>

      {claves.length > 0 && (
        <>
          <button className="ver-detalle-btn" onClick={() => setAbierto((a) => !a)}>
            {abierto ? 'Ocultar detalle ▲' : 'Ver detalle completo ▼'}
          </button>
          {abierto && (
            <div className="detalle-full">
              {claves.map((k) => (
                <div className="item" key={k}>
                  <div className="k">{etiqueta(k)}</div>
                  <div className="v">{valor(detalle[k])}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
