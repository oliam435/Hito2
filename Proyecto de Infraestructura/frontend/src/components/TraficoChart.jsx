import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Gráfico de área: entradas vs salidas por hora del día (0..23).
export default function TraficoChart({ entradas, salidas, etiqueta = '' }) {
  const labels = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
  const grid = 'rgba(128,128,140,0.15)';
  const tick = '#8a94a6';

  const data = {
    labels,
    datasets: [
      {
        label: 'Entradas',
        data: entradas,
        borderColor: '#C8102E',
        backgroundColor: 'rgba(200,16,46,0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
      {
        label: 'Salidas',
        data: salidas,
        borderColor: '#0F4C8C',
        backgroundColor: 'rgba(15,76,140,0.10)',
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { labels: { color: tick, usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
      tooltip: { callbacks: { title: (it) => `${it[0].label}:00 hs` } },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: tick,
          maxRotation: 0,
          callback: (_, i) => (i % 3 === 0 ? labels[i] : ''),
        },
      },
      y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tick, precision: 0 } },
    },
  };

  return (
    <div className="chart">
      <h3>Tráfico por hora {etiqueta}</h3>
      <div className="hint">Entradas vs. salidas por hora del día.</div>
      <div style={{ height: '230px' }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
