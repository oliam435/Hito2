// Gráfico de barras: entradas por hora del día (0..23) dentro del período
export default function TraficoChart({ porHora, horaPico, etiqueta = '' }) {
  const max = Math.max(1, ...porHora);
  return (
    <div className="chart">
      <h3>Horarios con más tráfico vehicular</h3>
      <div className="hint">
        Entradas por hora {etiqueta}.{' '}
        {horaPico != null && (
          <strong>Hora pico: {String(horaPico).padStart(2, '0')}:00 hs.</strong>
        )}
      </div>
      <div className="bars">
        {porHora.map((n, h) => (
          <div
            key={h}
            className={`bar ${h === horaPico ? 'peak' : ''}`}
            style={{ height: `${(n / max) * 100}%` }}
            title={`${String(h).padStart(2, '0')}:00 — ${n} ingreso(s)`}
          />
        ))}
      </div>
      <div className="bars-axis">
        {porHora.map((_, h) => (
          <span key={h}>{h % 3 === 0 ? h : ''}</span>
        ))}
      </div>
    </div>
  );
}
