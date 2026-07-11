import TraficoChart from './TraficoChart.jsx';
import Heatmap from './Heatmap.jsx';
import HeatmapDia from './HeatmapDia.jsx';

const PERIODOS = [
  { id: 'dia', label: 'Día' },
  { id: 'semana', label: 'Semana' },
  { id: 'mes', label: 'Mes' },
  { id: 'anio', label: 'Año' },
];

const ETIQUETA = { dia: 'del día', semana: 'de la semana', mes: 'del mes', anio: 'del año' };

function Delta({ pct }) {
  if (pct == null) return null;
  const up = pct >= 0;
  return (
    <span className={`delta ${up ? 'up' : 'down'}`} title="vs. período anterior">
      {up ? '▲' : '▼'} {Math.abs(pct)}%
    </span>
  );
}

export default function EstadisticasPanel({ stats, periodo, onPeriodo }) {
  const etiqueta = ETIQUETA[periodo] || '';
  const horaPicoTxt =
    stats && stats.horaPico != null ? `${String(stats.horaPico).padStart(2, '0')}:00` : '—';
  const actualizado = stats
    ? new Date(stats.generadoEn).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div>
      <div className="periodo-tabs">
        {PERIODOS.map((p) => (
          <button key={p.id} className={p.id === periodo ? 'activo' : ''} onClick={() => onPeriodo(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      {!stats ? (
        <div className="card empty">Cargando estadísticas…</div>
      ) : (
        <>
          <div className="stats-meta">
            Datos {etiqueta} · actualizado {actualizado} hs
          </div>

          <div className="stats-cards">
            <div className="stat primary">
              <div className="num">{stats.adentroAhora}</div>
              <div className="lbl">Vehículos adentro ahora</div>
            </div>
            <div className="stat">
              <div className="num">
                {stats.movimientos}
                <Delta pct={stats.deltaPct} />
              </div>
              <div className="lbl">Movimientos {etiqueta}</div>
            </div>
            <div className="stat azul">
              <div className="num">{stats.vehiculosActivos}</div>
              <div className="lbl">Vehículos {etiqueta}</div>
            </div>
            <div className="stat dorado">
              <div className="num">{horaPicoTxt}</div>
              <div className="lbl">Hora pico de entrada</div>
            </div>
          </div>

          <TraficoChart
            entradas={stats.porHoraEntradas}
            salidas={stats.porHoraSalidas}
            etiqueta={etiqueta}
          />

          {periodo === 'dia' ? (
            <HeatmapDia valores={stats.ultimas24h} labels={stats.ultimas24hLabels} />
          ) : (
            <Heatmap matriz={stats.heatmap} />
          )}
        </>
      )}
    </div>
  );
}
