import { useState, useMemo } from 'react';

function fmt(ts) {
  return ts ? new Date(ts).toLocaleString('es-CL') : '—';
}

export default function HistorialTable({ items, onSelect }) {
  const [busqueda, setBusqueda] = useState('');
  const [hora, setHora] = useState('todas');

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return items.filter((v) => {
      const texto = `${v.patente} ${v.marca || ''} ${v.modelo || ''} ${v.color || ''}`.toLowerCase();
      const coincideTexto = !q || texto.includes(q);
      const coincideHora = hora === 'todas' || (v.horas || []).includes(Number(hora));
      return coincideTexto && coincideHora;
    });
  }, [items, busqueda, hora]);

  return (
    <div>
      <div className="filtros">
        <input
          type="text"
          placeholder="Buscar por patente, marca, modelo o color…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select value={hora} onChange={(e) => setHora(e.target.value)}>
          <option value="todas">Todas las horas</option>
          {Array.from({ length: 24 }, (_, h) => (
            <option key={h} value={h}>{String(h).padStart(2, '0')}:00 hs</option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <div className="card empty">
          {items.length === 0 ? 'Todavía no hay vehículos registrados.' : 'Sin resultados para el filtro.'}
        </div>
      ) : (
        <table className="tabla">
          <thead>
            <tr>
              <th>Patente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Color</th>
              <th>Veces (mes)</th>
              <th>Última entrada</th>
              <th>Última salida</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((v) => (
              <tr key={v.patente} className="fila-click" onClick={() => onSelect(v.patente)} title="Ver detalle">
                <td className="pat">{v.patente}</td>
                <td>{v.marca || '—'}</td>
                <td>{v.modelo || '—'}</td>
                <td>{v.color || '—'}</td>
                <td><span className="pill">{v.vecesEsteMes}</span></td>
                <td>{fmt(v.ultimaEntrada)}</td>
                <td>{fmt(v.ultimaSalida)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
