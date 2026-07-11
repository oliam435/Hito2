import React from 'react';

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Mapa de calor: día de la semana (filas) × hora del día (columnas).
export default function Heatmap({ matriz }) {
  const max = Math.max(1, ...matriz.flat());

  return (
    <div className="chart">
      <h3>Mapa de calor · día × hora</h3>
      <div className="hint">Intensidad de movimientos por día de la semana y hora.</div>
      <div className="heatmap">
        <div className="hm-corner" />
        {Array.from({ length: 24 }, (_, h) => (
          <div key={`h${h}`} className="hm-hlabel">{h % 3 === 0 ? h : ''}</div>
        ))}
        {matriz.map((fila, dow) => (
          <React.Fragment key={dow}>
            <div className="hm-dlabel">{DIAS[dow]}</div>
            {fila.map((n, h) => {
              const alpha = n === 0 ? 0 : 0.15 + 0.85 * (n / max);
              return (
                <div
                  key={h}
                  className="hm-cell"
                  title={`${DIAS[dow]} ${String(h).padStart(2, '0')}:00 — ${n} mov.`}
                  style={n > 0 ? { background: `rgba(200,16,46,${alpha})` } : undefined}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
