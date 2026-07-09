import TraficoChart from './TraficoChart.jsx';

const PERIODOS = [
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'anio', label: 'Año' },
];

const ETIQUETA = {
  dia: 'del día',
  semana: 'de la semana',
  mes: 'del mes',
  anio: 'del año',
};

export default function EstadisticasPanel({ stats, periodo, onPeriodo }) {
  const etiqueta = ETIQUETA[periodo] || '';

  return (
    <div>
      <div className="periodo-tabs">
        {PERIODOS.map((p) => (
          <button
            key={p.id}
            className={p.id === periodo ? 'activo' : ''}
            onClick={() => onPeriodo(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!stats ? (
        <div className="card empty">Cargando estadísticas…</div>
      ) : (
        <>
          <div className="stats-cards">
            <div className="stat">
              <div className="num">{stats.movimientos}</div>
              <div className="lbl">Movimientos {etiqueta}</div>
            </div>
            <div className="stat azul">
              <div className="num">{stats.vehiculosActivos}</div>
              <div className="lbl">Vehículos {etiqueta}</div>
            </div>
            <div className="stat">
              <div className="num">{stats.vehiculosTotales}</div>
              <div className="lbl">Vehículos registrados</div>
            </div>
            <div className="stat dorado">
              <div className="num">
                {stats.horaPico != null ? `${String(stats.horaPico).padStart(2, '0')}:00 hs` : '—'}
              </div>
              <div className="lbl">Hora pico de entrada</div>
            </div>
          </div>
          <TraficoChart porHora={stats.porHora} horaPico={stats.horaPico} etiqueta={etiqueta} />
        </>
      )}
    </div>
  );
}
