// Heatmap de una fila: movimientos por hora en las últimas 24 horas.
export default function HeatmapDia({ valores, labels }) {
  const max = Math.max(1, ...valores);

  return (
    <div className="chart">
      <h3>Actividad · últimas 24 horas</h3>
      <div className="hint">Intensidad de movimientos hora por hora en las últimas 24 h.</div>
      <div className="heatmap-dia">
        {valores.map((n, i) => {
          const alpha = n === 0 ? 0 : 0.15 + 0.85 * (n / max);
          return (
            <div
              key={i}
              className="hm-cell"
              title={`${labels[i]}:00 hs — ${n} mov.`}
              style={n > 0 ? { background: `rgba(200,16,46,${alpha})` } : undefined}
            />
          );
        })}
      </div>
      <div className="heatmap-dia-axis">
        {labels.map((l, i) => (
          <span key={i}>{i % 3 === 0 ? l : ''}</span>
        ))}
      </div>
    </div>
  );
}
